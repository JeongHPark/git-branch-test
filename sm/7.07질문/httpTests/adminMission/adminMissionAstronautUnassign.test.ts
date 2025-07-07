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
  getAstronautNotAssignedMessage,
  getMissionNotOwnedOrNotExistMessage
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

describe('DELETE /v1/admin/mission/{missionid}/assign/{astronautid}', () => {
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
      name: 'Apollo Mission',
      description: 'Test mission to the moon',
      target: 'Moon'
    });

    // Create test astronaut
    astronautId = createTestAstronaut(userToken, {
      nameFirst: 'James',
      nameLast: 'Kirk',
      rank: 'Captain',
      age: 35,
      weight: 75.5,
      height: 180
    });

    // Assign astronaut to mission for most tests
    const assignResult = assignAstronautToMission(userToken, missionId, astronautId);
    expect(assignResult.statusCode).toBe(200);
  });

  // Success Cases
  test('Should successfully unassign astronaut from mission', () => {
    // Unassign the astronaut (already assigned in beforeEach)
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({});
  });

  test('Should remove astronaut from mission details', () => {
    // Verify astronaut is initially assigned
    let missionResult = apiRequest('GET', `/v1/admin/mission/${missionId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(missionResult.statusCode).toBe(200);
    expect((missionResult.body as any).assignedAstronauts).toHaveLength(1);

    // Unassign astronaut
    const unassignResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(unassignResult.statusCode).toBe(200);
    
    // Verify astronaut is removed from mission
    missionResult = apiRequest('GET', `/v1/admin/mission/${missionId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(missionResult.statusCode).toBe(200);
    expect((missionResult.body as any).assignedAstronauts).toHaveLength(0);
  });

  test('Should remove mission from astronaut details', () => {
    // Verify astronaut is initially assigned
    let astronautResult = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(astronautResult.statusCode).toBe(200);
    expect((astronautResult.body as any).assignedMission).toBeDefined();

    // Unassign astronaut
    const unassignResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(unassignResult.statusCode).toBe(200);
    
    // Verify mission is removed from astronaut
    astronautResult = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(astronautResult.statusCode).toBe(200);
    expect((astronautResult.body as any).assignedMission).toBeNull();
  });

  test('Should show astronaut as unassigned in pool list', () => {
    // Verify astronaut is initially assigned
    let poolResult = apiRequest('GET', '/v1/admin/astronaut/pool', { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(poolResult.statusCode).toBe(200);
    let assignedAstronaut = (poolResult.body as any).astronauts.find((a: any) => a.astronautId === astronautId);
    expect(assignedAstronaut.assigned).toBe(true);

    // Unassign astronaut
    const unassignResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(unassignResult.statusCode).toBe(200);
    
    // Verify astronaut shows as unassigned
    poolResult = apiRequest('GET', '/v1/admin/astronaut/pool', { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(poolResult.statusCode).toBe(200);
    assignedAstronaut = (poolResult.body as any).astronauts.find((a: any) => a.astronautId === astronautId);
    expect(assignedAstronaut.assigned).toBe(false);
  });

  // Authentication Error Cases
  test('Should return 401 for missing token', () => {
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, { 
      fullResponse: true 
    });
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Should return 401 for invalid token', () => {
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, { 
      headers: { controlUserSessionId: 'invalid-token' }, 
      fullResponse: true 
    });
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Should return 401 for empty token', () => {
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, { 
      headers: { controlUserSessionId: '' }, 
      fullResponse: true 
    });
    expectError(result, 401, getSessionInvalidMessage());
  });

  // Authorization Error Cases
  test('Should return 403 for non-existent mission', () => {
    const result = apiRequest('DELETE', `/v1/admin/mission/99999/assign/${astronautId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(result.statusCode).toBe(403);
  });

  test('Should return 403 for mission owned by different user', () => {
    // Create another user and their mission
    const otherUserToken = createTestUser({
      email: 'other@example.com',
      password: 'password456',
      nameFirst: 'Jane',
      nameLast: 'Smith'
    });

    const otherMissionId = createTestMission(otherUserToken, {
      name: 'Other Mission',
      description: 'Mission by other user',
      target: 'Mars'
    });

    // Try to unassign astronaut from other user's mission
    const result = apiRequest('DELETE', `/v1/admin/mission/${otherMissionId}/assign/${astronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(result.statusCode).toBe(403);
  });

  // Validation Error Cases
  test('Should return 400 for invalid astronaut ID', () => {
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/99999`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(result.statusCode).toBe(400);
  });

  test('Should return 400 when astronaut is not assigned to the mission', () => {
    // Create another astronaut that is not assigned
    const unassignedAstronautId = createTestAstronaut(userToken, {
      nameFirst: 'Spock',
      nameLast: 'Vulcan',
      rank: 'Commander',
      age: 40,
      weight: 70.0,
      height: 185
    });

    // Try to unassign astronaut that was never assigned
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${unassignedAstronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(result.statusCode).toBe(400);
  });

  test('Should return 400 when trying to unassign already unassigned astronaut', () => {
    // First unassignment should succeed
    const firstUnassignResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(firstUnassignResult.statusCode).toBe(200);
    
    // Second unassignment should fail
    const secondUnassignResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(secondUnassignResult.statusCode).toBe(400);
    expect(secondUnassignResult.body).toHaveProperty('error');
    expect((secondUnassignResult.body as any).error).toBe(getAstronautNotAssignedMessage());
  });

  // Multiple Astronauts Unassignment Tests
  test('Should unassign specific astronaut while keeping others assigned', () => {
    // Create second astronaut and assign to same mission
    const secondAstronautId = createTestAstronaut(userToken, {
      nameFirst: 'Spock',
      nameLast: 'Vulcan',
      rank: 'Commander',
      age: 40,
      weight: 70.0,
      height: 185
    });

    assignAstronautToMission(userToken, missionId, secondAstronautId);

    // Verify both are assigned
    let missionResult = apiRequest('GET', `/v1/admin/mission/${missionId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(missionResult.statusCode).toBe(200);
    expect((missionResult.body as any).assignedAstronauts).toHaveLength(2);

    // Unassign first astronaut
    const unassignResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(unassignResult.statusCode).toBe(200);
    
    // Verify only second astronaut remains
    missionResult = apiRequest('GET', `/v1/admin/mission/${missionId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(missionResult.statusCode).toBe(200);
    expect((missionResult.body as any).assignedAstronauts).toHaveLength(1);
    expect((missionResult.body as any).assignedAstronauts[0].astronautId).toBe(secondAstronautId);
  });

  // Edge Cases
  test('Should handle unassignment of astronaut with special characters in name', () => {
    // Create astronaut with special characters
    const specialAstronautId = createTestAstronaut(userToken, {
      nameFirst: "Jean-Luc",
      nameLast: "O'Connor",
      rank: 'Captain',
      age: 45,
      weight: 80.0,
      height: 175
    });

    // Assign astronaut
    assignAstronautToMission(userToken, missionId, specialAstronautId);

    // Unassign astronaut
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${specialAstronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({});
    
    // Verify unassignment
    const missionResult = apiRequest('GET', `/v1/admin/mission/${missionId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(missionResult.statusCode).toBe(200);
    
    const specialAstronaut = (missionResult.body as any).assignedAstronauts.find(
      (a: any) => a.astronautId === specialAstronautId
    );
    expect(specialAstronaut).toBeUndefined();
  });

  test('Should handle concurrent assignment and unassignment operations', () => {
    // Create multiple astronauts
    const astronaut2Id = createTestAstronaut(userToken, {
      nameFirst: 'Spock',
      nameLast: 'Vulcan',
      rank: 'Commander',
      age: 40,
      weight: 70.0,
      height: 185
    });

    const astronaut3Id = createTestAstronaut(userToken, {
      nameFirst: 'Leonard',
      nameLast: 'McCoy',
      rank: 'Doctor',
      age: 42,
      weight: 72.5,
      height: 175
    });

    // Assign multiple astronauts
    assignAstronautToMission(userToken, missionId, astronaut2Id);
    assignAstronautToMission(userToken, missionId, astronaut3Id);

    // Verify all are assigned
    let missionResult = apiRequest('GET', `/v1/admin/mission/${missionId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(missionResult.statusCode).toBe(200);
    expect((missionResult.body as any).assignedAstronauts).toHaveLength(3);

    // Unassign middle astronaut
    const unassignResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronaut2Id}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(unassignResult.statusCode).toBe(200);
    
    // Verify correct astronauts remain
    missionResult = apiRequest('GET', `/v1/admin/mission/${missionId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(missionResult.statusCode).toBe(200);
    expect((missionResult.body as any).assignedAstronauts).toHaveLength(2);
    
    const remainingIds = (missionResult.body as any).assignedAstronauts.map((a: any) => a.astronautId);
    expect(remainingIds).toContain(astronautId);
    expect(remainingIds).toContain(astronaut3Id);
    expect(remainingIds).not.toContain(astronaut2Id);
  });

  test('Should allow reassignment after unassignment', () => {
    // Unassign astronaut
    const unassignResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(unassignResult.statusCode).toBe(200);
    
    // Verify astronaut is unassigned
    let astronautResult = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(astronautResult.statusCode).toBe(200);
    expect((astronautResult.body as any).assignedMission).toBeNull();

    // Reassign astronaut to same mission
    const reassignResult = assignAstronautToMission(userToken, missionId, astronautId);
    expect(reassignResult.statusCode).toBe(200);
    
    // Verify astronaut is reassigned
    astronautResult = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(astronautResult.statusCode).toBe(200);
    expect((astronautResult.body as any).assignedMission).toBeDefined();
    expect((astronautResult.body as any).assignedMission.missionId).toBe(missionId);
  });

  test('Should handle unassignment from mission with different targets and names', () => {
    // Create mission with different target and name format
    const specialMissionId = createTestMission(userToken, {
      name: 'ISS Resupply 2025',
      description: 'International Space Station resupply mission with special cargo',
      target: 'Low Earth Orbit ISS'
    });
    
    // Create new astronaut and assign to special mission
    const specialAstronautId = createTestAstronaut(userToken, {
      nameFirst: 'Data',
      nameLast: 'Soong',
      rank: 'Lieutenant',
      age: 35,
      weight: 75.0,
      height: 180
    });
    assignAstronautToMission(userToken, specialMissionId, specialAstronautId);
    
    // Verify assignment with special objective format
    let astronautResult = apiRequest('GET', `/v1/admin/astronaut/${specialAstronautId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(astronautResult.statusCode).toBe(200);
    expect((astronautResult.body as any).assignedMission.objective).toBe('[Low Earth Orbit ISS] ISS Resupply 2025');
    
    // Unassign astronaut from special mission
    const unassignResult = apiRequest('DELETE', `/v1/admin/mission/${specialMissionId}/assign/${specialAstronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(unassignResult.statusCode).toBe(200);
    
    // Verify unassignment
    astronautResult = apiRequest('GET', `/v1/admin/astronaut/${specialAstronautId}`, { 
      headers: { controlUserSessionId: userToken }, 
      fullResponse: true 
    });
    expect(astronautResult.statusCode).toBe(200);
    expect((astronautResult.body as any).assignedMission).toBeNull();
  });
});