import { apiRequest } from '../fakepi/helpers';
import { 
  getSessionInvalidMessage,
  getMissionNotOwnedOrNotExistMessage,
  getDescriptionTooLongMessage,
  getMissionIdInvalidMessage,
  getDescriptionMaxLength
} from '../../src/other';

// Helper function to expect error responses
function expectError(response: any, expectedStatus: number, expectedMessage: string) {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.body.error).toBe(expectedMessage);
}

// Generate unique email to avoid conflicts between tests
function generateUniqueEmail(prefix: string = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
}

// Generate unique mission name to avoid conflicts between tests (Swagger compliant)
function generateUniqueMissionName(prefix: string = 'Mission'): string {
  const timestamp = Date.now().toString().slice(-8); // 8 digits
  const randomNum = Math.floor(Math.random() * 1000); // 3 digits
  return `${prefix} ${timestamp} ${randomNum}`; // Total ~20 chars, alphanumeric + spaces only
}

// Register user with unique email and return sessionId
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
  expect(result.statusCode).toBe(200);
  return { sessionId: result.body.controlUserSessionId, email };
}

// Create test mission with unique name
function createTestMission(token: string, namePrefix: string = 'Mission'): number {
  const result = apiRequest('POST', '/v1/admin/mission', {
    json: {
      name: generateUniqueMissionName(namePrefix),
      description: 'Test mission description',
      target: 'Mars'
    },
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(result.statusCode).toBe(200);
  return result.body.missionId;
}

// Update mission description
function updateMissionDescription(token: string, missionId: number, description: string): any {
  return apiRequest('PUT', `/v1/admin/mission/${missionId}/description`, {
    json: { description },
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
}

describe('/v1/admin/mission/{missionid}/description', () => {
  beforeEach(() => {
    // Clear data
    const clearResponse = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearResponse.statusCode).toBe(200);
  });

  describe('Success Cases', () => {
    test('successfully updates mission description', () => {
      const { sessionId: token } = registerUniqueUser('update1');
      const missionId = createTestMission(token, 'Update1');
      const newDescription = 'Updated mission description';

      const result = updateMissionDescription(token, missionId, newDescription);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({}); // Swagger Empty type
    });

    test('successfully updates with empty description', () => {
      const { sessionId: token } = registerUniqueUser('update2');
      const missionId = createTestMission(token, 'Update2');
      const newDescription = '';

      const result = updateMissionDescription(token, missionId, newDescription);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({}); // Swagger Empty type
    });

    test('successfully updates with maximum length description', () => {
      const { sessionId: token } = registerUniqueUser('update3');
      const missionId = createTestMission(token, 'Update3');
      const newDescription = 'a'.repeat(getDescriptionMaxLength()); // 400 characters

      const result = updateMissionDescription(token, missionId, newDescription);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({}); // Swagger Empty type
    });

    test('successfully updates description multiple times', () => {
      const { sessionId: token } = registerUniqueUser('update4');
      const missionId = createTestMission(token, 'Update4');

      const firstDescription = 'First description';
      const firstResult = updateMissionDescription(token, missionId, firstDescription);
      expect(firstResult.statusCode).toBe(200);
      expect(firstResult.body).toEqual({}); // Swagger Empty type

      const secondDescription = 'Second description';
      const secondResult = updateMissionDescription(token, missionId, secondDescription);
      expect(secondResult.statusCode).toBe(200);
      expect(secondResult.body).toEqual({}); // Swagger Empty type
    });

    test('handles special characters within length limit', () => {
      const { sessionId: token } = registerUniqueUser('special');
      const missionId = createTestMission(token, 'Special');
      const specialDescription = 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';

      const result = updateMissionDescription(token, missionId, specialDescription);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({}); // Swagger Empty type
    });

    test('handles unicode characters within length limit', () => {
      const { sessionId: token } = registerUniqueUser('unicode');
      const missionId = createTestMission(token, 'Unicode');
      const unicodeDescription = 'Mission to 火星 (Mars) with 宇航员 crew';

      const result = updateMissionDescription(token, missionId, unicodeDescription);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({}); // Swagger Empty type
    });

    test('preserves newlines and formatting in description', () => {
      const { sessionId: token } = registerUniqueUser('format');
      const missionId = createTestMission(token, 'Format');
      const formattedDescription = 'Line 1\nLine 2\n\tTabbed line\n  Spaced line';

      const result = updateMissionDescription(token, missionId, formattedDescription);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({}); // Swagger Empty type
    });

    test('handles description with only whitespace', () => {
      const { sessionId: token } = registerUniqueUser('whitespace');
      const missionId = createTestMission(token, 'Whitespace');
      const whitespaceDescription = '   \t\n   ';

      const result = updateMissionDescription(token, missionId, whitespaceDescription);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({}); // Swagger Empty type
    });
  });

  describe('Error Cases - 401 Unauthorized', () => {
    test('returns 401 when session token is empty', () => {
      const { sessionId: token } = registerUniqueUser('auth1');
      const missionId = createTestMission(token, 'Auth1');

      const result = updateMissionDescription('', missionId, 'New description');
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 when session token is invalid', () => {
      const { sessionId: token } = registerUniqueUser('auth2');
      const missionId = createTestMission(token, 'Auth2');

      const result = updateMissionDescription('invalid-token', missionId, 'New description');
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 when user is logged out', () => {
      const { sessionId: token } = registerUniqueUser('auth3');
      const missionId = createTestMission(token, 'Auth3');

      // Logout user
      const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: { controlUserSessionId: token },
        fullResponse: true
      });
      expect(logoutResult.statusCode).toBe(200);

      const result = updateMissionDescription(token, missionId, 'New description');
      expectError(result, 401, getSessionInvalidMessage());
    });
  });

  describe('Error Cases - 403 Forbidden', () => {
    test('returns 403 when user is not owner of mission', () => {
      const { sessionId: ownerToken } = registerUniqueUser('owner');
      const { sessionId: otherToken } = registerUniqueUser('other');
      const missionId = createTestMission(ownerToken, 'Owner');

      const result = updateMissionDescription(otherToken, missionId, 'New description');
      expectError(result, 403, getMissionNotOwnedOrNotExistMessage());
    });

    test('returns 403 when mission does not exist', () => {
      const { sessionId: token } = registerUniqueUser('nonexist');
      const nonExistentMissionId = 99999;

      const result = updateMissionDescription(token, nonExistentMissionId, 'New description');
      expectError(result, 403, getMissionNotOwnedOrNotExistMessage()); // Swagger: mission doesn't exist = 403
    });

    test('returns 403 when mission was deleted', () => {
      const { sessionId: token } = registerUniqueUser('deleted');
      const missionId = createTestMission(token, 'Deleted');

      // Delete the mission
      const deleteResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}`, {
        headers: { controlUserSessionId: token },
        fullResponse: true
      });
      expect(deleteResult.statusCode).toBe(200);

      const result = updateMissionDescription(token, missionId, 'New description');
      expectError(result, 403, getMissionNotOwnedOrNotExistMessage());
    });
  });

  describe('Error Cases - 400 Bad Request', () => {
    test('returns 400 when description is too long', () => {
      const { sessionId: token } = registerUniqueUser('toolong');
      const missionId = createTestMission(token, 'TooLong');
      const tooLongDescription = 'a'.repeat(getDescriptionMaxLength() + 1); // 401 characters

      const result = updateMissionDescription(token, missionId, tooLongDescription);
      expectError(result, 400, getDescriptionTooLongMessage());
    });

    test('returns 400 when missionId is invalid (negative)', () => {
      const { sessionId: token } = registerUniqueUser('invalid1');
      const invalidMissionId = -1;

      const result = updateMissionDescription(token, invalidMissionId, 'New description');
      expectError(result, 400, getMissionIdInvalidMessage());
    });

    test('returns 400 when missionId is invalid (zero)', () => {
      const { sessionId: token } = registerUniqueUser('invalid2');
      const invalidMissionId = 0;

      const result = updateMissionDescription(token, invalidMissionId, 'New description');
      expectError(result, 400, getMissionIdInvalidMessage());
    });

    test('returns 400 when missionId is not a number', () => {
      const { sessionId: token } = registerUniqueUser('invalid3');
      
      const result = apiRequest('PUT', '/v1/admin/mission/abc/description', {
        json: { description: 'New description' },
        headers: { controlUserSessionId: token },
        fullResponse: true
      });
      expectError(result, 400, getMissionIdInvalidMessage());
    });
  });
}); 