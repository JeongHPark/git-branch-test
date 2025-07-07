import { apiRequest } from '../fakepi/helpers';
import { 
  getSessionInvalidMessage, 
  getNameInvalidCharactersMessage, 
  getNameInvalidLengthMessage, 
  getNameAlreadyUsedMessage, 
  getDescriptionTooLongMessage, 
  getTargetTooLongMessage 
} from '../../src/other';

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

// Mission create function
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

describe('Admin Mission Create Tests', () => {
  beforeEach(() => {
    // Clear data
    const clearResponse = apiRequest('DELETE', '/clear', { fullResponse: true });
    expect(clearResponse.statusCode).toBe(200);
  });

  test('Successful mission creation', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'success@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Test basic mission creation
    const result = adminMissionCreate(
      validSessionId,
      'Mars Mission',
      'A mission to explore Mars surface',
      'Mars'
    );

    expect(result.statusCode).toBe(200);
    expect(result.body.missionId).toBeDefined();
    expect(typeof result.body.missionId).toBe('number');
  });

  test('Mission creation with boundary lengths', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'boundary@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Test minimum length name (3 characters)
    let result = adminMissionCreate(
      validSessionId,
      'ABC',
      'Short mission description',
      'Moon'
    );
    expect(result.statusCode).toBe(200);
    expect(result.body.missionId).toBeDefined();

    // Test maximum length name (30 characters)
    result = adminMissionCreate(
      validSessionId,
      'Abcdefghijklmnopqrstuvwxyz1234', // 30 characters
      'Mission with maximum length name',
      'Jupiter'
    );
    expect(result.statusCode).toBe(200);
    expect(result.body.missionId).toBeDefined();

    // Test maximum length description (400 characters)
    const longDescription = 'A'.repeat(400);
    result = adminMissionCreate(
      validSessionId,
      'Long Description Mission',
      longDescription,
      'Saturn'
    );
    expect(result.statusCode).toBe(200);
    expect(result.body.missionId).toBeDefined();

    // Test maximum length target (100 characters)
    const longTarget = 'B'.repeat(100);
    result = adminMissionCreate(
      validSessionId,
      'Long Target Mission',
      'Mission with very long target name',
      longTarget
    );
    expect(result.statusCode).toBe(200);
    expect(result.body.missionId).toBeDefined();
  });

  test('Mission creation with alphanumeric names', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'alphanumeric@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Test alphanumeric name
    const result = adminMissionCreate(
      validSessionId,
      'Mission 2024',
      'A mission for the year 2024',
      'Mars'
    );
    expect(result.statusCode).toBe(200);
    expect(result.body.missionId).toBeDefined();
  });

  test('Mission creation with spaces in names', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'spaces@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Test name with spaces
    const result = adminMissionCreate(
      validSessionId,
      'Mission to Mars',
      'A mission to explore Mars',
      'Mars'
    );
    expect(result.statusCode).toBe(200);
    expect(result.body.missionId).toBeDefined();
  });

  test('Mission creation with empty description', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'emptydesc@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Test empty description
    const result = adminMissionCreate(
      validSessionId,
      'Empty Description Mission',
      '',
      'Mars'
    );
    expect(result.statusCode).toBe(200);
    expect(result.body.missionId).toBeDefined();
  });

  test('Mission creation with empty target', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'emptytarget@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Test empty target
    const result = adminMissionCreate(
      validSessionId,
      'Empty Target Mission',
      'A mission with no specific target',
      ''
    );
    expect(result.statusCode).toBe(200);
    expect(result.body.missionId).toBeDefined();
  });

  test('Mission creation fails with invalid session', () => {
    const result = adminMissionCreate(
      'invalid-session-id',
      'Test Mission',
      'Test description',
      'Mars'
    );
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Mission creation fails with empty session', () => {
    const result = adminMissionCreate(
      '',
      'Test Mission',
      'Test description',
      'Mars'
    );
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('Mission creation fails with name too short', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'short@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Test name too short (2 characters)
    const result = adminMissionCreate(
      validSessionId,
      'AB',
      'Test description',
      'Mars'
    );
    expectError(result, 400, getNameInvalidLengthMessage());
  });

  test('Mission creation fails with name too long', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'long@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Test name too long (31 characters)
    const result = adminMissionCreate(
      validSessionId,
      'Abcdefghijklmnopqrstuvwxyz12345', // 31 characters
      'Test description',
      'Mars'
    );
    expectError(result, 400, getNameInvalidLengthMessage());
  });

  test('Mission creation fails with invalid characters in name', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'invalid@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Test name with invalid characters
    const result = adminMissionCreate(
      validSessionId,
      'Mission@#$%',
      'Test description',
      'Mars'
    );
    expectError(result, 400, getNameInvalidCharactersMessage());
  });

  test('Mission creation fails with description too long', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'longdesc@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Test description too long (401 characters)
    const longDescription = 'A'.repeat(401);
    const result = adminMissionCreate(
      validSessionId,
      'Test Mission',
      longDescription,
      'Mars'
    );
    expectError(result, 400, getDescriptionTooLongMessage());
  });

  test('Mission creation fails with target too long', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'longtarget@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Test target too long (101 characters)
    const longTarget = 'B'.repeat(101);
    const result = adminMissionCreate(
      validSessionId,
      'Test Mission',
      'Test description',
      longTarget
    );
    expectError(result, 400, getTargetTooLongMessage());
  });

  test('Mission creation fails with duplicate name', () => {
    // Register user
    const registerResult = adminAuthRegister(
      'duplicate@example.com',
      'password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const validSessionId = registerResult.body.controlUserSessionId;

    // Create first mission
    const firstResult = adminMissionCreate(
      validSessionId,
      'Duplicate Mission',
      'First mission',
      'Mars'
    );
    expect(firstResult.statusCode).toBe(200);

    // Try to create second mission with same name
    const secondResult = adminMissionCreate(
      validSessionId,
      'Duplicate Mission',
      'Second mission',
      'Jupiter'
    );
    expectError(secondResult, 400, getNameAlreadyUsedMessage());
  });

  test('Multiple users can create missions with same name', () => {
    // Register first user
    const firstRegisterResult = adminAuthRegister(
      'user1@example.com',
      'password123',
      'User',
      'One'
    );
    expect(firstRegisterResult.statusCode).toBe(200);
    const firstSessionId = firstRegisterResult.body.controlUserSessionId;

    // Register second user
    const secondRegisterResult = adminAuthRegister(
      'user2@example.com',
      'password123',
      'User',
      'Two'
    );
    expect(secondRegisterResult.statusCode).toBe(200);
    const secondSessionId = secondRegisterResult.body.controlUserSessionId;

    // Both users create missions with same name
    const firstResult = adminMissionCreate(
      firstSessionId,
      'Same Name Mission',
      'First user mission',
      'Mars'
    );
    expect(firstResult.statusCode).toBe(200);
    expect(firstResult.body.missionId).toBeDefined();

    const secondResult = adminMissionCreate(
      secondSessionId,
      'Same Name Mission',
      'Second user mission',
      'Jupiter'
    );
    expect(secondResult.statusCode).toBe(200);
    expect(secondResult.body.missionId).toBeDefined();
  });
});