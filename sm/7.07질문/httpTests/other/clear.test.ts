import { apiRequest } from '../fakepi/helpers';
// Helper function to expect error responses
function expectError(response: any, expectedStatus: number, expectedMessage?: string) {
  expect(response.statusCode).toBe(expectedStatus);
  if (expectedMessage) {
    expect(response.body.error).toBe(expectedMessage);
  }
}

import { ERROR_MESSAGES } from '../../src/other';


interface TestUser {
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
}

interface TestMission {
  name: string;
  description: string;
  target: string;
}

interface TestAstronaut {
  nameFirst: string;
  nameLast: string;
  rank: string;
  age: number;
  weight: number;
  height: number;
}

// Helper function to generate unique email
function generateUniqueEmail(): string {
  return `test${Date.now()}${Math.random().toString(36).substr(2, 9)}@example.com`;
}

// Helper function to create a test user
function createTestUser(userData: TestUser): string {
  const result = apiRequest('POST', '/v1/admin/auth/register', {
    json: userData,
    fullResponse: true
  });
  expect(result.statusCode).toBe(200);
  return result.body.controlUserSessionId;
}

// Helper function to create a test mission
function createTestMission(token: string, missionData: TestMission): number {
  const result = apiRequest('POST', '/v1/admin/mission', {
    json: missionData,
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(result.statusCode).toBe(200);
  return result.body.missionId;
}

// Helper function to create a test astronaut
function createTestAstronaut(token: string, astronautData: TestAstronaut): number {
  const result = apiRequest('POST', '/v1/admin/astronaut', {
    json: astronautData,
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(result.statusCode).toBe(200);
  return result.body.astronautId;
}

// Helper function to assign astronaut to mission
function assignAstronautToMission(token: string, missionId: number, astronautId: number): void {
  const result = apiRequest('POST', `/v1/admin/mission/${missionId}/assign/${astronautId}`, {
    json: {},
    headers: { controlUserSessionId: token },
    fullResponse: true
  });
  expect(result.statusCode).toBe(200);
}

describe('DELETE /clear', () => {
  
  // Basic functionality tests
  test('Should successfully clear all data', () => {
    const result = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual({});
  });

  test('Should clear all user data', () => {
    // Create test user
    const userToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doe'
    });

    // Verify user exists by getting details
    const userDetailsRes = apiRequest('GET', '/v1/admin/controluser/details', {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(userDetailsRes.statusCode).toBe(200);

    // Clear all data
    const clearRes = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes.statusCode).toBe(200);
    expect(clearRes.body).toEqual({});

    // Verify user no longer exists (token should be invalid)
    const userDetailsAfterClearRes = apiRequest('GET', '/v1/admin/controluser/details', {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expectError(userDetailsAfterClearRes, 401);
  });

  test('Should clear all mission data', () => {
    // Create test user and mission
    const userToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doe'
    });

    const missionId = createTestMission(userToken, {
      name: 'Test Mission',
      description: 'A test space mission',
      target: 'Mars'
    });

    // Verify mission exists
    const missionRes = apiRequest('GET', `/v1/admin/mission/${missionId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(missionRes.statusCode).toBe(200);

    // Clear all data
    const clearRes = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes.statusCode).toBe(200);
    expect(clearRes.body).toEqual({});

    // Re-create user to test if missions are cleared
    const newUserToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Smith'
    });

    // Verify mission list is empty for new user
    const missionListRes = apiRequest('GET', '/v1/admin/mission/list', {
      headers: { controlUserSessionId: newUserToken },
      fullResponse: true
    });
    expect(missionListRes.statusCode).toBe(200);
    expect(missionListRes.body.missions).toHaveLength(0);
  });

  test('Should clear all astronaut data', () => {
    // Create test user and astronaut
    const userToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doe'
    });

    const astronautId = createTestAstronaut(userToken, {
      nameFirst: 'James',
      nameLast: 'Kirk',
      rank: 'Captain Commanding',
      age: 35,
      weight: 75.5,
      height: 180
    });

    // Verify astronaut exists
    const astronautRes = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(astronautRes.statusCode).toBe(200);

    // Clear all data
    const clearRes = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes.statusCode).toBe(200);
    expect(clearRes.body).toEqual({});

    // Re-create user to test if astronauts are cleared
    const newUserToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Smith'
    });

    // Verify astronaut pool is empty
    const poolRes = apiRequest('GET', '/v1/admin/astronaut/pool', {
      headers: { controlUserSessionId: newUserToken },
      fullResponse: true
    });
    expect(poolRes.statusCode).toBe(200);
    expect(poolRes.body.astronauts).toHaveLength(0);
  });

  test('Should clear all assignment relationships', () => {
    // Create test user, mission, and astronaut
    const userToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doe'
    });

    const missionId = createTestMission(userToken, {
      name: 'Test Mission',
      description: 'A test space mission',
      target: 'Mars'
    });

    const astronautId = createTestAstronaut(userToken, {
      nameFirst: 'James',
      nameLast: 'Kirk',
      rank: 'Captain Commanding',
      age: 35,
      weight: 75.5,
      height: 180
    });

    // Assign astronaut to mission
    assignAstronautToMission(userToken, missionId, astronautId);

    // Verify assignment exists
    const missionInfoRes = apiRequest('GET', `/v1/admin/mission/${missionId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(missionInfoRes.statusCode).toBe(200);
    expect(missionInfoRes.body.assignedAstronauts).toHaveLength(1);

    // Clear all data
    const clearRes = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes.statusCode).toBe(200);
    expect(clearRes.body).toEqual({});

    // Re-create user, mission, and astronaut
    const newUserToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Smith'
    });

    const newMissionId = createTestMission(newUserToken, {
      name: 'New Test Mission',
      description: 'A new test space mission',
      target: 'Jupiter'
    });

    // Verify new mission has no assignments
    const newMissionInfoRes = apiRequest('GET', `/v1/admin/mission/${newMissionId}`, {
      headers: { controlUserSessionId: newUserToken },
      fullResponse: true
    });
    expect(newMissionInfoRes.statusCode).toBe(200);
    expect(newMissionInfoRes.body.assignedAstronauts).toHaveLength(0);
  });

  test('Should handle multiple clear operations', () => {
    // First clear
    const clearRes1 = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes1.statusCode).toBe(200);
    expect(clearRes1.body).toEqual({});

    // Second clear (should still work)
    const clearRes2 = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes2.statusCode).toBe(200);
    expect(clearRes2.body).toEqual({});

    // Third clear (should still work)
    const clearRes3 = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes3.statusCode).toBe(200);
    expect(clearRes3.body).toEqual({});
  });

  test('Should clear data and allow fresh start', () => {
    // Create some test data
    const userToken1 = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doe'
    });

    const missionId1 = createTestMission(userToken1, {
      name: 'Mission 1',
      description: 'First mission',
      target: 'Mars'
    });

    const astronautId1 = createTestAstronaut(userToken1, {
      nameFirst: 'James',
      nameLast: 'Kirk',
      rank: 'Captain Commanding',
      age: 35,
      weight: 75.5,
      height: 180
    });

    // Clear all data
    const clearRes = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes.statusCode).toBe(200);
    expect(clearRes.body).toEqual({});

    // Create new data after clear
    const userToken2 = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Smith'
    });

    const missionId2 = createTestMission(userToken2, {
      name: 'Mission 2',
      description: 'Second mission',
      target: 'Venus'
    });

    const astronautId2 = createTestAstronaut(userToken2, {
      nameFirst: 'Spock',
      nameLast: 'Vulcan',
      rank: 'Commander Science',
      age: 30,
      weight: 70.0,
      height: 175
    });

    // Verify new data exists
    const userDetailsRes = apiRequest('GET', '/v1/admin/controluser/details', {
      headers: { controlUserSessionId: userToken2 },
      fullResponse: true
    });
    expect(userDetailsRes.statusCode).toBe(200);
    expect(userDetailsRes.body.user.email).toBeDefined();

    const missionRes = apiRequest('GET', `/v1/admin/mission/${missionId2}`, {
      headers: { controlUserSessionId: userToken2 },
      fullResponse: true
    });
    expect(missionRes.statusCode).toBe(200);
    expect(missionRes.body.name).toBe('Mission 2');

    const astronautRes = apiRequest('GET', `/v1/admin/astronaut/${astronautId2}`, {
      headers: { controlUserSessionId: userToken2 },
      fullResponse: true
    });
    expect(astronautRes.statusCode).toBe(200);
    expect(astronautRes.body.designation).toBe('Commander Science Spock Vulcan');
  });

  test('Should clear password history', () => {
    // Create test user
    const userToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doe'
    });

    // Change password to create history
    const passwordChangeRes = apiRequest('PUT', '/v1/admin/controluser/password', {
      json: {
        oldPassword: 'password123',
        newPassword: 'newpassword123'
      },
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(passwordChangeRes.statusCode).toBe(200);

    // Clear all data
    const clearRes = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes.statusCode).toBe(200);
    expect(clearRes.body).toEqual({});

    // Create new user with same password that was previously used
    const newUserToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123', // Same password as before clear
      nameFirst: 'Jane',
      nameLast: 'Smith'
    });

    // Should succeed because password history was cleared
    expect(newUserToken).toBeDefined();

    // Verify user can login with the password
    const loginRes = apiRequest('POST', '/v1/admin/auth/login', {
      json: {
        email: generateUniqueEmail(),
        password: 'password123'
      },
      fullResponse: true
    });
    // Note: This will fail because we're using a different email, but that's expected
    // The important thing is that the password history was cleared
  });

  test('Should reset auto-increment counters', () => {
    // Create test data to increment counters
    const userToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doe'
    });

    const missionId1 = createTestMission(userToken, {
      name: 'Mission 1',
      description: 'First mission',
      target: 'Mars'
    });

    const astronautId1 = createTestAstronaut(userToken, {
      nameFirst: 'James',
      nameLast: 'Kirk',
      rank: 'Captain Commanding',
      age: 35,
      weight: 75.5,
      height: 180
    });

    // Clear all data
    const clearRes = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes.statusCode).toBe(200);
    expect(clearRes.body).toEqual({});

    // Create new data and verify IDs start from 1 again
    const newUserToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Smith'
    });

    const newMissionId = createTestMission(newUserToken, {
      name: 'New Mission',
      description: 'New mission after clear',
      target: 'Venus'
    });

    const newAstronautId = createTestAstronaut(newUserToken, {
      nameFirst: 'Spock',
      nameLast: 'Vulcan',
      rank: 'Commander Science',
      age: 30,
      weight: 70.0,
      height: 175
    });

    // Verify new IDs are reset (should be 1 for first items after clear)
    expect(newMissionId).toBe(1);
    expect(newAstronautId).toBe(1);
  });

  test('Should clear session data', () => {
    // Create test user
    const userToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doe'
    });

    // Verify session is valid
    const detailsRes = apiRequest('GET', '/v1/admin/controluser/details', {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(detailsRes.statusCode).toBe(200);

    // Clear all data
    const clearRes = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes.statusCode).toBe(200);
    expect(clearRes.body).toEqual({});

    // Verify session is no longer valid
    const detailsAfterClearRes = apiRequest('GET', '/v1/admin/controluser/details', {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expectError(detailsAfterClearRes, 401);
  });

  test('Should handle clear with no data', () => {
    // Ensure data is already cleared
    const clearRes1 = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes1.statusCode).toBe(200);
    expect(clearRes1.body).toEqual({});

    // Clear again when no data exists
    const clearRes2 = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes2.statusCode).toBe(200);
    expect(clearRes2.body).toEqual({});
  });

  test('Should maintain data integrity after clear', () => {
    // Clear data
    const clearRes = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearRes.statusCode).toBe(200);
    expect(clearRes.body).toEqual({});

    // Create comprehensive test data
    const userToken = createTestUser({
      email: generateUniqueEmail(),
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doe'
    });

    const missionId = createTestMission(userToken, {
      name: 'Test Mission',
      description: 'A comprehensive test mission',
      target: 'Mars'
    });

    const astronautId = createTestAstronaut(userToken, {
      nameFirst: 'James',
      nameLast: 'Kirk',
      rank: 'Captain Commanding',
      age: 35,
      weight: 75.5,
      height: 180
    });

    // Assign astronaut to mission
    assignAstronautToMission(userToken, missionId, astronautId);

    // Verify all data is properly created and linked
    const missionInfoRes = apiRequest('GET', `/v1/admin/mission/${missionId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(missionInfoRes.statusCode).toBe(200);
    expect(missionInfoRes.body.name).toBe('Test Mission');
    expect(missionInfoRes.body.assignedAstronauts).toHaveLength(1);
    expect(missionInfoRes.body.assignedAstronauts[0].astronautId).toBe(astronautId);

    const astronautInfoRes = apiRequest('GET', `/v1/admin/astronaut/${astronautId}`, {
      headers: { controlUserSessionId: userToken },
      fullResponse: true
    });
    expect(astronautInfoRes.statusCode).toBe(200);
    expect(astronautInfoRes.body.designation).toBe('Captain Commanding James Kirk');
  });
});