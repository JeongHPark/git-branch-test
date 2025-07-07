import { apiRequest } from '../fakepi/helpers';
import { 
  getSessionInvalidMessage,
  getNotOwnerMessage,
  getMissionIdInvalidMessage,
  getMissionHasAstronautsMessage
} from '../../src/other';

// Helper function to expect error responses
function expectError(response: any, expectedStatus: number, expectedMessage: string) {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.body.error).toBe(expectedMessage);
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
function createTestMission(token: string, missionData: { name: string; description: string; target: string }): number {
  const result = apiRequest('POST', '/v1/admin/mission', {
    json: missionData,
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(result.statusCode).toBe(200);
  return result.body.missionId;
}

// Helper function to create a test astronaut
function createTestAstronaut(token: string, astronautData: { nameFirst: string; nameLast: string; rank: string; age: number; weight: number; height: number }): number {
  const result = apiRequest('POST', '/v1/admin/astronaut', {
    json: astronautData,
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(result.statusCode).toBe(200);
  return result.body.astronautId;
}

// Helper function to assign astronaut to mission
function assignAstronautToMission(token: string, missionId: number, astronautId: number): void {
  const result = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
    json: {},
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(result.statusCode).toBe(200);
}

describe('DELETE /v1/admin/mission/{missionid}', () => {
  let userToken: string;
  let missionId: number;
  let astronautId: number;

  beforeEach(() => {
    // Clear data
    const clearResponse = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearResponse.statusCode).toBe(200);
    
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
  });

  // Success Cases
  test('Should successfully remove mission by owner', () => {
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({});
  });

  test('Should remove mission from mission list', () => {
    // Remove mission
    const removeResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(removeResult.statusCode).toBe(200);
    expect(removeResult.body).toEqual({});

    // Verify mission is removed from list
    const listResult = apiRequest('GET', '/v1/admin/mission/list', {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(listResult.statusCode).toBe(200);
    expect(listResult.body.missions).toHaveLength(0);
  });

  test('Should remove specific mission when user has multiple missions', () => {
    // Create second mission
    const secondMissionId = createTestMission(userToken, {
      name: 'Mars Mission',
      description: 'Test mission to Mars',
      target: 'Mars'
    });

    // Remove first mission
    const removeResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(removeResult.statusCode).toBe(200);
    expect(removeResult.body).toEqual({});

    // Verify only second mission remains
    const listResult = apiRequest('GET', '/v1/admin/mission/list', {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(listResult.statusCode).toBe(200);
    expect(listResult.body.missions).toHaveLength(1);
    expect(listResult.body.missions[0].missionId).toBe(secondMissionId);
  });

  // Authentication Error Cases (401)
  test('Should return 401 for missing token', () => {
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}`, {
      fullResponse: true
    });
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Should return 401 for invalid token', () => {
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}`, {
      headers: { controlUserSessionId: 'invalid-token' },
      fullResponse: true
    });
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Should return 401 for empty token', () => {
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}`, {
      headers: { controlUserSessionId: '' },
      fullResponse: true
    });
    expectError(result, 401, getSessionInvalidMessage());
  });

  // Authorization Error Cases (403)
  test('Should return 403 for non-existent mission', () => {
    const result = apiRequest('DELETE', '/v1/admin/mission/99999', {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expectError(result, 403, getNotOwnerMessage());
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

    // Try to remove other user's mission
    const result = apiRequest('DELETE', `/v1/admin/mission/${otherMissionId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expectError(result, 403, getNotOwnerMessage());
  });

  // Validation Error Cases (400)
  test('Should return 400 for invalid mission ID', () => {
    const result = apiRequest('DELETE', '/v1/admin/mission/-1', {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expectError(result, 400, getMissionIdInvalidMessage());
  });

  test('Should return 400 when mission has assigned astronauts', () => {
    // Assign astronaut to mission
    assignAstronautToMission(userToken, missionId, astronautId);

    // Try to remove mission with assigned astronaut
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expectError(result, 400, getMissionHasAstronautsMessage());
  });

  test('Should return 403 when trying to remove already removed mission', () => {
    // First removal should succeed
    const firstRemoveResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(firstRemoveResult.statusCode).toBe(200);
    expect(firstRemoveResult.body).toEqual({});

    // Second removal should fail with 403 (mission doesn't exist anymore)
    const result = apiRequest('DELETE', `/v1/admin/mission/${missionId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expectError(result, 403, getNotOwnerMessage());
  });

  test('Should handle mission removal with different mission names and targets', () => {
    // Create mission with different name and target
    const specialMissionId = createTestMission(userToken, {
      name: 'ISS Resupply 2025',
      description: 'International Space Station resupply mission',
      target: 'Low Earth Orbit ISS'
    });

    // Remove special mission
    const result = apiRequest('DELETE', `/v1/admin/mission/${specialMissionId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({});
  });
});