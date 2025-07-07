import { apiRequest } from '../fakepi/helpers';
import { 
  getSessionInvalidMessage,
  getTargetTooLongMessage,
  getNotOwnerMessage,
  getMissionIdInvalidMessage,
  getMissionNotOwnedOrNotExistMessage,
  getTargetMaxLength
} from '../../src/other';

// Helper function to expect error responses
function expectError(response: any, expectedStatus: number, expectedMessage: string) {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.body.error).toBe(expectedMessage);
}

// Test data constants
const VALID_USER = {
  email: 'testuser@example.com',
  password: 'password123',
  nameFirst: 'Test',
  nameLast: 'User'
};

const ANOTHER_USER = {
  email: 'another@example.com',
  password: 'password123',
  nameFirst: 'Another',
  nameLast: 'User'
};

const VALID_MISSION = {
  name: 'Test Mission',
  description: 'Test mission description',
  target: 'Mars'
};

function registerUser(user: any): string {
  const response = apiRequest('POST', '/v1/admin/auth/register', {
    json: user,
    fullResponse: true
  });
  expect(response.statusCode).toBe(200);
  return response.body.controlUserSessionId;
}

function loginUser(email: string, password: string): string {
  const response = apiRequest('POST', '/v1/admin/auth/login', {
    json: { email, password },
    fullResponse: true
  });
  expect(response.statusCode).toBe(200);
  return response.body.controlUserSessionId;
}

function createMission(token: string, mission: any): number {
  const result = apiRequest('POST', '/v1/admin/mission', {
    json: mission,
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(result.statusCode).toBe(200);
  return result.body.missionId;
}

function updateMissionTarget(token: string, missionId: number, target: string): any {
  return apiRequest('PUT', `/v1/admin/mission/${missionId}/target`, {
    json: { target },
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
}

function clearData(): void {
  const response = apiRequest('DELETE', '/clear', { fullResponse: true });
  expect(response.statusCode).toBe(200);
}

// Test suite
describe('/v1/admin/mission/{missionid}/target', () => {
  beforeEach(() => {
    clearData();
  });

  describe('Success Cases', () => {
    test('successfully updates mission target', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);
      const newTarget = 'Jupiter';

      const result = updateMissionTarget(token, missionId, newTarget);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });

    test('successfully updates with empty target', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);
      const newTarget = '';

      const result = updateMissionTarget(token, missionId, newTarget);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });

    test('successfully updates with maximum length target', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);
      const newTarget = 'a'.repeat(getTargetMaxLength()); // 100 characters

      const result = updateMissionTarget(token, missionId, newTarget);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });

    test('successfully updates target multiple times', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);

      const firstTarget = 'Venus';
      const firstResult = updateMissionTarget(token, missionId, firstTarget);
      expect(firstResult.statusCode).toBe(200);
      expect(firstResult.body).toEqual({});

      const secondTarget = 'Saturn';
      const secondResult = updateMissionTarget(token, missionId, secondTarget);
      expect(secondResult.statusCode).toBe(200);
      expect(secondResult.body).toEqual({});
    });

    test('handles common space destinations', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);
      
      const destinations = [
        'Earth Orbit',
        'Moon',
        'Mars',
        'Venus',
        'Jupiter',
        'Saturn',
        'International Space Station',
        'Asteroid Belt',
        'Europa',
        'Titan'
      ];

      destinations.forEach(destination => {
        const result = updateMissionTarget(token, missionId, destination);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({});
      });
    });

    test('handles special characters within length limit', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);
      const specialTarget = 'Target: Earth-Moon L1 Lagrange Point!';

      const result = updateMissionTarget(token, missionId, specialTarget);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });

    test('handles unicode characters within length limit', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);
      const unicodeTarget = '火星 (Mars) 表面';

      const result = updateMissionTarget(token, missionId, unicodeTarget);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });

    test('handles target with only whitespace', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);
      const whitespaceTarget = '   \t\n   ';

      const result = updateMissionTarget(token, missionId, whitespaceTarget);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });

    test('preserves formatting in target', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);
      const formattedTarget = 'Earth Orbit\n(Low Earth Orbit)';

      const result = updateMissionTarget(token, missionId, formattedTarget);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });
  });

  describe('Authentication Errors', () => {
    test('returns 401 when session token is empty', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);

      const result = updateMissionTarget('', missionId, 'New target');
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 when session token is invalid', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);

      const result = updateMissionTarget('invalid-token', missionId, 'New target');
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 when user is logged out', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);

      // Logout user
      const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: { controlUserSessionId: token },
        fullResponse: true
      });
      expect(logoutResult.statusCode).toBe(200);

      const result = updateMissionTarget(token, missionId, 'New target');
      expectError(result, 401, getSessionInvalidMessage());
    });
  });

  describe('Authorization Errors', () => {
    test('returns 400 when mission ID is invalid (negative)', () => {
      const token = registerUser(VALID_USER);

      const result = updateMissionTarget(token, -1, 'New target');
      expectError(result, 400, getMissionIdInvalidMessage());
    });

    test('returns 400 when mission ID is invalid (zero)', () => {
      const token = registerUser(VALID_USER);

      const result = updateMissionTarget(token, 0, 'New target');
      expectError(result, 400, getMissionIdInvalidMessage());
    });

    test('returns 403 when mission does not exist', () => {
      const token = registerUser(VALID_USER);

      const result = updateMissionTarget(token, 99999, 'New target');
      expectError(result, 403, getMissionNotOwnedOrNotExistMessage());
    });

    test('returns 403 when mission is owned by different user', () => {
      const token1 = registerUser(VALID_USER);
      const token2 = registerUser(ANOTHER_USER);
      const missionId = createMission(token1, VALID_MISSION);

      const result = updateMissionTarget(token2, missionId, 'New target');
      expectError(result, 403, getMissionNotOwnedOrNotExistMessage());
    });
  });

  describe('Validation Errors', () => {
    test('returns 400 when target is too long', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);
      const tooLongTarget = 'a'.repeat(getTargetMaxLength() + 1); // 101 characters

      const result = updateMissionTarget(token, missionId, tooLongTarget);
      expectError(result, 400, getTargetTooLongMessage());
    });

    test('handles boundary length target (exactly at limit)', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);
      const boundaryTarget = 'a'.repeat(getTargetMaxLength()); // exactly 100 characters

      const result = updateMissionTarget(token, missionId, boundaryTarget);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    test('handles concurrent target updates', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);

      // Simulate concurrent updates
      const result1 = updateMissionTarget(token, missionId, 'Target 1');
      const result2 = updateMissionTarget(token, missionId, 'Target 2');

      expect(result1.statusCode).toBe(200);
      expect(result2.statusCode).toBe(200);
    });

    test('handles target with various character encodings', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);
      
      const encodingTests = [
        'ASCII Target',
        'Café on Mars',
        'Москва Space Station',
        '東京 Orbital Platform',
        'Target with emoji 🚀',
        'Target\twith\ttabs',
        'Target\nwith\nnewlines'
      ];

      encodingTests.forEach(target => {
        const result = updateMissionTarget(token, missionId, target);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({});
      });
    });

    test('handles rapid successive updates', () => {
      const token = registerUser(VALID_USER);
      const missionId = createMission(token, VALID_MISSION);

      // Rapid successive updates
      for (let i = 0; i < 5; i++) {
        const result = updateMissionTarget(token, missionId, `Target ${i}`);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({});
      }
    });

    test('handles update after mission creation with same name', () => {
      const token = registerUser(VALID_USER);
      
      // Create first mission
      const mission1Id = createMission(token, VALID_MISSION);
      
      // Create second mission with different name
      const mission2Id = createMission(token, {
        ...VALID_MISSION,
        name: 'Another Mission'
      });

      // Update both missions
      const result1 = updateMissionTarget(token, mission1Id, 'Jupiter');
      const result2 = updateMissionTarget(token, mission2Id, 'Saturn');

      expect(result1.statusCode).toBe(200);
      expect(result2.statusCode).toBe(200);
    });

    test('handles target update after user logout and login', () => {
      const token1 = registerUser(VALID_USER);
      const missionId = createMission(token1, VALID_MISSION);

      // Logout
      const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: { controlUserSessionId: token1 },
        fullResponse: true
      });
      expect(logoutResult.statusCode).toBe(200);

      // Login again
      const token2 = loginUser(VALID_USER.email, VALID_USER.password);

      // Update target
      const result = updateMissionTarget(token2, missionId, 'New Target');
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });
  });

  describe('User Isolation', () => {
    test('users cannot update each others mission targets', () => {
      const token1 = registerUser(VALID_USER);
      const token2 = registerUser(ANOTHER_USER);
      const missionId = createMission(token1, VALID_MISSION);

      const result = updateMissionTarget(token2, missionId, 'Hacker Target');
      expectError(result, 403, getMissionNotOwnedOrNotExistMessage());
    });

    test('users can update their own mission targets after other users create missions', () => {
      const token1 = registerUser(VALID_USER);
      const token2 = registerUser(ANOTHER_USER);
      
      const mission1Id = createMission(token1, VALID_MISSION);
      const mission2Id = createMission(token2, {
        ...VALID_MISSION,
        name: 'Another Mission'
      });

      // Each user can update their own mission
      const result1 = updateMissionTarget(token1, mission1Id, 'User 1 Target');
      const result2 = updateMissionTarget(token2, mission2Id, 'User 2 Target');

      expect(result1.statusCode).toBe(200);
      expect(result2.statusCode).toBe(200);
    });
  });
});