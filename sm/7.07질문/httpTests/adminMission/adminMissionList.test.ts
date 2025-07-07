import { apiRequest } from '../fakepi/helpers';
import { getSessionInvalidMessage } from '../../src/other';

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

function adminAuthLogin(email: string, password: string) {
  return apiRequest('POST', '/v1/admin/auth/login', {
    json: {
      email,
      password
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

function adminMissionList(controlUserSessionId: string) {
  return apiRequest('GET', '/v1/admin/mission/list', {
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

describe('Admin Mission List Tests', () => {
  beforeEach(() => {
    // Clear data before each test
    const clearResult = clear();
    expect(clearResult.statusCode).toBe(200);
  });

  test('Mission list with no missions', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'test@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Get empty mission list
    const result = adminMissionList(validSessionId);
    expect(result.statusCode).toBe(200);
    
    // Verify empty missions array
    expect(result.body).toEqual({ missions: [] });
  });

  test('Mission list with one mission', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'test@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Create a mission
    const createResult = adminMissionCreate(
      validSessionId,
      'Mars Mission',
      'A mission to explore Mars surface',
      'Mars'
    );
    expect(createResult.statusCode).toBe(200);
    const missionId = createResult.body.missionId;

    // Get mission list
    const result = adminMissionList(validSessionId);
    expect(result.statusCode).toBe(200);
    
    // Verify single mission in list
    const expectedResponse = {
      missions: [
        {
          missionId: missionId,
          name: 'Mars Mission'
        }
      ]
    };
    
    expect(result.body).toEqual(expectedResponse);
  });

  test('Mission list with multiple missions', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'test@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Create multiple missions
    const missions = [
      { name: 'Mars Mission', description: 'Explore Mars', target: 'Mars' },
      { name: 'Jupiter Mission', description: 'Explore Jupiter', target: 'Jupiter' },
      { name: 'Saturn Mission', description: 'Explore Saturn', target: 'Saturn' }
    ];

    const createdMissions: any[] = [];
    missions.forEach(mission => {
      const createResult = adminMissionCreate(
        validSessionId,
        mission.name,
        mission.description,
        mission.target
      );
      expect(createResult.statusCode).toBe(200);
      createdMissions.push({
        missionId: createResult.body.missionId,
        name: mission.name
      });
    });

    // Get mission list
    const result = adminMissionList(validSessionId);
    expect(result.statusCode).toBe(200);
    
    // Verify all missions are in list
    expect(result.body.missions).toHaveLength(3);
    createdMissions.forEach(createdMission => {
      const foundMission = result.body.missions.find((m: any) => m.missionId === createdMission.missionId);
      expect(foundMission).toBeDefined();
      expect(foundMission.name).toBe(createdMission.name);
    });
  });

  test('Mission list user isolation', () => {
    // Register first user
    const registerResult1 = adminAuthRegister(
      'user1@example.com',
      'password123',
      'User',
      'One'
    );
    expect(registerResult1.statusCode).toBe(200);
    const sessionId1 = registerResult1.body.controlUserSessionId;

    // Register second user
    const registerResult2 = adminAuthRegister(
      'user2@example.com',
      'password456',
      'User',
      'Two'
    );
    expect(registerResult2.statusCode).toBe(200);
    const sessionId2 = registerResult2.body.controlUserSessionId;

    // User 1 creates missions
    const createResult1 = adminMissionCreate(
      sessionId1,
      'User 1 Mission',
      'Mission by user 1',
      'Mars'
    );
    expect(createResult1.statusCode).toBe(200);
    const missionId1 = createResult1.body.missionId;

    // User 2 creates missions
    const createResult2 = adminMissionCreate(
      sessionId2,
      'User 2 Mission',
      'Mission by user 2',
      'Jupiter'
    );
    expect(createResult2.statusCode).toBe(200);
    const missionId2 = createResult2.body.missionId;

    // User 1 should only see their own missions
    const result1 = adminMissionList(sessionId1);
    expect(result1.statusCode).toBe(200);
    expect(result1.body.missions).toHaveLength(1);
    expect(result1.body.missions[0].missionId).toBe(missionId1);
    expect(result1.body.missions[0].name).toBe('User 1 Mission');

    // User 2 should only see their own missions
    const result2 = adminMissionList(sessionId2);
    expect(result2.statusCode).toBe(200);
    expect(result2.body.missions).toHaveLength(1);
    expect(result2.body.missions[0].missionId).toBe(missionId2);
    expect(result2.body.missions[0].name).toBe('User 2 Mission');
  });

  test('Mission list with invalid session', () => {
    const result = adminMissionList('invalid-session-id');
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Mission list with empty session', () => {
    const result = adminMissionList('');
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Mission list after logout', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'logout@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Create a mission
    const createResult = adminMissionCreate(
      validSessionId,
      'Test Mission',
      'Test description',
      'Mars'
    );
    expect(createResult.statusCode).toBe(200);

    // Logout user
    const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
      json: {},
      headers: { controlUserSessionId: validSessionId },
      fullResponse: true
    });
    expect(logoutResult.statusCode).toBe(200);

    // Try to get mission list after logout
    const result = adminMissionList(validSessionId);
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Mission list ordering', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'order@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Create missions in specific order
    const missions = [
      { name: 'Alpha Mission', description: 'First mission', target: 'Mars' },
      { name: 'Beta Mission', description: 'Second mission', target: 'Jupiter' },
      { name: 'Gamma Mission', description: 'Third mission', target: 'Saturn' }
    ];

    const createdMissions: any[] = [];
    missions.forEach(mission => {
      const createResult = adminMissionCreate(
        validSessionId,
        mission.name,
        mission.description,
        mission.target
      );
      expect(createResult.statusCode).toBe(200);
      createdMissions.push({
        missionId: createResult.body.missionId,
        name: mission.name
      });
    });

    // Get mission list
    const result = adminMissionList(validSessionId);
    expect(result.statusCode).toBe(200);
    
    // Verify missions are returned (order may vary based on implementation)
    expect(result.body.missions).toHaveLength(3);
    createdMissions.forEach(createdMission => {
      const foundMission = result.body.missions.find((m: any) => m.missionId === createdMission.missionId);
      expect(foundMission).toBeDefined();
      expect(foundMission.name).toBe(createdMission.name);
    });
  });

  test('Mission list after mission deletion', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'delete@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Create two missions
    const createResult1 = adminMissionCreate(
      validSessionId,
      'Mission 1',
      'First mission',
      'Mars'
    );
    expect(createResult1.statusCode).toBe(200);
    const missionId1 = createResult1.body.missionId;

    const createResult2 = adminMissionCreate(
      validSessionId,
      'Mission 2',
      'Second mission',
      'Jupiter'
    );
    expect(createResult2.statusCode).toBe(200);
    const missionId2 = createResult2.body.missionId;

    // Verify both missions exist
    let result = adminMissionList(validSessionId);
    expect(result.statusCode).toBe(200);
    expect(result.body.missions).toHaveLength(2);

    // Delete first mission
    const deleteResult = apiRequest('DELETE', `/v1/admin/mission/${missionId1}`, {
      headers: { controlUserSessionId: validSessionId },
      fullResponse: true
    });
    expect(deleteResult.statusCode).toBe(200);

    // Verify only second mission remains
    result = adminMissionList(validSessionId);
    expect(result.statusCode).toBe(200);
    expect(result.body.missions).toHaveLength(1);
    expect(result.body.missions[0].missionId).toBe(missionId2);
    expect(result.body.missions[0].name).toBe('Mission 2');
  });
});