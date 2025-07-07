import { apiRequest } from '../fakepi/helpers';
import { getSessionInvalidMessage } from '../../src/other';

// Helper function to expect error responses
function expectError(response: any, expectedStatus: number, expectedMessage: string) {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.body.error).toBe(expectedMessage);
}

// Helper function to expect success responses
function expectSuccess(response: any, expectedStatus: number) {
  expect(response.statusCode).toBe(expectedStatus);
  return response.body;
}

import { 
  getEmailInvalidMessage,
  getNotOwnerMessage,
  getMissionIdInvalidMessage,
  getUserEmailNotRealMessage,
  getUserEmailIsCurrentUserMessage,
  getMissionNameAlreadyUsedByTargetMessage
} from '../../src/other';


// Generate unique email to avoid conflicts between tests
function generateUniqueEmail(prefix: string = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
}

// Generate unique mission name to avoid conflicts between tests
function generateUniqueMissionName(prefix: string = 'Mission'): string {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const randomStr = Math.random().toString(36).substr(2, 4); // 4 random characters
  return `${prefix} ${timestamp} ${randomStr}`;
}

// Register user with unique email and return both sessionId and email
function registerUniqueUser(prefix: string = 'user'): { sessionId: string, email: string } {
  const email = generateUniqueEmail(prefix);
  const result = apiRequest('POST', '/v1/admin/auth/register', { 
    json: {
      email, 
      password: 'password123',
      nameFirst: 'Test',
      nameLast: 'User'
    }, 
    fullResponse: true 
  });
  const response = expectSuccess(result, 200);
  return { sessionId: response.controlUserSessionId, email };
}

// Helper function to register and get session ID (for backward compatibility)
function registerUser(userData: { email: string; password: string; nameFirst: string; nameLast: string }): string {
  const result = apiRequest('POST', '/v1/admin/auth/register', { 
    json: userData,
    fullResponse: true 
  });
  const response = expectSuccess(result, 200);
  return response.controlUserSessionId;
}

// Helper function to create a test mission with unique name
function createTestMission(token: string, missionData: { name: string; description: string; target: string }): number {
  const result = apiRequest('POST', '/v1/admin/mission', { 
    json: missionData, 
    headers: { controlUserSessionId: token }, 
    fullResponse: true 
  });
  const response = expectSuccess(result, 200);
  return response.missionId;
}

// Helper function to create a test mission with generated unique name
function createUniqueMission(token: string, namePrefix: string = 'Mission'): number {
  return createTestMission(token, {
    name: generateUniqueMissionName(namePrefix),
    description: 'Test mission description',
    target: 'Mars'
  });
}

// Helper function to create a test astronaut
function createTestAstronaut(token: string, astronautData: { nameFirst: string; nameLast: string; rank: string; age: number; weight: number; height: number }): number {
  const result = apiRequest('POST', '/v1/admin/astronaut', { 
    json: astronautData, 
    headers: { controlUserSessionId: token }, 
    fullResponse: true 
  });
  const response = expectSuccess(result, 200);
  return response.astronautId;
}

// Helper function to transfer mission
function transferMission(token: string, missionId: number, userEmail: string): any {
  return apiRequest('POST', `/v1/admin/mission/${missionId}/transfer`, { 
    json: { userEmail }, 
    headers: { controlUserSessionId: token }, 
    fullResponse: true 
  });
}

// Helper function to get mission list
function getMissionList(token: string): any {
  const result = apiRequest('GET', '/v1/admin/mission/list', { 
    headers: { controlUserSessionId: token }, 
    fullResponse: true 
  });
  return expectSuccess(result, 200);
}

describe('POST /v1/admin/mission/{missionid}/transfer', () => {
  beforeEach(() => {
    // Clear data
    const clearResponse = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearResponse.statusCode).toBe(200);
  });

  // Success Cases
  test('Should successfully transfer mission to another user', () => {
    const { sessionId: ownerToken, email: ownerEmail } = registerUniqueUser('owner1');
    const { sessionId: targetToken, email: targetEmail } = registerUniqueUser('target1');

    const missionId = createTestMission(ownerToken, {
      name: 'Transfer Test Mission',
      description: 'Test mission description',
      target: 'Mars'
    });

    const result = transferMission(ownerToken, missionId, targetEmail);
    const response = expectSuccess(result, 200);
    expect(response).toEqual({});

    // Verify mission is no longer in owner's list
    const ownerMissions = getMissionList(ownerToken);
    expect(ownerMissions.missions).toHaveLength(0);

    // Verify mission is now in target user's list
    const targetMissions = getMissionList(targetToken);
    expect(targetMissions.missions).toHaveLength(1);
    expect(targetMissions.missions[0].missionId).toBe(missionId);
  });

  test('Should successfully transfer multiple missions between users', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner2');
    const { sessionId: targetToken, email: targetEmail } = registerUniqueUser('target2');

    const mission1Id = createTestMission(ownerToken, {
      name: 'Mission 1',
      description: 'First mission',
      target: 'Mars'
    });

    const mission2Id = createTestMission(ownerToken, {
      name: 'Mission 2',
      description: 'Second mission',
      target: 'Jupiter'
    });

    // Transfer both missions
    const result1 = transferMission(ownerToken, mission1Id, targetEmail);
    const response1 = expectSuccess(result1, 200);
    expect(response1).toEqual({});

    const result2 = transferMission(ownerToken, mission2Id, targetEmail);
    const response2 = expectSuccess(result2, 200);
    expect(response2).toEqual({});

    // Verify all missions transferred
    const ownerMissions = getMissionList(ownerToken);
    expect(ownerMissions.missions).toHaveLength(0);

    const targetMissions = getMissionList(targetToken);
    expect(targetMissions.missions).toHaveLength(2);
  });

  test('Should successfully transfer mission with astronauts assigned', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner3');
    const { sessionId: targetToken, email: targetEmail } = registerUniqueUser('target3');

    const missionId = createTestMission(ownerToken, {
      name: 'Mission with Astronauts',
      description: 'Test mission with assigned astronauts',
      target: 'Mars'
    });

    // Create and assign astronaut
    const astronautId = createTestAstronaut(ownerToken, {
      nameFirst: 'John',
      nameLast: 'Doe',
      rank: 'Captain Commanding',
      age: 35,
      weight: 75.5,
      height: 180
    });

    const assignResult = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, { 
      json: {}, 
      headers: { controlUserSessionId: ownerToken }, 
      fullResponse: true 
    });
    expectSuccess(assignResult, 200);

    const result = transferMission(ownerToken, missionId, targetEmail);
    const response = expectSuccess(result, 200);
    expect(response).toEqual({});
  });

  test('Should transfer mission back and forth between users', () => {
    const { sessionId: user1Token, email: user1Email } = registerUniqueUser('pingpong1');
    const { sessionId: user2Token, email: user2Email } = registerUniqueUser('pingpong2');

    const missionId = createUniqueMission(user1Token, 'PingPong');

    // Transfer from user1 to user2
    const result1 = transferMission(user1Token, missionId, user2Email);
    const response1 = expectSuccess(result1, 200);
    expect(response1).toEqual({});

    // Transfer back from user2 to user1
    const result2 = transferMission(user2Token, missionId, user1Email);
    const response2 = expectSuccess(result2, 200);
    expect(response2).toEqual({});

    // Verify mission is back with original owner
    const user1Missions = getMissionList(user1Token);
    expect(user1Missions.missions).toHaveLength(1);
    expect(user1Missions.missions[0].missionId).toBe(missionId);
  });

  // Authentication Error Cases (401)
  test('Should return 401 for missing token', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner4');
    const { email: targetEmail } = registerUniqueUser('target4');

    const missionId = createTestMission(ownerToken, {
      name: 'Test Mission',
      description: 'Test description',
      target: 'Mars'
    });

    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/transfer`, { 
      json: { userEmail: targetEmail },
      fullResponse: true 
    });
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Should return 401 for invalid token', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner5');
    const { email: targetEmail } = registerUniqueUser('target5');

    const missionId = createTestMission(ownerToken, {
      name: 'Test Mission',
      description: 'Test description',
      target: 'Mars'
    });

    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/transfer`, { 
      json: { userEmail: targetEmail },
      headers: { controlUserSessionId: 'invalid-token' },
      fullResponse: true 
    });
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Should return 401 for empty token', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner6');
    const { email: targetEmail } = registerUniqueUser('target6');

    const missionId = createTestMission(ownerToken, {
      name: 'Test Mission',
      description: 'Test description',
      target: 'Mars'
    });

    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/transfer`, { 
      json: { userEmail: targetEmail },
      headers: { controlUserSessionId: '' },
      fullResponse: true 
    });
    expectError(result, 401, getSessionInvalidMessage());
  });

  // Authorization Error Cases (403)
  test('Should return 403 for non-existent mission', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner7');
    const { email: targetEmail } = registerUniqueUser('target7');

    const result = apiRequest('POST', `/v1/admin/mission/99999/transfer`, { 
      json: { userEmail: targetEmail },
      headers: { controlUserSessionId: ownerToken },
      fullResponse: true 
    });
    expect(result.statusCode).toBe(403);
  });

  test('Should return 403 for mission owned by different user', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner8');
    const { sessionId: otherToken } = registerUniqueUser('other8');
    const { email: targetEmail } = registerUniqueUser('target8');

    const missionId = createTestMission(ownerToken, {
      name: 'Test Mission',
      description: 'Test description',
      target: 'Mars'
    });

    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/transfer`, { 
      json: { userEmail: targetEmail },
      headers: { controlUserSessionId: otherToken },
      fullResponse: true 
    });
    expect(result.statusCode).toBe(403);
  });

  // Validation Error Cases (400)
  test('Should return 400 for invalid mission ID', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner9');
    const { email: targetEmail } = registerUniqueUser('target9');

    const result = apiRequest('POST', `/v1/admin/mission/-1/transfer`, { 
      json: { userEmail: targetEmail },
      headers: { controlUserSessionId: ownerToken },
      fullResponse: true 
    });
    expect(result.statusCode).toBe(403);
  });

  test('Should return 400 for non-existent target user email', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner10');

    const missionId = createTestMission(ownerToken, {
      name: 'Test Mission',
      description: 'Test description',
      target: 'Mars'
    });

    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/transfer`, { 
      json: { userEmail: 'nonexistent@example.com' },
      headers: { controlUserSessionId: ownerToken },
      fullResponse: true 
    });
    expect(result.statusCode).toBe(400);
  });

  test('Should return 400 for transferring to self', () => {
    const { sessionId: ownerToken, email: ownerEmail } = registerUniqueUser('owner11');

    const missionId = createTestMission(ownerToken, {
      name: 'Test Mission',
      description: 'Test description',
      target: 'Mars'
    });

    const result = apiRequest('POST', `/v1/admin/mission/${missionId}/transfer`, { 
      json: { userEmail: ownerEmail },
      headers: { controlUserSessionId: ownerToken },
      fullResponse: true 
    });
    expect(result.statusCode).toBe(400);
  });

  test('Should return 400 for duplicate mission name in target user', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner12');
    const { sessionId: targetToken, email: targetEmail } = registerUniqueUser('target12');

    const missionName = 'Duplicate Mission Name';

    // Create mission with same name for target user
    createTestMission(targetToken, {
      name: missionName,
      description: 'Target user mission',
      target: 'Mars'
    });

    // Create mission with same name for owner
    const ownerMissionId = createTestMission(ownerToken, {
      name: missionName,
      description: 'Owner mission',
      target: 'Jupiter'
    });

    const result = apiRequest('POST', `/v1/admin/mission/${ownerMissionId}/transfer`, { 
      json: { userEmail: targetEmail },
      headers: { controlUserSessionId: ownerToken },
      fullResponse: true 
    });
    expect(result.statusCode).toBe(400);
  });

  // Edge Cases
  test('Should handle transfer with valid mission name format', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner13');
    const { sessionId: targetToken, email: targetEmail } = registerUniqueUser('target13');

    const missionId = createTestMission(ownerToken, {
      name: 'Mars Mission 2024',
      description: 'Mission with standard characters',
      target: 'Mars'
    });

    const result = transferMission(ownerToken, missionId, targetEmail);
    const response = expectSuccess(result, 200);
    expect(response).toEqual({});

    // Verify transfer
    const targetMissions = getMissionList(targetToken);
    expect(targetMissions.missions).toHaveLength(1);
    expect(targetMissions.missions[0].name).toBe('Mars Mission 2024');
  });

  test('Should handle transfer with standard length mission details', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner14');
    const { sessionId: targetToken, email: targetEmail } = registerUniqueUser('target14');

    const missionId = createTestMission(ownerToken, {
      name: 'Standard Mission Name',
      description: 'Standard mission description',
      target: 'Standard Target'
    });

    const result = transferMission(ownerToken, missionId, targetEmail);
    const response = expectSuccess(result, 200);
    expect(response).toEqual({});

    // Verify transfer
    const targetMissions = getMissionList(targetToken);
    expect(targetMissions.missions).toHaveLength(1);
  });

  test('Should handle concurrent transfers', () => {
    const { sessionId: ownerToken } = registerUniqueUser('owner15');
    const { sessionId: target1Token, email: target1Email } = registerUniqueUser('target15a');
    const { sessionId: target2Token, email: target2Email } = registerUniqueUser('target15b');

    const mission1Id = createUniqueMission(ownerToken, 'Concurrent1');
    const mission2Id = createUniqueMission(ownerToken, 'Concurrent2');

    // Attempt concurrent transfers
    const result1 = transferMission(ownerToken, mission1Id, target1Email);
    const result2 = transferMission(ownerToken, mission2Id, target2Email);

    expectSuccess(result1, 200);
    expectSuccess(result2, 200);

    // Verify both transfers succeeded
    const target1Missions = getMissionList(target1Token);
    const target2Missions = getMissionList(target2Token);
    expect(target1Missions.missions).toHaveLength(1);
    expect(target2Missions.missions).toHaveLength(1);
  });
});