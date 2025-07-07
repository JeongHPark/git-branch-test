import { apiRequest } from '../fakepi/helpers';
import { 
  getSessionInvalidMessage,
  getNameInvalidCharactersMessage,
  getNameInvalidLengthMessage,
  getNameAlreadyUsedMessage,
  getNotOwnerMessage,
  getMissionIdInvalidMessage,
  getMissionNameMinLength,
  getMissionNameMaxLength
} from '../../src/other';

// Helper function to expect error responses
function expectError(response: any, expectedStatus: number, expectedMessage: string) {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.body.error).toBe(expectedMessage);
}

// ========== TYPE DEFINITIONS ==========

interface RegisterRequest {
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
}

interface RegisterResponse {
  controlUserSessionId: string;
}

interface MissionCreateRequest {
  name: string;
  description: string;
  target: string;
}

interface MissionCreateResponse {
  missionId: number;
}

interface MissionNameUpdateRequest {
  name: string;
}

interface MissionInfo {
  missionId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  target: string;
  assignedAstronauts: AssignedAstronaut[];
}

interface AssignedAstronaut {
  astronautId: number;
  name: string;
}

interface ErrorResponse {
  error: string;
}

// ========== HELPER FUNCTIONS ==========

function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): any {
  const requestBody: RegisterRequest = {
    email,
    password,
    nameFirst,
    nameLast
  };
  
  return apiRequest('POST', '/v1/admin/auth/register', {
    json: requestBody,
    fullResponse: true
  });
}

function adminMissionCreate(
  controlUserSessionId: string,
  name: string,
  description: string,
  target: string
): any {
  const requestBody: MissionCreateRequest = {
    name,
    description,
    target
  };
  
  return apiRequest('POST', '/v1/admin/mission', {
    json: requestBody,
    headers: { controlUserSessionId },
    fullResponse: true
  });
}

function adminMissionNameUpdate(
  controlUserSessionId: string,
  missionId: number,
  name: string
): any {
  const requestBody: MissionNameUpdateRequest = {
    name
  };
  
  return apiRequest('PUT', `/v1/admin/mission/${missionId}/name`, {
    json: requestBody,
    headers: { controlUserSessionId },
    fullResponse: true
  });
}

function adminMissionInfo(
  controlUserSessionId: string,
  missionId: number
): any {
  return apiRequest('GET', `/v1/admin/mission/${missionId}`, {
    headers: { controlUserSessionId },
    fullResponse: true
  });
}

function clearData(): void {
  const response = apiRequest('DELETE', '/clear', { fullResponse: true });
  expect(response.statusCode).toBe(200);
}

// ========== JEST TESTS ==========

describe('Admin Mission Name Update', () => {
  beforeEach(() => {
    clearData();
  });

  describe('Successful Updates', () => {
    it('should successfully update mission name', () => {
      // Register user
      const registerData = adminAuthRegister(
        'test@example.com',
        'password123',
        'Test',
        'User'
      );
      expect(registerData.statusCode).toBe(200);
      const userSessionId: string = registerData.body.controlUserSessionId;

      // Create mission
      const missionData = adminMissionCreate(
        userSessionId,
        'Original Mission Name',
        'Test description',
        'Test target'
      );
      expect(missionData.statusCode).toBe(200);
      const missionId: number = missionData.body.missionId;

      // Update mission name
      const result = adminMissionNameUpdate(userSessionId, missionId, 'Updated Mission Name');
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});

      // Verify name was updated
      const updatedData = adminMissionInfo(userSessionId, missionId);
      expect(updatedData.statusCode).toBe(200);
      expect(updatedData.body.name).toBe('Updated Mission Name');
    });

    it('should accept boundary length names', () => {
      // Register user
      const registerData = adminAuthRegister(
        'test@example.com',
        'password123',
        'Test',
        'User'
      );
      expect(registerData.statusCode).toBe(200);
      const userSessionId: string = registerData.body.controlUserSessionId;

      // Create mission
      const missionData = adminMissionCreate(
        userSessionId,
        'Original Name',
        'Test description',
        'Test target'
      );
      expect(missionData.statusCode).toBe(200);
      const missionId: number = missionData.body.missionId;

      // Test minimum length
      const minLengthName: string = 'A'.repeat(getMissionNameMinLength());
      const minResult = adminMissionNameUpdate(userSessionId, missionId, minLengthName);
      expect(minResult.statusCode).toBe(200);
      
      let updatedData = adminMissionInfo(userSessionId, missionId);
      expect(updatedData.statusCode).toBe(200);
      expect(updatedData.body.name).toBe(minLengthName);

      // Test maximum length
      const maxLengthName: string = 'A'.repeat(getMissionNameMaxLength());
      const maxResult = adminMissionNameUpdate(userSessionId, missionId, maxLengthName);
      expect(maxResult.statusCode).toBe(200);
      
      updatedData = adminMissionInfo(userSessionId, missionId);
      expect(updatedData.statusCode).toBe(200);
      expect(updatedData.body.name).toBe(maxLengthName);
    });

    it('should accept alphanumeric characters with spaces', () => {
      // Register user
      const registerData = adminAuthRegister(
        'test@example.com',
        'password123',
        'Test',
        'User'
      );
      expect(registerData.statusCode).toBe(200);
      const userSessionId: string = registerData.body.controlUserSessionId;

      // Create mission
      const missionData = adminMissionCreate(
        userSessionId,
        'Original Name',
        'Test description',
        'Test target'
      );
      expect(missionData.statusCode).toBe(200);
      const missionId: number = missionData.body.missionId;

      // Test valid name with spaces and alphanumeric characters
      const validName = 'Mission Alpha 123';
      const result = adminMissionNameUpdate(userSessionId, missionId, validName);
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});

      // Verify name was updated
      const updatedData = adminMissionInfo(userSessionId, missionId);
      expect(updatedData.statusCode).toBe(200);
      expect(updatedData.body.name).toBe(validName);
    });
  });

  describe('Authentication Errors', () => {
    it('should reject empty session ID', () => {
      // Register user and create mission
      const registerData = adminAuthRegister(
        'test@example.com',
        'password123',
        'Test',
        'User'
      );
      expect(registerData.statusCode).toBe(200);
      const userSessionId: string = registerData.body.controlUserSessionId;

      const missionData = adminMissionCreate(
        userSessionId,
        'Test Mission',
        'Test description',
        'Test target'
      );
      expect(missionData.statusCode).toBe(200);
      const missionId: number = missionData.body.missionId;

      // Try to update with empty session ID
      const result = adminMissionNameUpdate('', missionId, 'New Name');
      expectError(result, 401, getSessionInvalidMessage());
    });

    it('should reject invalid session ID', () => {
      // Register user and create mission
      const registerData = adminAuthRegister(
        'test@example.com',
        'password123',
        'Test',
        'User'
      );
      expect(registerData.statusCode).toBe(200);
      const userSessionId: string = registerData.body.controlUserSessionId;

      const missionData = adminMissionCreate(
        userSessionId,
        'Test Mission',
        'Test description',
        'Test target'
      );
      expect(missionData.statusCode).toBe(200);
      const missionId: number = missionData.body.missionId;

      // Try to update with invalid session ID
      const result = adminMissionNameUpdate('invalid-session', missionId, 'New Name');
      expectError(result, 401, getSessionInvalidMessage());
    });
  });

  describe('Authorization Errors', () => {
    it('should prevent non-owner from updating mission name', () => {
      // Register first user and create mission
      const registerData1 = adminAuthRegister(
        'user1@example.com',
        'password123',
        'User',
        'One'
      );
      expect(registerData1.statusCode).toBe(200);
      const userSessionId1: string = registerData1.body.controlUserSessionId;

      const missionData = adminMissionCreate(
        userSessionId1,
        'Test Mission',
        'Test description',
        'Test target'
      );
      expect(missionData.statusCode).toBe(200);
      const missionId: number = missionData.body.missionId;

      // Register second user
      const registerData2 = adminAuthRegister(
        'user2@example.com',
        'password123',
        'User',
        'Two'
      );
      expect(registerData2.statusCode).toBe(200);
      const userSessionId2: string = registerData2.body.controlUserSessionId;

      // Try to update mission with second user's session
      const result = adminMissionNameUpdate(userSessionId2, missionId, 'Hacked Name');
      expectError(result, 403, getNotOwnerMessage());
    });

    it('should handle non-existent mission ID', () => {
      // Register user
      const registerData = adminAuthRegister(
        'test@example.com',
        'password123',
        'Test',
        'User'
      );
      expect(registerData.statusCode).toBe(200);
      const userSessionId: string = registerData.body.controlUserSessionId;

      // Try to update non-existent mission
      const result = adminMissionNameUpdate(userSessionId, 99999, 'New Name');
      expectError(result, 403, getNotOwnerMessage());
    });
  });

  describe('Validation Errors', () => {
    it('should reject too short names', () => {
      // Register user and create mission
      const registerData = adminAuthRegister(
        'test@example.com',
        'password123',
        'Test',
        'User'
      );
      expect(registerData.statusCode).toBe(200);
      const userSessionId: string = registerData.body.controlUserSessionId;

      const missionData = adminMissionCreate(
        userSessionId,
        'Test Mission',
        'Test description',
        'Test target'
      );
      expect(missionData.statusCode).toBe(200);
      const missionId: number = missionData.body.missionId;

      // Try to update with too short name
      const tooShortName = 'A'.repeat(getMissionNameMinLength() - 1);
      const result = adminMissionNameUpdate(userSessionId, missionId, tooShortName);
      expectError(result, 400, getNameInvalidLengthMessage());
    });

    it('should reject too long names', () => {
      // Register user and create mission
      const registerData = adminAuthRegister(
        'test@example.com',
        'password123',
        'Test',
        'User'
      );
      expect(registerData.statusCode).toBe(200);
      const userSessionId: string = registerData.body.controlUserSessionId;

      const missionData = adminMissionCreate(
        userSessionId,
        'Test Mission',
        'Test description',
        'Test target'
      );
      expect(missionData.statusCode).toBe(200);
      const missionId: number = missionData.body.missionId;

      // Try to update with too long name
      const tooLongName = 'A'.repeat(getMissionNameMaxLength() + 1);
      const result = adminMissionNameUpdate(userSessionId, missionId, tooLongName);
      expectError(result, 400, getNameInvalidLengthMessage());
    });

    it('should reject names with invalid characters', () => {
      // Register user and create mission
      const registerData = adminAuthRegister(
        'test@example.com',
        'password123',
        'Test',
        'User'
      );
      expect(registerData.statusCode).toBe(200);
      const userSessionId: string = registerData.body.controlUserSessionId;

      const missionData = adminMissionCreate(
        userSessionId,
        'Test Mission',
        'Test description',
        'Test target'
      );
      expect(missionData.statusCode).toBe(200);
      const missionId: number = missionData.body.missionId;

      // Try to update with invalid characters
      const invalidNames = ['Mission@', 'Mission#', 'Mission$', 'Mission%'];
      
      invalidNames.forEach(invalidName => {
        const result = adminMissionNameUpdate(userSessionId, missionId, invalidName);
        expectError(result, 400, getNameInvalidCharactersMessage());
      });
    });

    it('should reject duplicate mission names', () => {
      // Register user
      const registerData = adminAuthRegister(
        'test@example.com',
        'password123',
        'Test',
        'User'
      );
      expect(registerData.statusCode).toBe(200);
      const userSessionId: string = registerData.body.controlUserSessionId;

      // Create first mission
      const missionData1 = adminMissionCreate(
        userSessionId,
        'First Mission',
        'Test description',
        'Test target'
      );
      expect(missionData1.statusCode).toBe(200);

      // Create second mission
      const missionData2 = adminMissionCreate(
        userSessionId,
        'Second Mission',
        'Test description',
        'Test target'
      );
      expect(missionData2.statusCode).toBe(200);
      const missionId2: number = missionData2.body.missionId;

      // Try to update second mission to have same name as first
      const result = adminMissionNameUpdate(userSessionId, missionId2, 'First Mission');
      expectError(result, 400, getNameAlreadyUsedMessage());
    });
  });

  describe('User Isolation', () => {
    it('should allow same mission names across different users', () => {
      // Register first user and create mission
      const registerData1 = adminAuthRegister(
        'user1@example.com',
        'password123',
        'User',
        'One'
      );
      expect(registerData1.statusCode).toBe(200);
      const userSessionId1: string = registerData1.body.controlUserSessionId;

      const missionData1 = adminMissionCreate(
        userSessionId1,
        'Shared Mission Name',
        'Test description',
        'Test target'
      );
      expect(missionData1.statusCode).toBe(200);

      // Register second user and create mission
      const registerData2 = adminAuthRegister(
        'user2@example.com',
        'password123',
        'User',
        'Two'
      );
      expect(registerData2.statusCode).toBe(200);
      const userSessionId2: string = registerData2.body.controlUserSessionId;

      const missionData2 = adminMissionCreate(
        userSessionId2,
        'Different Mission Name',
        'Test description',
        'Test target'
      );
      expect(missionData2.statusCode).toBe(200);
      const missionId2: number = missionData2.body.missionId;

      // Update second user's mission to have same name as first user's mission
      const result = adminMissionNameUpdate(userSessionId2, missionId2, 'Shared Mission Name');
      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual({});

      // Verify the update was successful
      const updatedData = adminMissionInfo(userSessionId2, missionId2);
      expect(updatedData.statusCode).toBe(200);
      expect(updatedData.body.name).toBe('Shared Mission Name');
    });
  });
});