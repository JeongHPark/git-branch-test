import { apiRequest } from '../fakepi/helpers';
import { 
  getSessionInvalidMessage, 
  getAstronautIdInvalidMessage 
} from '../../src/other';

const VALID_USER = {
  nameFirst: 'John',
  nameLast: 'Doe',
  email: 'john.doe@example.com',
  password: 'password123',
  passwordConfirm: 'password123'
};

const VALID_ASTRONAUT = {
  nameFirst: 'James',
  nameLast: 'Kirk',
  rank: 'Captain',
  age: 35,
  weight: 75.5,
  height: 175
};

const VALID_MISSION = {
  name: 'Test Mission',
  description: 'Test mission description',
  target: 'Mars'
};

// Helper function to expect error responses
function expectError(response: any, expectedStatus: number, expectedMessage: string) {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.body.error).toBe(expectedMessage);
}

// Helper functions
function registerUser(user: any): string {
  const response = apiRequest('POST', '/v1/admin/auth/register', {
    json: user,
    fullResponse: true
  });
  expect(response.statusCode).toBe(200);
  return response.body.controlUserSessionId;
}

function createAstronaut(token: string, astronaut: any): number {
  const response = apiRequest('POST', '/v1/admin/astronaut', {
    json: astronaut,
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(response.statusCode).toBe(200);
  return response.body.astronautId;
}

function createMission(token: string, mission: any): number {
  const response = apiRequest('POST', '/v1/admin/mission', {
    json: mission,
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(response.statusCode).toBe(200);
  return response.body.missionId;
}

function assignAstronautToMission(token: string, missionId: number, astronautId: number): void {
  const response = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
    json: {},
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(response.statusCode).toBe(200);
}

// Test suite
describe('GET /v1/admin/astronaut/{astronautid}', () => {
  let validSessionId: string;

  beforeEach(() => {
    // Clear data using apiRequest
    const clearResponse = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearResponse.statusCode).toBe(200);
    
    validSessionId = registerUser(VALID_USER);
  });

  describe('Success Cases', () => {
    test('successfully retrieves astronaut information without assignment', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      const result = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });

      expect(result.statusCode).toBe(200);
      const body = result.body;
      expect(body.astronautId).toBe(astronautId);
      expect(body.designation).toBe('Captain James Kirk');
      expect(body.timeAdded).toBeDefined();
      expect(body.timeLastEdited).toBeDefined();
      expect(body.age).toBe(35);
      expect(body.weight).toBe(75.5);
      expect(body.height).toBe(175);
      expect(body.assignedMission).toBeDefined();
      
      // Verify timestamps
      expect(typeof body.timeAdded).toBe('number');
      expect(typeof body.timeLastEdited).toBe('number');
      expect(body.timeAdded).toBeGreaterThan(0);
      expect(body.timeLastEdited).toBeGreaterThan(0);
      
      // Verify no mission assignment
      expect(body.assignedMission).toBeNull();
    });

    test('successfully retrieves astronaut information with mission assignment', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);
      const missionId = createMission(validSessionId, VALID_MISSION);
      assignAstronautToMission(validSessionId, missionId, astronautId);

      const result = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });

      expect(result.statusCode).toBe(200);
      const body = result.body;
      expect(body.astronautId).toBe(astronautId);
      expect(body.designation).toBe('Captain James Kirk');
      expect(body.assignedMission).toBeDefined();
      
      // Verify mission assignment structure
      const assignedMission = body.assignedMission;
      expect(assignedMission).not.toBeNull();
      expect(assignedMission.missionId).toBe(missionId);
      expect(assignedMission.objective).toBe('[Mars] Test Mission');
    });

    test('correctly formats designation (rank + nameFirst + nameLast)', () => {
      const testAstronaut = {
        nameFirst: 'Jean-Luc',
        nameLast: 'Picard',
        rank: 'Lieutenant Commander',
        age: 45,
        weight: 80,
        height: 180
      };

      const astronautId = createAstronaut(validSessionId, testAstronaut);
      const result = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });

      expect(result.statusCode).toBe(200);
      const body = result.body;
      expect(body.designation).toBe('Lieutenant Commander Jean-Luc Picard');
    });

    test('correctly formats mission objective ([target] + mission name)', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);
      const mission = {
        name: 'Apollo Mission',
        description: 'Moon landing mission',
        target: 'Moon Surface'
      };
      const missionId = createMission(validSessionId, mission);
      assignAstronautToMission(validSessionId, missionId, astronautId);

      const result = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });

      expect(result.statusCode).toBe(200);
      const body = result.body;
      const assignedMission = body.assignedMission;
      expect(assignedMission.objective).toBe('[Moon Surface] Apollo Mission');
    });
  });

  describe('Error Cases - 401 Unauthorized', () => {
    test('returns 401 when session token is empty', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      const result = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
        headers: {},
        fullResponse: true
      });

      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 when session token is invalid', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      const result = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
        headers: { controlUserSessionId: 'invalid-session-id' },
        fullResponse: true
      });

      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 when session token is missing', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      const result = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
        fullResponse: true
      });

      expectError(result, 401, getSessionInvalidMessage());
    });
  });

  describe('Error Cases - 400 Bad Request', () => {
    test('returns 400 when astronautId is invalid (non-existent)', () => {
      const invalidAstronautId = 99999;

      const result = apiRequest('GET', `/v1/admin/astronaut/${invalidAstronautId}`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });

      expectError(result, 400, getAstronautIdInvalidMessage());
    });

    test('returns 400 when astronautId is negative', () => {
      const result = apiRequest('GET', `/v1/admin/astronaut/-1`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });

      expectError(result, 400, getAstronautIdInvalidMessage());
    });

    test('returns 400 when astronautId is zero', () => {
      const result = apiRequest('GET', `/v1/admin/astronaut/0`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });

      expectError(result, 400, getAstronautIdInvalidMessage());
    });

    test('returns 400 when astronautId is not a valid number', () => {
      const result = apiRequest('GET', `/v1/admin/astronaut/invalid`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });

      expectError(result, 400, getAstronautIdInvalidMessage());
    });
  });

  describe('Mission Assignment Scenarios', () => {
    test('shows null assignment when astronaut has no mission', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      const result = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });

      expect(result.statusCode).toBe(200);
      const body = result.body;
      expect(body.assignedMission).toBeNull();
    });

    test('shows assignment after astronaut is assigned to mission', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);
      const missionId = createMission(validSessionId, VALID_MISSION);

      // Check before assignment
      const beforeResult = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });
      expect(beforeResult.statusCode).toBe(200);
      const beforeBody = beforeResult.body;
      expect(beforeBody.assignedMission).toBeNull();

      // Assign to mission
      assignAstronautToMission(validSessionId, missionId, astronautId);

      // Check after assignment
      const afterResult = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });
      expect(afterResult.statusCode).toBe(200);
      const afterBody = afterResult.body;
      expect(afterBody.assignedMission).not.toBeNull();
      const assignedMission = afterBody.assignedMission;
      expect(assignedMission.missionId).toBe(missionId);
    });

    test('shows null assignment after astronaut is unassigned from mission', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);
      const missionId = createMission(validSessionId, VALID_MISSION);

      // Assign to mission
      assignAstronautToMission(validSessionId, missionId, astronautId);

      // Verify assignment
      const assignedResult = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });
      expect(assignedResult.statusCode).toBe(200);
      const assignedBody = assignedResult.body;
      expect(assignedBody.assignedMission).not.toBeNull();

      // Unassign from mission
      const unassignResponse = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });
      expect(unassignResponse.statusCode).toBe(200);

      // Check after unassignment
      const unassignedResult = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });
      expect(unassignedResult.statusCode).toBe(200);
      const unassignedBody = unassignedResult.body;
      expect(unassignedBody.assignedMission).toBeNull();
    });
  });
}); 