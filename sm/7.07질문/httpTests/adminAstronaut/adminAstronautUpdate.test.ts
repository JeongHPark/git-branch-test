import { apiRequest } from '../fakepi/helpers';
import { 
  getSessionInvalidMessage,
  getAstronautIdInvalidMessage,
  getNameFirstInvalidMessage,
  getNameLastInvalidMessage,
  getNameFirstLengthMessage,
  getNameLastLengthMessage,
  getAstronautRankInvalidLengthMessage,
  getAstronautRankInvalidCharsUpdateMessage,
  getAstronautAgeInvalidMessage,
  getAstronautWeightInvalidMessage,
  getAstronautHeightInvalidMessage,
  getAstronautNameAlreadyExistsMessage,
  getNameMaxLength,
  getRankMaxLength
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

const VALID_ASTRONAUT = {
  nameFirst: 'James',
  nameLast: 'Kirk',
  rank: 'Captain',
  age: 35,
  weight: 75.5,
  height: 175
};

function registerUser(user: any): string {
  const response = apiRequest('POST', '/v1/admin/auth/register', {
    json: user,
    fullResponse: true
  });
  expect(response.statusCode).toBe(200);
  return response.body.controlUserSessionId;
}

function createAstronaut(token: string, astronaut: any): number {
  const result = apiRequest('POST', '/v1/admin/astronaut', {
    json: astronaut,
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(result.statusCode).toBe(200);
  return result.body.astronautId;
}

function updateAstronaut(token: string, astronautId: number, updates: any): any {
  return apiRequest('PUT', `/v1/admin/astronaut/${astronautId}`, {
    json: updates,
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
}

function getAstronautInfo(token: string, astronautId: number): any {
  return apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
}

function clearData(): void {
  const response = apiRequest('DELETE', '/clear', { fullResponse: true });
  expect(response.statusCode).toBe(200);
}

// Test suite
describe('PUT /v1/admin/astronaut/{astronautid}', () => {
  let validSessionId: string;
  let astronautId: number;

  beforeEach(() => {
    clearData();
    validSessionId = registerUser(VALID_USER);
    astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);
  });

  describe('Success Cases', () => {
    test('successfully updates astronaut information', () => {
      const updates = {
        nameFirst: 'UpdatedJames',
        nameLast: 'UpdatedKirk',
        rank: 'Admiral',
        age: 40,
        weight: 80,
        height: 180
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expect(result.statusCode).toBe(200);
    });

    test('verifies updated information is persisted', () => {
      const updates = {
        nameFirst: 'UpdatedJames',
        nameLast: 'UpdatedKirk',
        rank: 'Admiral',
        age: 40,
        weight: 80.5,
        height: 180
      };

      const updateResult = updateAstronaut(validSessionId, astronautId, updates);
      expect(updateResult.statusCode).toBe(200);
      
      // Verify changes were saved
      const astronautInfo = getAstronautInfo(validSessionId, astronautId);
      expect(astronautInfo.statusCode).toBe(200);
      expect(astronautInfo.body.designation).toBe('Admiral UpdatedJames UpdatedKirk');
      expect(astronautInfo.body.age).toBe(40);
      expect(astronautInfo.body.weight).toBe(80.5);
      expect(astronautInfo.body.height).toBe(180);
    });

    test('successfully updates with minimum valid values', () => {
      const updates = {
        nameFirst: 'Ab', // 2 characters
        nameLast: 'Cd', // 2 characters
        rank: 'Ensig', // 5 characters
        age: 20, // minimum age
        weight: 1, // minimum weight
        height: 150 // minimum height
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expect(result.statusCode).toBe(200);
    });

    test('successfully updates with maximum valid values', () => {
      const updates = {
        nameFirst: 'a'.repeat(getNameMaxLength()), // 20 characters
        nameLast: 'b'.repeat(getNameMaxLength()), // 20 characters
        rank: 'c'.repeat(getRankMaxLength()), // 50 characters
        age: 60, // maximum age
        weight: 100, // maximum weight
        height: 200 // maximum height
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expect(result.statusCode).toBe(200);
    });

    test('successfully updates individual fields', () => {
      // Update only name
      const nameUpdate = updateAstronaut(validSessionId, astronautId, {
        nameFirst: 'NewFirst',
        nameLast: 'NewLast',
        rank: VALID_ASTRONAUT.rank,
        age: VALID_ASTRONAUT.age,
        weight: VALID_ASTRONAUT.weight,
        height: VALID_ASTRONAUT.height
      });
      expect(nameUpdate.statusCode).toBe(200);
      
      // Update only rank
      const rankUpdate = updateAstronaut(validSessionId, astronautId, {
        nameFirst: 'NewFirst',
        nameLast: 'NewLast',
        rank: 'Admiral',
        age: VALID_ASTRONAUT.age,
        weight: VALID_ASTRONAUT.weight,
        height: VALID_ASTRONAUT.height
      });
      expect(rankUpdate.statusCode).toBe(200);
      
      // Update only physical attributes
      const physicalUpdate = updateAstronaut(validSessionId, astronautId, {
        nameFirst: 'NewFirst',
        nameLast: 'NewLast',
        rank: 'Admiral',
        age: 45,
        weight: 85,
        height: 185
      });
      expect(physicalUpdate.statusCode).toBe(200);
    });

    test('successfully updates astronaut with special characters in names and rank', () => {
      const updates = {
        nameFirst: "Mary-Jane",
        nameLast: "O'Connor-Smith",
        rank: "Lieutenant Colonel",
        age: 35,
        weight: 65,
        height: 170
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expect(result.statusCode).toBe(200);
    });

    test('successfully updates multiple times consecutively', () => {
      const firstUpdate = {
        nameFirst: 'First',
        nameLast: 'Update',
        rank: 'Lieutenant',
        age: 30,
        weight: 70,
        height: 170
      };

      const secondUpdate = {
        nameFirst: 'Second',
        nameLast: 'Update',
        rank: 'Commander',
        age: 35,
        weight: 75,
        height: 175
      };

      const firstResult = updateAstronaut(validSessionId, astronautId, firstUpdate);
      expect(firstResult.statusCode).toBe(200);

      const secondResult = updateAstronaut(validSessionId, astronautId, secondUpdate);
      expect(secondResult.statusCode).toBe(200);
    });
  });

  describe('Authentication Errors', () => {
    test('returns 401 for invalid session', () => {
      const updates = {
        nameFirst: 'Test',
        nameLast: 'User',
        rank: 'Captain',
        age: 30,
        weight: 70,
        height: 170
      };

      const result = updateAstronaut('invalid-session', astronautId, updates);
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 for empty session', () => {
      const updates = {
        nameFirst: 'Test',
        nameLast: 'User',
        rank: 'Captain',
        age: 30,
        weight: 70,
        height: 170
      };

      const result = updateAstronaut('', astronautId, updates);
      expectError(result, 401, getSessionInvalidMessage());
    });
  });

  describe('Authorization Errors', () => {
    test('returns 400 for invalid astronaut ID', () => {
      const updates = {
        nameFirst: 'Test',
        nameLast: 'User',
        rank: 'Captain',
        age: 30,
        weight: 70,
        height: 170
      };

      const result = updateAstronaut(validSessionId, -1, updates);
      expectError(result, 400, getAstronautIdInvalidMessage());
    });

    test('returns 400 for non-existent astronaut ID', () => {
      const updates = {
        nameFirst: 'Test',
        nameLast: 'User',
        rank: 'Captain',
        age: 30,
        weight: 70,
        height: 170
      };

      const result = updateAstronaut(validSessionId, 99999, updates);
      expect(result.statusCode).toBe(400);
    });

    test('allows updating astronaut by different user (no isolation)', () => {
      // Create another user
      const otherUser = {
        email: 'other@example.com',
        password: 'password123',
        nameFirst: 'Other',
        nameLast: 'User'
      };
      const otherSessionId = registerUser(otherUser);

      const updates = {
        nameFirst: 'Test',
        nameLast: 'User',
        rank: 'Captain',
        age: 30,
        weight: 70,
        height: 170
      };

      const result = updateAstronaut(otherSessionId, astronautId, updates);
      expect(result.statusCode).toBe(200);
    });
  });

  describe('Validation Errors', () => {
    test('returns 400 for invalid nameFirst', () => {
      const updates = {
        nameFirst: '', // empty
        nameLast: 'Kirk',
        rank: 'Captain',
        age: 35,
        weight: 75,
        height: 175
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expectError(result, 400, getNameFirstLengthMessage());
    });

    test('returns 400 for invalid nameLast', () => {
      const updates = {
        nameFirst: 'James',
        nameLast: '', // empty
        rank: 'Captain',
        age: 35,
        weight: 75,
        height: 175
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expectError(result, 400, getNameLastLengthMessage());
    });

    test('returns 400 for nameFirst too long', () => {
      const updates = {
        nameFirst: 'a'.repeat(getNameMaxLength() + 1), // too long
        nameLast: 'Kirk',
        rank: 'Captain',
        age: 35,
        weight: 75,
        height: 175
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expectError(result, 400, getNameFirstLengthMessage());
    });

    test('returns 400 for nameLast too long', () => {
      const updates = {
        nameFirst: 'James',
        nameLast: 'a'.repeat(getNameMaxLength() + 1), // too long
        rank: 'Captain',
        age: 35,
        weight: 75,
        height: 175
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expectError(result, 400, getNameLastLengthMessage());
    });

    test('returns 400 for rank too long', () => {
      const updates = {
        nameFirst: 'James',
        nameLast: 'Kirk',
        rank: 'a'.repeat(getRankMaxLength() + 1), // too long
        age: 35,
        weight: 75,
        height: 175
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expectError(result, 400, getAstronautRankInvalidLengthMessage());
    });

    test('returns 400 for rank with invalid characters', () => {
      const updates = {
        nameFirst: 'James',
        nameLast: 'Kirk',
        rank: 'Captain@#$', // invalid characters
        age: 35,
        weight: 75,
        height: 175
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expectError(result, 400, getAstronautRankInvalidCharsUpdateMessage());
    });

    test('returns 400 for invalid age', () => {
      const updates = {
        nameFirst: 'James',
        nameLast: 'Kirk',
        rank: 'Captain',
        age: 15, // too young
        weight: 75,
        height: 175
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expectError(result, 400, getAstronautAgeInvalidMessage());
    });

    test('returns 400 for invalid weight', () => {
      const updates = {
        nameFirst: 'James',
        nameLast: 'Kirk',
        rank: 'Captain',
        age: 35,
        weight: 0, // too low
        height: 175
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expectError(result, 400, getAstronautWeightInvalidMessage());
    });

    test('returns 400 for invalid height', () => {
      const updates = {
        nameFirst: 'James',
        nameLast: 'Kirk',
        rank: 'Captain',
        age: 35,
        weight: 75,
        height: 149 // too short
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expectError(result, 400, getAstronautHeightInvalidMessage());
    });

    test('returns 400 for duplicate astronaut name', () => {
      // Create another astronaut
      const otherAstronaut = {
        nameFirst: 'Spock',
        nameLast: 'Vulcan',
        rank: 'Commander',
        age: 40,
        weight: 70,
        height: 180
      };
      const otherAstronautId = createAstronaut(validSessionId, otherAstronaut);

      // Try to update first astronaut with same name as second
      const updates = {
        nameFirst: 'Spock',
        nameLast: 'Vulcan',
        rank: 'Captain',
        age: 35,
        weight: 75,
        height: 175
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expectError(result, 400, getAstronautNameAlreadyExistsMessage());
    });
  });

  describe('Edge Cases', () => {
    test('handles floating point weight values', () => {
      const updates = {
        nameFirst: 'James',
        nameLast: 'Kirk',
        rank: 'Captain',
        age: 35,
        weight: 75.75, // floating point
        height: 175
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expect(result.statusCode).toBe(200);
    });

    test('handles boundary values correctly', () => {
      const updates = {
        nameFirst: 'Ab', // minimum length
        nameLast: 'Cd', // minimum length
        rank: 'Ensig', // minimum length
        age: 20, // minimum age
        weight: 1, // minimum weight
        height: 150 // minimum height
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expect(result.statusCode).toBe(200);
    });

    test('handles maximum boundary values correctly', () => {
      const updates = {
        nameFirst: 'a'.repeat(getNameMaxLength()),
        nameLast: 'b'.repeat(getNameMaxLength()),
        rank: 'c'.repeat(getRankMaxLength()),
        age: 60, // maximum age
        weight: 100, // maximum weight
        height: 200 // maximum height
      };

      const result = updateAstronaut(validSessionId, astronautId, updates);
      expect(result.statusCode).toBe(200);
    });
  });

  describe('User Isolation', () => {
    test('allows updating astronauts by different users', () => {
      // Create second user
      const secondUser = {
        email: 'second@example.com',
        password: 'password123',
        nameFirst: 'Second',
        nameLast: 'User'
      };
      const secondSessionId = registerUser(secondUser);

      const updates = {
        nameFirst: 'Hacker',
        nameLast: 'User',
        rank: 'Admiral',
        age: 30,
        weight: 70,
        height: 170
      };

      const result = updateAstronaut(secondSessionId, astronautId, updates);
      expect(result.statusCode).toBe(200);
    });

    test('users can update their own astronauts after logout and login', () => {
      // Logout
      const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });
      expect(logoutResult.statusCode).toBe(200);

      // Login again
      const loginResult = apiRequest('POST', '/v1/admin/auth/login', {
        json: { email: VALID_USER.email, password: VALID_USER.password },
        fullResponse: true
      });
      expect(loginResult.statusCode).toBe(200);
      const newSessionId = loginResult.body.controlUserSessionId;

      const updates = {
        nameFirst: 'Updated',
        nameLast: 'Name',
        rank: 'Admiral',
        age: 40,
        weight: 80,
        height: 180
      };

      const result = updateAstronaut(newSessionId, astronautId, updates);
      expect(result.statusCode).toBe(200);
    });
  });
});