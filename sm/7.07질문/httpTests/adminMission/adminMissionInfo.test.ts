import { apiRequest } from '../fakepi/helpers';
import { getSessionInvalidMessage, getNotOwnerMessage, getMissionIdInvalidMessage } from '../../src/other';

// Helper function to expect error responses
function expectError(response: any, expectedStatus: number, expectedMessage: string) {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.body.error).toBe(expectedMessage);
}

// Auth functions
function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return apiRequest('POST', '/v1/admin/auth/register', {
    json: {
      email,
      password,
      nameFirst,
      nameLast
    },
    fullResponse: true
  });
}

// Mission functions
function adminMissionCreate(controlUserSessionId: string, name: string, description: string, target: string) {
  return apiRequest('POST', '/v1/admin/mission', {
    json: {
      name,
      description,
      target
    },
    headers: {
      'controlUserSessionId': controlUserSessionId
    },
    fullResponse: true
  });
}

function adminMissionInfo(controlUserSessionId: string, missionId: number) {
  return apiRequest('GET', `/v1/admin/mission/${missionId}`, {
    headers: {
      'controlUserSessionId': controlUserSessionId
    },
    fullResponse: true
  });
}

// Astronaut and assignment functions for testing with assigned astronauts
function adminAstronautCreate(controlUserSessionId: string, nameFirst: string, nameLast: string, rank: string, age: number, weight: number, height: number) {
  return apiRequest('POST', '/v1/admin/astronaut', {
    json: {
      nameFirst,
      nameLast,
      rank,
      age,
      weight,
      height
    },
    headers: {
      'controlUserSessionId': controlUserSessionId
    },
    fullResponse: true
  });
}

function adminMissionAssignAstronaut(controlUserSessionId: string, missionId: number, astronautId: number) {
  return apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
    json: {},
    headers: {
      'controlUserSessionId': controlUserSessionId
    },
    fullResponse: true
  });
}

// Clear function
function clear() {
  return apiRequest('DELETE', '/clear', { fullResponse: true });
}

function expectValidMissionInfo(result: any, expectedMission?: any) {
  // Verify required fields according to Swagger MissionIter2 schema
  expect(result.missionId).toBeDefined();
  expect(result.name).toBeDefined();
  expect(result.description).toBeDefined();
  expect(result.target).toBeDefined();
  expect(result.timeCreated).toBeDefined();
  expect(result.timeLastEdited).toBeDefined();
  expect(result.assignedAstronauts).toBeDefined();
  
  // Verify field types
  expect(typeof result.missionId).toBe('number');
  expect(typeof result.name).toBe('string');
  expect(typeof result.timeCreated).toBe('number');
  expect(typeof result.timeLastEdited).toBe('number');
  expect(typeof result.description).toBe('string');
  expect(typeof result.target).toBe('string');
  expect(Array.isArray(result.assignedAstronauts)).toBe(true);
  
  // Verify expected values if provided
  if (expectedMission) {
    expect(result.missionId).toBe(expectedMission.missionId);
    expect(result.name).toBe(expectedMission.name);
    expect(result.description).toBe(expectedMission.description);
    expect(result.target).toBe(expectedMission.target);
  }
}

describe('Admin Mission Info Tests', () => {
  beforeEach(() => {
    // Clear data before each test
    const clearResult = clear();
    expect(clearResult.statusCode).toBe(200);
  });

  test('Successful mission info retrieval', () => {
    // Register two users
    const registerResult1 = adminAuthRegister('user1@example.com', 'password123', 'User', 'One');
    expect(registerResult1.statusCode).toBe(200);
    const user1 = registerResult1.body.controlUserSessionId;

    const registerResult2 = adminAuthRegister('user2@example.com', 'password456', 'User', 'Two');
    expect(registerResult2.statusCode).toBe(200);
    const user2 = registerResult2.body.controlUserSessionId;

    // User 1 creates a mission
    const createResult = adminMissionCreate(
      user1,
      'Mars Exploration',
      'A mission to explore the surface of Mars',
      'Mars'
    );
    expect(createResult.statusCode).toBe(200);
    const missionId = createResult.body.missionId;

    // User 1 should be able to get mission info
    const infoResult = adminMissionInfo(user1, missionId);
    expect(infoResult.statusCode).toBe(200);
    
    // Verify mission info structure and content
    expectValidMissionInfo(infoResult.body, {
      missionId: missionId,
      name: 'Mars Exploration',
      description: 'A mission to explore the surface of Mars',
      target: 'Mars'
    });

    // Verify timestamps are present and reasonable
    expect(infoResult.body.timeCreated).toBeGreaterThan(0);
    expect(infoResult.body.timeLastEdited).toBeGreaterThan(0);
    expect(infoResult.body.timeLastEdited).toBeGreaterThanOrEqual(infoResult.body.timeCreated);
  });

  test('Mission info with invalid session', () => {
    const result = adminMissionInfo('invalid-session-id', 1);
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Mission info with invalid access', () => {
    // Register two users
    const registerResult1 = adminAuthRegister('user1@example.com', 'password123', 'User', 'One');
    expect(registerResult1.statusCode).toBe(200);
    const user1 = registerResult1.body.controlUserSessionId;

    const registerResult2 = adminAuthRegister('user2@example.com', 'password456', 'User', 'Two');
    expect(registerResult2.statusCode).toBe(200);
    const user2 = registerResult2.body.controlUserSessionId;

    // User 1 creates a mission
    const createResult = adminMissionCreate(
      user1,
      'Mars Exploration',
      'A mission to explore the surface of Mars',
      'Mars'
    );
    expect(createResult.statusCode).toBe(200);
    const missionId = createResult.body.missionId;

    // User 2 should not be able to access User 1's mission
    const infoResult = adminMissionInfo(user2, missionId);
    expectError(infoResult, 403, getNotOwnerMessage());

    // Non-existent mission ID should also fail
    const nonExistentResult = adminMissionInfo(user1, 99999);
    expectError(nonExistentResult, 403, getNotOwnerMessage());
  });

  test('Mission info with assigned astronauts', () => {
    // Register user
    const registerResult = adminAuthRegister('user@example.com', 'password123', 'User', 'One');
    expect(registerResult.statusCode).toBe(200);
    const userId = registerResult.body.controlUserSessionId;

    // Create mission
    const createResult = adminMissionCreate(
      userId,
      'Mars Mission',
      'Mission to Mars',
      'Mars'
    );
    expect(createResult.statusCode).toBe(200);
    const missionId = createResult.body.missionId;

    // Create astronaut
    const astronautResult = adminAstronautCreate(
      userId,
      'John',
      'Doe',
      'Commander',
      35,
      75.5,
      180
    );
    expect(astronautResult.statusCode).toBe(200);
    const astronautId = astronautResult.body.astronautId;

    // Assign astronaut to mission
    const assignResult = adminMissionAssignAstronaut(userId, missionId, astronautId);
    expect(assignResult.statusCode).toBe(200);

    // Get mission info
    const infoResult = adminMissionInfo(userId, missionId);
    expect(infoResult.statusCode).toBe(200);
    
    // Verify mission info includes assigned astronaut
    expectValidMissionInfo(infoResult.body, {
      missionId: missionId,
      name: 'Mars Mission',
      description: 'Mission to Mars',
      target: 'Mars'
    });

    // Verify assigned astronauts array contains the astronaut
    expect(infoResult.body.assignedAstronauts).toHaveLength(1);
    expect(infoResult.body.assignedAstronauts[0].astronautId).toBe(astronautId);
    expect(infoResult.body.assignedAstronauts[0].name).toBe('Commander John Doe');
  });

  test('Mission info with multiple assigned astronauts', () => {
    // Register user
    const registerResult = adminAuthRegister('multi@example.com', 'password123', 'User', 'Multi');
    expect(registerResult.statusCode).toBe(200);
    const userId = registerResult.body.controlUserSessionId;

    // Create mission
    const createResult = adminMissionCreate(
      userId,
      'Multi Astronaut Mission',
      'Mission with multiple astronauts',
      'Jupiter'
    );
    expect(createResult.statusCode).toBe(200);
    const missionId = createResult.body.missionId;

    // Create multiple astronauts
    const astronaut1Result = adminAstronautCreate(userId, 'John', 'Doe', 'Commander', 35, 75.5, 180);
    expect(astronaut1Result.statusCode).toBe(200);
    const astronaut1Id = astronaut1Result.body.astronautId;

    const astronaut2Result = adminAstronautCreate(userId, 'Jane', 'Smith', 'Pilot', 30, 65.0, 165);
    expect(astronaut2Result.statusCode).toBe(200);
    const astronaut2Id = astronaut2Result.body.astronautId;

    // Assign both astronauts to mission
    const assign1Result = adminMissionAssignAstronaut(userId, missionId, astronaut1Id);
    expect(assign1Result.statusCode).toBe(200);

    const assign2Result = adminMissionAssignAstronaut(userId, missionId, astronaut2Id);
    expect(assign2Result.statusCode).toBe(200);

    // Get mission info
    const infoResult = adminMissionInfo(userId, missionId);
    expect(infoResult.statusCode).toBe(200);
    
    // Verify mission info includes both assigned astronauts
    expectValidMissionInfo(infoResult.body, {
      missionId: missionId,
      name: 'Multi Astronaut Mission',
      description: 'Mission with multiple astronauts',
      target: 'Jupiter'
    });

    // Verify assigned astronauts array contains both astronauts
    expect(infoResult.body.assignedAstronauts).toHaveLength(2);
    
    const astronautIds = infoResult.body.assignedAstronauts.map((a: any) => a.astronautId);
    expect(astronautIds).toContain(astronaut1Id);
    expect(astronautIds).toContain(astronaut2Id);
    
    const astronautNames = infoResult.body.assignedAstronauts.map((a: any) => a.name);
    expect(astronautNames).toContain('Commander John Doe');
    expect(astronautNames).toContain('Pilot Jane Smith');
  });

  test('Mission info with no assigned astronauts', () => {
    // Register user
    const registerResult = adminAuthRegister('empty@example.com', 'password123', 'User', 'Empty');
    expect(registerResult.statusCode).toBe(200);
    const userId = registerResult.body.controlUserSessionId;

    // Create mission without assigning astronauts
    const createResult = adminMissionCreate(
      userId,
      'Empty Mission',
      'Mission with no astronauts',
      'Saturn'
    );
    expect(createResult.statusCode).toBe(200);
    const missionId = createResult.body.missionId;

    // Get mission info
    const infoResult = adminMissionInfo(userId, missionId);
    expect(infoResult.statusCode).toBe(200);
    
    // Verify mission info with empty astronauts array
    expectValidMissionInfo(infoResult.body, {
      missionId: missionId,
      name: 'Empty Mission',
      description: 'Mission with no astronauts',
      target: 'Saturn'
    });

    // Verify assigned astronauts array is empty
    expect(infoResult.body.assignedAstronauts).toHaveLength(0);
  });

  test('Mission info with invalid mission ID', () => {
    // Register user
    const registerResult = adminAuthRegister('invalid@example.com', 'password123', 'User', 'Invalid');
    expect(registerResult.statusCode).toBe(200);
    const userId = registerResult.body.controlUserSessionId;

    // Test invalid mission ID
    const result = adminMissionInfo(userId, -1);
    expectError(result, 400, getMissionIdInvalidMessage());
  });

  test('Mission info with empty session', () => {
    const result = adminMissionInfo('', 1);
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Mission info after logout', () => {
    // Register user
    const registerResult = adminAuthRegister('logout@example.com', 'password123', 'User', 'Logout');
    expect(registerResult.statusCode).toBe(200);
    const userId = registerResult.body.controlUserSessionId;

    // Create mission
    const createResult = adminMissionCreate(
      userId,
      'Logout Test Mission',
      'Mission for logout test',
      'Venus'
    );
    expect(createResult.statusCode).toBe(200);
    const missionId = createResult.body.missionId;

    // Logout user
    const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
      json: {},
      headers: { controlUserSessionId: userId },
      fullResponse: true
    });
    expect(logoutResult.statusCode).toBe(200);

    // Try to get mission info after logout
    const infoResult = adminMissionInfo(userId, missionId);
    expectError(infoResult, 401, getSessionInvalidMessage());
  });
});