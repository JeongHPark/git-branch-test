import { apiRequest, expectSuccess, expectError, expectValidSessionId, setupTest, expectHasError, getSessionId, getUser, getMissionId, getAstronautId, getBodyProperty, getUserEmail, getUserName, getUserId, getUserLogins, getUserFailedLogins, getAstronautsFromPool, getAstronautIdFromPoolItem, getPoolLength } from '../fakepi/helpers';
import { 
  getSessionInvalidMessage,
  getNameMinLength,
  getNameMaxLength,
  getRankMinLength,
  getRankMaxLength,
  getAgeMin,
  getAgeMax,
  getWeightMax,
  getHeightMin,
  getHeightMax
} from '../../src/other';

const SERVER_URL = 'http://127.0.0.1:3200';
const CLEAR_URL = `${SERVER_URL}/clear`;
const REGISTER_URL = `${SERVER_URL}/v1/admin/auth/register`;
const ASTRONAUT_POOL_URL = `${SERVER_URL}/v1/admin/astronaut/pool`;
const ASTRONAUT_CREATE_URL = `${SERVER_URL}/v1/admin/astronaut`;
const MISSION_CREATE_URL = `${SERVER_URL}/v1/admin/mission`;

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
  rank: 'Captain Commanding',
  age: 35,
  weight: 75,
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

function getAstronautPool(token: string): any {
  const response = apiRequest('GET', '/v1/admin/astronaut/pool', {
    headers: {
      controlUserSessionId: token
    },
    fullResponse: true
  });
  expect(response.statusCode).toBe(200);
  return response.body;
}

function createAstronaut(token: string, astronaut: any): number {
  const response = apiRequest('POST', '/v1/admin/astronaut', {
    json: astronaut,
    headers: {
      controlUserSessionId: token
    },
    fullResponse: true
  });
  expect(response.statusCode).toBe(200);
  return response.body.astronautId;
}

function createMission(token: string, mission: any): number {
  const response = apiRequest('POST', '/v1/admin/mission', {
    json: mission,
    headers: {
      controlUserSessionId: token
    },
    fullResponse: true
  });
  expect(response.statusCode).toBe(200);
  return response.body.missionId;
}

function assignAstronautToMission(token: string, missionId: number, astronautId: number): void {
  const response = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
    json: {},
    headers: {
      controlUserSessionId: token
    },
    fullResponse: true
  });
  expect(response.statusCode).toBe(200);
}

// Test suite
describe('GET /v1/admin/astronaut/pool', () => {
  let validSessionId: string;

  beforeEach(() => {
    // Clear data using apiRequest
    const clearResponse = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearResponse.statusCode).toBe(200);
    
    validSessionId = registerUser(VALID_USER);
  });

  describe('Success Cases', () => {
    test('successfully returns empty astronaut pool', () => {
      const result = getAstronautPool(validSessionId);

      expect(result).toHaveProperty('astronauts');
      const astronauts = result.astronauts;
      expect(Array.isArray(astronauts)).toBe(true);
      expect(astronauts.length).toBe(0);
    });

    test('successfully returns astronaut pool with single astronaut', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);

      const result = getAstronautPool(validSessionId);

      expect(result).toHaveProperty('astronauts');
      const astronauts = result.astronauts;
      expect(Array.isArray(astronauts)).toBe(true);
      expect(astronauts.length).toBe(1);

      const astronaut = astronauts[0];
      expect(astronaut).toHaveProperty('astronautId', astronautId);
      expect(astronaut).toHaveProperty('name');
      expect(astronaut).toHaveProperty('assigned');
      expect(typeof astronaut.name).toBe('string');
      expect(typeof astronaut.assigned).toBe('boolean');
      expect(astronaut.assigned).toBe(false);
    });

    test('successfully returns multiple astronauts in pool', () => {
      const astronauts = [
        { ...VALID_ASTRONAUT, nameFirst: 'James', nameLast: 'Kirk' },
        { ...VALID_ASTRONAUT, nameFirst: 'Jean-Luc', nameLast: 'Picard' },
        { ...VALID_ASTRONAUT, nameFirst: 'Benjamin', nameLast: 'Sisko' }
      ];

      const astronautIds = astronauts.map(astronaut => 
        createAstronaut(validSessionId, astronaut)
      );

      const result = getAstronautPool(validSessionId);

      expect(result).toHaveProperty('astronauts');
      const poolAstronauts = result.astronauts;
      expect(Array.isArray(poolAstronauts)).toBe(true);
      expect(poolAstronauts.length).toBe(3);

      poolAstronauts.forEach((astronaut: any, index: number) => {
        expect(astronaut).toHaveProperty('astronautId', astronautIds[index]);
        expect(astronaut).toHaveProperty('name');
        expect(astronaut).toHaveProperty('assigned', false);
      });
    });

    test('correctly shows astronaut name format (rank + nameFirst + nameLast)', () => {
      const testAstronaut = {
        nameFirst: 'James',
        nameLast: 'Kirk',
        rank: 'Captain Commanding',
        age: 35,
        weight: 75,
        height: 175
      };

      createAstronaut(validSessionId, testAstronaut);

      const result = getAstronautPool(validSessionId);

      const astronauts = result.astronauts;
      const astronaut = astronauts[0];
      expect(astronaut.name).toBe('Captain Commanding James Kirk');
    });

    test('correctly shows assigned status for unassigned astronauts', () => {
      createAstronaut(validSessionId, VALID_ASTRONAUT);

      const result = getAstronautPool(validSessionId);

      const astronauts = result.astronauts;
      const astronaut = astronauts[0];
      expect(astronaut.assigned).toBe(false);
    });

    test('correctly shows assigned status for assigned astronauts', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);
      const missionId = createMission(validSessionId, VALID_MISSION);
      assignAstronautToMission(validSessionId, missionId, astronautId);

      const result = getAstronautPool(validSessionId);

      const astronauts = result.astronauts;
      const astronaut = astronauts[0];
      expect(astronaut.assigned).toBe(true);
    });

    test('shows mixed assigned and unassigned astronauts', () => {
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

      const missionId = createMission(validSessionId, VALID_MISSION);
      assignAstronautToMission(validSessionId, missionId, astronaut1Id);

      const result = getAstronautPool(validSessionId);

      expect(result.astronauts.length).toBe(2);

      const astronauts = result.astronauts;
      const assignedAstronaut = astronauts.find((a: any) => a.astronautId === astronaut1Id);
      const unassignedAstronaut = astronauts.find((a: any) => a.astronautId === astronaut2Id);

      expect(assignedAstronaut.assigned).toBe(true);
      expect(unassignedAstronaut.assigned).toBe(false);
    });

    test('astronaut pool maintains correct order after assignments', () => {
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
      const astronaut3Id = createAstronaut(validSessionId, {
        ...VALID_ASTRONAUT,
        nameFirst: 'Benjamin',
        nameLast: 'Sisko'
      });

      const missionId = createMission(validSessionId, VALID_MISSION);
      assignAstronautToMission(validSessionId, missionId, astronaut2Id);

      const result = getAstronautPool(validSessionId);

      const astronauts = result.astronauts;
      expect(astronauts.length).toBe(3);

      // Verify astronauts are in creation order
      expect(astronauts[0].astronautId).toBe(astronaut1Id);
      expect(astronauts[1].astronautId).toBe(astronaut2Id);
      expect(astronauts[2].astronautId).toBe(astronaut3Id);

      // Verify assignment status
      expect(astronauts[0].assigned).toBe(false);
      expect(astronauts[1].assigned).toBe(true);
      expect(astronauts[2].assigned).toBe(false);
    });

    test('handles astronaut pool with various astronaut data', () => {
      const astronautData = [
        { nameFirst: 'Al', nameLast: 'Bo', rank: 'Captain Commanding', age: getAgeMin(), weight: 50, height: getHeightMin() },
        { nameFirst: 'C'.repeat(getNameMaxLength()), nameLast: 'D'.repeat(getNameMaxLength()), rank: 'Commander in Chief', age: getAgeMax(), weight: getWeightMax(), height: getHeightMax() }
      ];

      const astronautIds = astronautData.map(astronaut => 
        createAstronaut(validSessionId, astronaut)
      );

      const result = getAstronautPool(validSessionId);

      expect(result.astronauts.length).toBe(2);

      const astronauts = result.astronauts;
      astronauts.forEach((astronaut: any, index: number) => {
        expect(astronaut.astronautId).toBe(astronautIds[index]);
        expect(astronaut.assigned).toBe(false);
        expect(typeof astronaut.name).toBe('string');
      });
    });

    test('astronaut pool updates correctly when astronaut is unassigned', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);
      const missionId = createMission(validSessionId, VALID_MISSION);

      // Assign astronaut
      assignAstronautToMission(validSessionId, missionId, astronautId);

      let result = getAstronautPool(validSessionId);
      let astronauts = result.astronauts;
      expect(astronauts[0].assigned).toBe(true);

      // Unassign astronaut
      const unassignResponse = apiRequest('DELETE', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
        headers: {
          controlUserSessionId: validSessionId
        },
        fullResponse: true
      });
      expect(unassignResponse.statusCode).toBe(200);

      result = getAstronautPool(validSessionId);
      astronauts = result.astronauts;
      expect(astronauts[0].assigned).toBe(false);
    });

    test('multiple missions with same astronaut shows correct assignment status', () => {
      const astronautId = createAstronaut(validSessionId, VALID_ASTRONAUT);
      const mission1Id = createMission(validSessionId, { ...VALID_MISSION, name: 'Mission 1' });
      const mission2Id = createMission(validSessionId, { ...VALID_MISSION, name: 'Mission 2' });

      // Assign to first mission
      assignAstronautToMission(validSessionId, mission1Id, astronautId);

      let result = getAstronautPool(validSessionId);
      let astronauts = result.astronauts;
      expect(astronauts[0].assigned).toBe(true);

      // Try to assign to second mission (should fail, but astronaut should still be assigned)
      try {
        assignAstronautToMission(validSessionId, mission2Id, astronautId);
      } catch (error) {
        // Expected to fail
      }

      result = getAstronautPool(validSessionId);
      astronauts = result.astronauts;
      expect(astronauts[0].assigned).toBe(true);
    });

    test('handles large number of astronauts in pool', () => {
      // Create 10 astronauts
      const astronautIds: number[] = [];
      const names = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
      const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
      for (let i = 0; i < 10; i++) {
        const astronautId = createAstronaut(validSessionId, {
          ...VALID_ASTRONAUT,
          nameFirst: names[i],
          nameLast: lastNames[i]
        });
        astronautIds.push(astronautId);
      }

      const result = getAstronautPool(validSessionId);

      expect(result.astronauts.length).toBe(10);

      const astronauts = result.astronauts;
      astronauts.forEach((astronaut: any, index: number) => {
        expect(astronaut.astronautId).toBe(astronautIds[index]);
        expect(astronaut.assigned).toBe(false);
        expect(astronaut.name).toBe(`${VALID_ASTRONAUT.rank} ${names[index]} ${lastNames[index]}`);
      });
    });
  });

  describe('Error Cases', () => {
    test('returns 401 for invalid session token', () => {
      const result = apiRequest('GET', '/v1/admin/astronaut/pool', {
        headers: {
          controlUserSessionId: 'invalid-token'
        },
        fullResponse: true
      });

      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 for empty session token', () => {
      const result = apiRequest('GET', '/v1/admin/astronaut/pool', {
        headers: {
          controlUserSessionId: ''
        },
        fullResponse: true
      });

      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 for missing session token', () => {
      const result = apiRequest('GET', '/v1/admin/astronaut/pool', {
        headers: {},
        fullResponse: true
      });

      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 for expired session token', () => {
      // First logout to invalidate session
      apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          controlUserSessionId: validSessionId
        },
        fullResponse: true
      });

      const result = apiRequest('GET', '/v1/admin/astronaut/pool', {
        headers: {
          controlUserSessionId: validSessionId
        },
        fullResponse: true
      });

      expectError(result, 401, getSessionInvalidMessage());
    });

    test('returns 401 for malformed session token', () => {
      const malformedTokens = [
        'null',
        'undefined',
        '123',
        'short',
        'a'.repeat(1000),
        'session with spaces',
        'session@with#special$chars'
      ];

      for (const token of malformedTokens) {
        const result = apiRequest('GET', '/v1/admin/astronaut/pool', {
          headers: {
            controlUserSessionId: token
          },
          fullResponse: true
        });

        expectError(result, 401, getSessionInvalidMessage());
      }
    });
  });

  describe('Edge Cases', () => {
    test('pool remains consistent after astronaut deletion', () => {
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

      // Delete first astronaut
      const deleteResponse = apiRequest('DELETE', `/v1/admin/astronaut/${astronaut1Id}`, {
        headers: {
          controlUserSessionId: validSessionId
        },
        fullResponse: true
      });
      expect(deleteResponse.statusCode).toBe(200);

      const result = getAstronautPool(validSessionId);

      expect(result.astronauts.length).toBe(1);

      const astronauts = result.astronauts;
      expect(astronauts[0].astronautId).toBe(astronaut2Id);
      expect(astronauts[0].name).toBe('Captain Commanding Jean-Luc Picard');
    });
  });
});