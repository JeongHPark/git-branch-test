import { apiRequest } from '../fakepi/helpers';
import { 
  getSessionInvalidMessage,
  getAstronautIdInvalidMessage,
  getAstronautCurrentlyAssignedMessage
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

function createAstronaut(token: string, astronaut: any): number {
  const result = apiRequest('POST', '/v1/admin/astronaut', {
    json: astronaut,
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(result.statusCode).toBe(200);
  return result.body.astronautId;
}

function removeAstronaut(token: string, astronautId: number): any {
  return apiRequest('DELETE', `/v1/admin/astronaut/${astronautId}`, {
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
}

function getAstronautPool(token: string): any {
  return apiRequest('GET', '/v1/admin/astronaut/pool', {
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
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

function assignAstronautToMission(token: string, missionId: number, astronautId: number): void {
  const result = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
    json: {},
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(result.statusCode).toBe(200);
}

function clearData(): void {
  const response = apiRequest('DELETE', '/clear', { fullResponse: true });
  expect(response.statusCode).toBe(200);
}

// Test suite
describe('DELETE /v1/admin/astronaut/{astronautid}', () => {
  let validSessionId: string;

  beforeEach(() => {
    clearData();
    validSessionId = registerUser(VALID_USER);
  });

  describe('Success Cases', () => {
    test('successfully removes astronaut from pool', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      const result = removeAstronaut(validSessionId, astronautId);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });

    test('astronaut is removed from pool after deletion', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      // Verify astronaut exists
      const poolBefore = getAstronautPool(validSessionId);
      expect(poolBefore.statusCode).toBe(200);
      expect(poolBefore.body.astronauts).toHaveLength(1);

      // Remove astronaut
      const result = removeAstronaut(validSessionId, astronautId);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
      
      // Verify astronaut is gone
      const poolAfter = getAstronautPool(validSessionId);
      expect(poolAfter.statusCode).toBe(200);
      expect(poolAfter.body.astronauts).toHaveLength(0);
    });

    test('successfully removes one astronaut while keeping others', () => {
      const astronaut1Id = createAstronaut(validSessionId, {
        ...VALID_ASTRONAUT,
        nameFirst: 'James',
        nameLast: 'Kirk'
      });
      const astronaut2Id = createAstronaut(validSessionId, {
        ...VALID_ASTRONAUT,
        nameFirst: 'Jean-Luc',
        nameLast: 'Picard'
      });

      // Remove first astronaut
      const result = removeAstronaut(validSessionId, astronaut1Id);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
      
      // Verify only second astronaut remains
      const pool = getAstronautPool(validSessionId);
      expect(pool.statusCode).toBe(200);
      expect(pool.body.astronauts).toHaveLength(1);
      expect(pool.body.astronauts[0].astronautId).toBe(astronaut2Id);
    });

    test('successfully removes multiple astronauts sequentially', () => {
      const astronautIds = [];
      const names = ['Alpha', 'Beta', 'Gamma'];
      for (let i = 0; i < 3; i++) {
        astronautIds.push(createAstronaut(validSessionId, {
          ...VALID_ASTRONAUT,
          nameFirst: `Astronaut ${names[i]}`,
          nameLast: `Test ${names[i]}`
        }));
      }

      // Remove all astronauts
      astronautIds.forEach(id => {
        const result = removeAstronaut(validSessionId, id);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({});
      });

      // Verify pool is empty
      const pool = getAstronautPool(validSessionId);
      expect(pool.statusCode).toBe(200);
      expect(pool.body.astronauts).toHaveLength(0);
    });

    test('can remove and recreate astronaut with same name', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      // Remove astronaut
      const removeResult = removeAstronaut(validSessionId, astronautId);
      expect(removeResult.statusCode).toBe(200);
      expect(removeResult.body).toEqual({});
      
      // Create new astronaut with same name
      const newAstronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);
      expect(newAstronautId).toBeDefined();
      expect(newAstronautId).not.toBe(astronautId); // Should have different ID
    });
  });

  describe('Authentication Errors', () => {
    test('returns 401 when session token is empty', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      const result = removeAstronaut('', astronautId);
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 when session token is invalid', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      const result = removeAstronaut('invalid-session-id', astronautId);
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 when user is logged out', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      // Logout user
      const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });
      expect(logoutResult.statusCode).toBe(200);

      const result = removeAstronaut(validSessionId, astronautId);
      expectError(result, 401, getSessionInvalidMessage());
    });
  });

  describe('Authorization Errors', () => {
    test('returns 400 when astronaut ID is invalid (negative)', () => {
      const result = removeAstronaut(validSessionId, -1);
      expectError(result, 400, getAstronautIdInvalidMessage());
    });

    test('returns 400 when astronaut ID is invalid (zero)', () => {
      const result = removeAstronaut(validSessionId, 0);
      expectError(result, 400, getAstronautIdInvalidMessage());
    });

    test('returns 400 when astronaut ID does not exist', () => {
      const result = removeAstronaut(validSessionId, 99999);
      expectError(result, 400, getAstronautIdInvalidMessage());
    });
  });

  describe('Business Logic Errors', () => {
    test('returns 400 when trying to remove astronaut assigned to mission', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);
      const missionId = createMission(validSessionId, VALID_MISSION);
      
      // Assign astronaut to mission
      assignAstronautToMission(validSessionId, missionId, astronautId);

      // Try to remove assigned astronaut
      const result = removeAstronaut(validSessionId, astronautId);
      expectError(result, 400, getAstronautCurrentlyAssignedMessage());
    });

    test('can remove astronaut after unassigning from mission', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);
      const missionId = createMission(validSessionId, VALID_MISSION);
      
      // Assign astronaut to mission
      assignAstronautToMission(validSessionId, missionId, astronautId);

      // Unassign astronaut from mission
      const unassignResult = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });
      expect(unassignResult.statusCode).toBe(200);

      // Now should be able to remove astronaut
      const result = removeAstronaut(validSessionId, astronautId);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    test('handles removal of astronaut with special characters in name', () => {
      const specialAstronaut = {
        nameFirst: "Jean-Luc",
        nameLast: "O'Connor-Smith",
        rank: "Lieutenant Colonel",
        age: 35,
        weight: 75,
        height: 180
      };
      const astronautId = createAstronaut(validSessionId, specialAstronaut);

      const result = removeAstronaut(validSessionId, astronautId);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });

    test('handles removal when pool has multiple astronauts', () => {
      // Create several astronauts with unique names
      const astronaut1Id = createAstronaut(validSessionId, {
        nameFirst: 'Alpha',
        nameLast: 'One',
        rank: 'Captain',
        age: 35,
        weight: 75,
        height: 175
      });
      
      const astronaut2Id = createAstronaut(validSessionId, {
        nameFirst: 'Beta',
        nameLast: 'Two',
        rank: 'Commander',
        age: 40,
        weight: 80,
        height: 180
      });
      
      const astronaut3Id = createAstronaut(validSessionId, {
        nameFirst: 'Gamma',
        nameLast: 'Three',
        rank: 'Lieutenant',
        age: 30,
        weight: 70,
        height: 170
      });

      // Remove one from the middle
      const result = removeAstronaut(validSessionId, astronaut2Id);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});

      // Verify correct astronaut was removed
      const pool = getAstronautPool(validSessionId);
      expect(pool.statusCode).toBe(200);
      expect(pool.body.astronauts).toHaveLength(2);
      
      const remainingIds = pool.body.astronauts.map((a: any) => a.astronautId);
      expect(remainingIds).not.toContain(astronaut2Id);
      expect(remainingIds).toContain(astronaut1Id);
      expect(remainingIds).toContain(astronaut3Id);
    });

    test('handles concurrent removal attempts', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      // First removal should succeed
      const result1 = removeAstronaut(validSessionId, astronautId);
      expect(result1.statusCode).toBe(200);
      expect(result1.body).toEqual({});

      // Second removal should fail
      const result2 = removeAstronaut(validSessionId, astronautId);
      expectError(result2, 400, getAstronautIdInvalidMessage());
    });
  });

  describe('User Isolation', () => {
    test('users can remove each others astronauts (no isolation)', () => {
      // Create second user
      const secondUser = {
        email: 'second@example.com',
        password: 'password123',
        nameFirst: 'Second',
        nameLast: 'User'
      };
      const secondSessionId = registerUser(secondUser);

      // First user creates astronaut
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      // Second user can remove first user's astronaut
      const result = removeAstronaut(secondSessionId, astronautId);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});
    });

    test('pool shows all astronauts regardless of creator', () => {
      // Create second user
      const secondUser = {
        email: 'second@example.com',
        password: 'password123',
        nameFirst: 'Second',
        nameLast: 'User'
      };
      const secondSessionId = registerUser(secondUser);

      // Both users create astronauts with completely different names
      const astronaut1Id = createAstronaut(validSessionId, {
        nameFirst: 'Alpha',
        nameLast: 'Prime',
        rank: 'Captain',
        age: 35,
        weight: 75,
        height: 175
      });
      const astronaut2Id = createAstronaut(secondSessionId, {
        nameFirst: 'Beta',
        nameLast: 'Secondary',
        rank: 'Commander',
        age: 40,
        weight: 80,
        height: 180
      });

      // First user removes their astronaut
      const result = removeAstronaut(validSessionId, astronaut1Id);
      expect(result.statusCode).toBe(200);

      // Both users should see only the remaining astronaut
      const pool1 = getAstronautPool(validSessionId);
      expect(pool1.statusCode).toBe(200);
      expect(pool1.body.astronauts).toHaveLength(1);
      expect(pool1.body.astronauts[0].astronautId).toBe(astronaut2Id);

      const pool2 = getAstronautPool(secondSessionId);
      expect(pool2.statusCode).toBe(200);
      expect(pool2.body.astronauts).toHaveLength(1);
      expect(pool2.body.astronauts[0].astronautId).toBe(astronaut2Id);
    });
  });
});