import { apiRequest, expectSuccess, expectError, expectValidSessionId, setupTest, expectHasError, getSessionId, getUser, getMissionId, getAstronautId, getBodyProperty, getUserEmail, getUserName, getUserId, getUserLogins, getUserFailedLogins, getValue } from '../fakepi/helpers';
import { 
  getSessionInvalidMessage,
  getNameFirstInvalidMessage,
  getNameLastInvalidMessage,
  getNameFirstLengthMessage,
  getNameLastLengthMessage,
  getAstronautRankInvalidLengthMessage,
  getAstronautRankInvalidCharsCreateMessage,
  getAstronautAgeInvalidMessage,
  getAstronautWeightInvalidMessage,
  getAstronautHeightInvalidMessage,
  getAstronautNameAlreadyExistsMessage,
  getNameMaxLength,
  getRankMaxLength,
  getAgeMin,
  getAgeMax,
  getWeightMax,
  getHeightMin,
  getHeightMax
} from '../../src/other';

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

function createAstronaut(token: string, astronaut: any): any {
  return apiRequest('POST', '/v1/admin/astronaut', {
    json: astronaut,
    headers: {
      'controlUserSessionId': token
    },
    fullResponse: true
  });
}

// Test suite
describe('POST /v1/admin/astronaut', () => {
  let validSessionId: string;

  beforeEach(() => {
    // Clear data using apiRequest
    const clearResponse = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearResponse.statusCode).toBe(200);
    
    validSessionId = registerUser(VALID_USER);
  });

  describe('Success Cases', () => {
    test('successfully creates astronaut with valid parameters', () => {
      const result = createAstronaut(validSessionId, VALID_ASTRONAUT);

      expect(result.statusCode).toBe(200);
      expect(result.body.astronautId).toBeDefined();
      expect(typeof result.body.astronautId).toBe('number');
    });

    test('successfully creates astronaut with minimum valid values', () => {
      const minAstronaut = {
        nameFirst: 'Ab', // 2 characters
        nameLast: 'Cd', // 2 characters
        rank: 'Ensig', // 5 characters
        age: getAgeMin(), // minimum age
        weight: 1, // minimum weight
        height: getHeightMin() // minimum height
      };

      const result = createAstronaut(validSessionId, minAstronaut);

      expectSuccess(result, 200);
      expect(result.body.astronautId).toBeDefined();
      expect(typeof result.body.astronautId).toBe('number');
    });

    test('successfully creates astronaut with maximum valid values', () => {
      const maxAstronaut = {
        nameFirst: 'a'.repeat(getNameMaxLength()), // 20 characters
        nameLast: 'b'.repeat(getNameMaxLength()), // 20 characters
        rank: 'c'.repeat(getRankMaxLength()), // 50 characters
        age: getAgeMax(), // maximum age
        weight: getWeightMax(), // maximum weight
        height: getHeightMax() // maximum height
      };

      const result = createAstronaut(validSessionId, maxAstronaut);

      expectSuccess(result, 200);
      expect(result.body.astronautId).toBeDefined();
      expect(typeof result.body.astronautId).toBe('number');
    });

    test('successfully creates astronaut with names containing valid special characters', () => {
      const specialAstronaut = {
        nameFirst: "Mary-Jane O'Connor",
        nameLast: 'Smith-Jones',
        rank: "Lieutenant Colonel",
        age: 30,
        weight: 65.5,
        height: 175
      };

      const result = createAstronaut(validSessionId, specialAstronaut);

      expectSuccess(result, 200);
      expect(result.body.astronautId).toBeDefined();
      expect(typeof result.body.astronautId).toBe('number');
    });

    test('successfully creates astronaut with rank containing valid special characters', () => {
      const specialRankAstronaut = {
        nameFirst: 'John',
        nameLast: 'Doe',
        rank: "Lieutenant Colonel (Retired)",
        age: 35,
        weight: 75,
        height: 180
      };

      const result = createAstronaut(validSessionId, specialRankAstronaut);

      expect(result.statusCode).toBe(200);
      expect(result.body.astronautId).toBeDefined();
      expect(typeof result.body.astronautId).toBe('number');
    });

    test('successfully creates multiple different astronauts', () => {
      const astronauts = [
        { ...VALID_ASTRONAUT, nameFirst: 'James', nameLast: 'Kirk' },
        { ...VALID_ASTRONAUT, nameFirst: 'Jean-Luc', nameLast: 'Picard' },
        { ...VALID_ASTRONAUT, nameFirst: 'Benjamin', nameLast: 'Sisko' }
      ];

      astronauts.forEach(astronaut => {
        const result = createAstronaut(validSessionId, astronaut);
        expect(result.statusCode).toBe(200);
        expect(result.body.astronautId).toBeDefined();
      });
    });
  });

  describe('Error Cases - 401 Unauthorized', () => {
    test('returns 401 when session token is empty', () => {
      const result = createAstronaut('', VALID_ASTRONAUT);

      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 when session token is invalid', () => {
      const result = createAstronaut('invalid-session-id', VALID_ASTRONAUT);

      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 when user is logged out', () => {
      // Logout user
      const logoutResponse = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          'controlUserSessionId': validSessionId
        },
        fullResponse: true
      });
      expect(logoutResponse.statusCode).toBe(200);

      const result = createAstronaut(validSessionId, VALID_ASTRONAUT);

      expectError(result, 401, getSessionInvalidMessage());
    });
  });

  describe('Error Cases - 400 Bad Request - Duplicate Names', () => {
    test('returns 400 when astronaut with same nameFirst and nameLast already exists', () => {
      // Create first astronaut
      const firstResult = createAstronaut(validSessionId, VALID_ASTRONAUT);
      expectSuccess(firstResult, 200);

      // Try to create duplicate astronaut
      const duplicateResult = createAstronaut(validSessionId, VALID_ASTRONAUT);

      expectError(duplicateResult, 400, getAstronautNameAlreadyExistsMessage());
    });

    test('returns 400 when astronaut with same name (case insensitive) already exists', () => {
      // Create first astronaut
      const firstResult = createAstronaut(validSessionId, VALID_ASTRONAUT);
      expectSuccess(firstResult, 200);

      // Try to create astronaut with same name but different case
      const differentCaseAstronaut = {
        ...VALID_ASTRONAUT,
        nameFirst: VALID_ASTRONAUT.nameFirst.toUpperCase(),
        nameLast: VALID_ASTRONAUT.nameLast.toUpperCase()
      };

      const duplicateResult = createAstronaut(validSessionId, differentCaseAstronaut);

      expectError(duplicateResult, 400, getAstronautNameAlreadyExistsMessage());
    });
  });

  describe('Error Cases - 400 Bad Request - Invalid Names', () => {
    test('returns 400 when nameFirst is too short', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        nameFirst: 'A' // 1 character
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getNameFirstLengthMessage());
    });

    test('returns 400 when nameFirst is too long', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        nameFirst: 'a'.repeat(getNameMaxLength() + 1) // 21 characters
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getNameFirstLengthMessage());
    });

    test('returns 400 when nameLast is too short', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        nameLast: 'B' // 1 character
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getNameLastLengthMessage());
    });

    test('returns 400 when nameLast is too long', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        nameLast: 'b'.repeat(getNameMaxLength() + 1) // 21 characters
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getNameLastLengthMessage());
    });

    test('returns 400 when nameFirst contains invalid characters', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        nameFirst: 'John123' // Contains numbers
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getNameFirstInvalidMessage());
    });

    test('returns 400 when nameLast contains invalid characters', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        nameLast: 'Doe@#$' // Contains special characters
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getNameLastInvalidMessage());
    });
  });

  describe('Error Cases - 400 Bad Request - Invalid Rank', () => {
    test('returns 400 when rank is too short', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        rank: 'Capt' // 4 characters
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautRankInvalidLengthMessage());
    });

    test('returns 400 when rank is too long', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        rank: 'a'.repeat(getRankMaxLength() + 1) // 51 characters
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautRankInvalidLengthMessage());
    });

    test('returns 400 when rank contains invalid characters', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        rank: 'Captain123' // Contains numbers
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautRankInvalidCharsCreateMessage());
    });
  });

  describe('Error Cases - 400 Bad Request - Invalid Age', () => {
    test('returns 400 when age is too low', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        age: 19 // Below minimum
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautAgeInvalidMessage());
    });

    test('returns 400 when age is too high', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        age: 61 // Above maximum
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautAgeInvalidMessage());
    });

    test('returns 400 when age is not a number', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        age: 'thirty' // String instead of number
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautAgeInvalidMessage());
    });
  });

  describe('Error Cases - 400 Bad Request - Invalid Weight', () => {
    test('returns 400 when weight is too low', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        weight: -1 // Below minimum (negative weight)
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautWeightInvalidMessage());
    });

    test('returns 400 when weight is too high', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        weight: 101 // Above maximum
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautWeightInvalidMessage());
    });

    test('returns 400 when weight is not a number', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        weight: 'seventy' // String instead of number
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautWeightInvalidMessage());
    });
  });

  describe('Error Cases - 400 Bad Request - Invalid Height', () => {
    test('returns 400 when height is too low', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        height: 149 // Below minimum
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautHeightInvalidMessage());
    });

    test('returns 400 when height is too high', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        height: 201 // Above maximum
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautHeightInvalidMessage());
    });

    test('returns 400 when height is not a number', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        height: 'tall' // String instead of number
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautHeightInvalidMessage());
    });
  });

  describe('Error Cases - 400 Bad Request - Missing Fields', () => {
    test('returns 400 when nameFirst is missing', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        nameFirst: undefined
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getNameFirstLengthMessage());
    });

    test('returns 400 when nameLast is missing', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        nameLast: undefined
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getNameLastLengthMessage());
    });

    test('returns 400 when rank is missing', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        rank: undefined
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautRankInvalidLengthMessage());
    });

    test('returns 400 when age is missing', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        age: undefined
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautAgeInvalidMessage());
    });

    test('returns 400 when weight is missing', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        weight: undefined
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautWeightInvalidMessage());
    });

    test('returns 400 when height is missing', () => {
      const invalidAstronaut = {
        ...VALID_ASTRONAUT,
        height: undefined
      };

      const result = createAstronaut(validSessionId, invalidAstronaut);

      expectError(result, 400, getAstronautHeightInvalidMessage());
    });

    test('returns 400 when all fields are missing', () => {
      const result = createAstronaut(validSessionId, {});

      expectError(result, 400, getNameFirstLengthMessage());
    });
  });
});