import { apiRequest } from '../fakepi/helpers';
// Helper function to expect error responses
function expectError(response: any, expectedStatus: number, expectedMessage: string) {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.body.error).toBe(expectedMessage);
}

import { 
  getSessionInvalidMessage,
  getNotOwnerMessage,
  getMissionIdInvalidMessage,
  getAstronautIdInvalidMessage,
  getAstronautAlreadyAssignedMessage
} from '../../src/other';


interface TestUser {
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  token?: string;
}

interface TestMission {
  missionId: number;
  name: string;
  description: string;
  target: string;
}

interface TestAstronaut {
  astronautId: number;
  nameFirst: string;
  nameLast: string;
  rank: string;
  age: number;
  weight: number;
  height: number;
}

// Helper function to clear all data
function clearData(): void {
  const result = apiRequest('DELETE', '/clear', { json: {}, fullResponse: true });
  if (result.statusCode !== 200) {
    throw new Error(`Failed to clear data: ${result.statusCode}`);
  }
}

// Helper function to register and login a test user
function createTestUser(userData: { email: string; password: string; nameFirst: string; nameLast: string }): string {
  const registerResult = apiRequest('POST', '/v1/admin/auth/register', {
    json: userData,
    fullResponse: true
  });
  expect(registerResult.statusCode).toBe(200);
  return registerResult.body.controlUserSessionId;
}

// Helper function to create a test mission
function createTestMission(token: string, missionData: Omit<TestMission, 'missionId'>): number {
  const result = apiRequest('POST', '/v1/admin/mission', { 
    json: missionData as any, 
    headers: { controlUserSessionId: token }, 
    fullResponse: true 
  });
  
  if (result.statusCode !== 200) {
    throw new Error(`Failed to create mission: ${result.statusCode}`);
  }
  
  return result.body.missionId;
}

// Helper function to create a test astronaut
function createTestAstronaut(token: string, astronautData: Omit<TestAstronaut, 'astronautId'>): number {
  const result = apiRequest('POST', '/v1/admin/astronaut', { 
    json: astronautData as any, 
    headers: { controlUserSessionId: token }, 
    fullResponse: true 
  });
  
  if (result.statusCode !== 200) {
    throw new Error(`Failed to create astronaut: ${result.statusCode}`);
  }
  
  return result.body.astronautId;
}

// Helper function to assign astronaut to mission
function assignAstronautToMission(token: string, missionId: number, astronautId: number): any {
  return apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
    json: {},
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
}

describe('POST /v1/admin/mission/{missionid}/assign/{astronautid}', () => {
  let userToken: string;
  let missionId: number;
  let astronautId: number;

  beforeEach(() => {
    clearData();
    
    // Create test user
    userToken = createTestUser({
      email: 'test@example.com',
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doe'
    });

    // Create test mission
    missionId = createTestMission(userToken, {
      name: 'Test Mission',
      description: 'Test mission description',
      target: 'Mars'
    });

    // Create test astronaut
    astronautId = createTestAstronaut(userToken, {
      nameFirst: 'James',
      nameLast: 'Kirk',
      rank: 'Captain Commanding',
      age: 35,
      weight: 75.5,
      height: 180
    });
  });

  // Success Cases
  test('Should successfully assign astronaut to mission', () => {
    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
      json: {},
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({});
  });

  test('Should reflect assignment in mission details', () => {
    const assignResult = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
      json: {},
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(assignResult.statusCode).toBe(200);
    
    const missionResult = apiRequest('GET', `/v1/admin/mission/${missionId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(missionResult.statusCode).toBe(200);
    expect(missionResult.body.assignedAstronauts).toHaveLength(1);
    expect(missionResult.body.assignedAstronauts[0].astronautId).toBe(astronautId);
  });

  test('Should reflect assignment in astronaut details', () => {
    const assignResult = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
      json: {},
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(assignResult.statusCode).toBe(200);
    
    const astronautResult = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(astronautResult.statusCode).toBe(200);
    expect(astronautResult.body.assignedMission).toBeDefined();
    expect(astronautResult.body.assignedMission.missionId).toBe(missionId);
  });

  test('Should show astronaut as assigned in pool list', () => {
    const assignResult = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
      json: {},
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(assignResult.statusCode).toBe(200);
    
    const poolResult = apiRequest('GET', '/v1/admin/astronaut/pool', { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(poolResult.statusCode).toBe(200);
    const assignedAstronaut = poolResult.body.astronauts.find((a: any) => a.astronautId === astronautId);
    expect(assignedAstronaut.assigned).toBe(true);
  });

  // Authentication Error Cases (401)
  test('Should return 401 for missing token', () => {
    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, { 
      json: {}, 
      fullResponse: true 
    });
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Should return 401 for invalid token', () => {
    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, { 
      json: {}, 
      headers: { controlUserSessionId: 'invalid-token' }, 
      fullResponse: true 
    });
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Should return 401 for empty token', () => {
    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, { 
      json: {}, 
      headers: { controlUserSessionId: '' }, 
      fullResponse: true 
    });
    expectError(result, 401, getSessionInvalidMessage());
  });

  // Authorization Error Cases (403)
  test('Should return 403 for non-existent mission', () => {
    const result = apiRequest('POST', `/v1/admin/mission/99999/assign/${astronautId}`, { 
      json: {}, 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(result.statusCode).toBe(403);
  });

  test('Should return 403 for mission owned by different user', () => {
    const otherUserToken = createTestUser({
      email: 'other@example.com',
      password: 'password123',
      nameFirst: 'Other',
      nameLast: 'User'
    });

    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, { 
      json: {}, 
      headers: { controlUserSessionId: otherUserToken }, 
      fullResponse: true 
    });
    expect(result.statusCode).toBe(403);
  });

  // Validation Error Cases (400)
  test('Should return 400 for invalid astronaut ID', () => {
    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/99999`, { 
      json: {}, 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(result.statusCode).toBe(400);
  });

  test('Should return 400 when astronaut is already assigned to another mission', () => {
    const otherMissionId = createTestMission(userToken, {
      name: 'Other Mission',
      description: 'Other mission description',
      target: 'Jupiter'
    });

    // Assign astronaut to first mission
    const firstAssignResult = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, { 
      json: {}, 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(firstAssignResult.statusCode).toBe(200);
    
    // Try to assign same astronaut to second mission
    const secondAssignResult = apiRequest('POST', `/v1/admin/mission/${otherMissionId}/assign/${astronautId}`, { 
      json: {}, 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(secondAssignResult.statusCode).toBe(400);
  });

  test('Should return 400 when astronaut is already assigned to the same mission', () => {
    // Assign astronaut to mission
    const firstAssignResult = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, { 
      json: {}, 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(firstAssignResult.statusCode).toBe(200);
    
    // Try to assign same astronaut to same mission again
    const secondAssignResult = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, { 
      json: {}, 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(secondAssignResult.statusCode).toBe(400);
  });

  // Multiple astronauts
  test('Should allow multiple astronauts to be assigned to same mission', () => {
    const secondAstronautId = createTestAstronaut(userToken, {
      nameFirst: 'Spock',
      nameLast: 'Vulcan',
      rank: 'Commander Science',
      age: 30,
      weight: 70.0,
      height: 175
    });

    // Assign first astronaut
    const firstAssignResult = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, { 
      json: {}, 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(firstAssignResult.statusCode).toBe(200);
    
    // Assign second astronaut
    const secondAssignResult = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${secondAstronautId}`, { 
      json: {}, 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(secondAssignResult.statusCode).toBe(200);

    // Verify both are assigned
    const missionResult = apiRequest('GET', `/v1/admin/mission/${missionId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(missionResult.statusCode).toBe(200);
    expect(missionResult.body.assignedAstronauts).toHaveLength(2);
  });

  // Edge Cases
  test('Should handle assignment with special characters in astronaut name', () => {
    // Create astronaut with special characters
    const specialAstronautId = createTestAstronaut(userToken, {
      nameFirst: "Jean-Luc",
      nameLast: "O'Connor",
      rank: 'Captain Commanding',
      age: 45,
      weight: 80.0,
      height: 175
    });

    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${specialAstronautId}`, {
      json: {},
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({});
    
    // Verify assignment shows correct name formatting
    const missionResult = apiRequest('GET', `/v1/admin/mission/${missionId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(missionResult.statusCode).toBe(200);
    expect(missionResult.body.assignedAstronauts[0].name).toBe("Captain Commanding Jean-Luc O'Connor");
  });
});