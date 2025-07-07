// Base URL for API

import { apiRequest } from '../fakepi/helpers';
// Helper function to expect error responses
function expectError(response: any, expectedStatus: number, expectedMessage: string) {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.body.error).toBe(expectedMessage);
}

import { getPasswordIncorrectMessage, getOldPasswordIncorrectMessage, getNewPasswordUsedMessage, getPasswordTooShortMessage, getPasswordInvalidFormatMessage, getSessionInvalidMessage } from '../../src/other';
const BASE_URL = 'http://127.0.0.1:3200';

// Using centralized error messages from src/other.ts

// Helper functions for password update tests
function expectPasswordSuccess(response: any, expectedStatus: number = 200) {
  expect(response.statusCode || response.statusCode).toBe(expectedStatus);
  return response;
}

function expectPasswordError(response: any, expectedStatus: number, expectedErrorMessage?: string) {
  expect(response.statusCode || response.statusCode).toBe(expectedStatus);
  if (expectedErrorMessage) {
    expect(response.body?.error || response.error).toBe(expectedErrorMessage);
  }
  return response;
}

function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return apiRequest('POST', '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast },
    fullResponse: true
  });
}

function adminAuthLogin(email: string, password: string) {
  return apiRequest('POST', '/v1/admin/auth/login', {
    json: { email, password },
    fullResponse: true
  });
}

function adminControlUserDetails(sessionId: string) {
  return apiRequest('GET', '/v1/admin/controluser/details', {
    headers: { controlUserSessionId: sessionId },
    fullResponse: true
  });
}

function adminControlUserPasswordUpdate(sessionId: string, oldPassword: string, newPassword: string) {
  return apiRequest('PUT', '/v1/admin/controluser/password', {
    json: { oldPassword, newPassword },
    headers: { controlUserSessionId: sessionId },
    fullResponse: true
  });
}

function clearData(): void {
  const response = apiRequest('DELETE', '/clear', { fullResponse: true });
  expect(response.statusCode).toBe(200);
}

describe('Admin Control User Password Update Tests', () => {
  beforeEach(() => {
    clearData();
  });

  test('Password Change Data Integrity', () => {
    const testUser = {
      email: `integrity-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`,
      password: 'OriginalPass123',
      nameFirst: 'Test',
      nameLast: 'User'
    };

    // Register user
    const regRes = adminAuthRegister(testUser.email, testUser.password, testUser.nameFirst, testUser.nameLast);
    expect(regRes.statusCode).toBe(200);
    const sessionId = regRes.body.controlUserSessionId;

    // Store user info before failure
    const beforeDetails = adminControlUserDetails(sessionId);
    expect(beforeDetails.statusCode).toBe(200);

    // Attempt to change password with wrong old password
    const failedRes = adminControlUserPasswordUpdate(
      sessionId,
      'WrongPassword123',
      'NewPassword456'
    );
    expectError(failedRes, 400, getOldPasswordIncorrectMessage());

    // Verify login still possible with original password
    const loginRes = adminAuthLogin(testUser.email, testUser.password);
    expect(loginRes.statusCode).toBe(200);
  });

  test('Password History Integrity', () => {
    const testUser = {
      email: `history-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`,
      password: 'OriginalPass123',
      nameFirst: 'Test',
      nameLast: 'User'
    };

    // Register user
    const regRes = adminAuthRegister(testUser.email, testUser.password, testUser.nameFirst, testUser.nameLast);
    expect(regRes.statusCode).toBe(200);
    const sessionId = regRes.body.controlUserSessionId;

    // First successful password change
    const firstChange = adminControlUserPasswordUpdate(
      sessionId,
      testUser.password,
      'FirstChange123'
    );
    expect(firstChange.statusCode).toBe(200);

    // Second successful password change
    const secondChange = adminControlUserPasswordUpdate(
      sessionId,
      'FirstChange123',
      'SecondChange456'
    );
    expect(secondChange.statusCode).toBe(200);

    // Failed password change attempt (already used password)
    const failedRes = adminControlUserPasswordUpdate(
      sessionId,
      'SecondChange456',
      testUser.password // First password (already in history)
    );
    expectError(failedRes, 400, getNewPasswordUsedMessage());

    // Verify login still possible with current password after failure
    const loginRes = adminAuthLogin(testUser.email, 'SecondChange456');
    expect(loginRes.statusCode).toBe(200);

    // Verify login impossible with previous password (history preserved)
    const oldLoginRes = adminAuthLogin(testUser.email, 'FirstChange123');
    expectError(oldLoginRes, 400, getPasswordIncorrectMessage());
  });

  test('Multiple Failed Attempts', () => {
    const testUser = {
      email: `multiple-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`,
      password: 'OriginalPass123',
      nameFirst: 'Test',
      nameLast: 'User'
    };

    // Register user
    const regRes = adminAuthRegister(testUser.email, testUser.password, testUser.nameFirst, testUser.nameLast);
    expect(regRes.statusCode).toBe(200);
    const sessionId = regRes.body.controlUserSessionId;

    // First successful password change
    const firstChange = adminControlUserPasswordUpdate(
      sessionId,
      testUser.password,
      'SuccessPass123'
    );
    expect(firstChange.statusCode).toBe(200);

    // Multiple failed password change attempts
    for (let i = 0; i < 3; i++) {
      const failedRes = adminControlUserPasswordUpdate(
        sessionId,
        'WrongPassword123',
        `FailedPass${i}456`
      );
      expectError(failedRes, 400, getOldPasswordIncorrectMessage());
    }

    // Verify login still possible with current password after failures
    const loginRes = adminAuthLogin(testUser.email, 'SuccessPass123');
    expect(loginRes.statusCode).toBe(200);

    // Verify login impossible with original password (added to history)
    const oldLoginRes = adminAuthLogin(testUser.email, testUser.password);
    expectError(oldLoginRes, 400, getPasswordIncorrectMessage());
  });

  test('Password History Duplicate Removal', () => {
    const testUser = {
      email: `duplicate-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`,
      password: 'OriginalPass123',
      nameFirst: 'Test',
      nameLast: 'User'
    };

    // Register user
    const regRes = adminAuthRegister(testUser.email, testUser.password, testUser.nameFirst, testUser.nameLast);
    expect(regRes.statusCode).toBe(200);
    const sessionId = regRes.body.controlUserSessionId;

    // First password change
    const firstChange = adminControlUserPasswordUpdate(
      sessionId,
      testUser.password,
      'FirstChange123'
    );
    expect(firstChange.statusCode).toBe(200);

    // Second password change
    const secondChange = adminControlUserPasswordUpdate(
      sessionId,
      'FirstChange123',
      'SecondChange456'
    );
    expect(secondChange.statusCode).toBe(200);

    // Try to use first change password again (should fail)
    const failedRes = adminControlUserPasswordUpdate(
      sessionId,
      'SecondChange456',
      'FirstChange123'
    );
    expectError(failedRes, 400, getNewPasswordUsedMessage());

    // Try to use original password again (should fail)
    const failedRes2 = adminControlUserPasswordUpdate(
      sessionId,
      'SecondChange456',
      testUser.password
    );
    expectError(failedRes2, 400, getNewPasswordUsedMessage());
  });

  test('Successful Password Change', () => {
    const testUser = {
      email: `success-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`,
      password: 'OriginalPass123',
      nameFirst: 'Test',
      nameLast: 'User'
    };

    // Register user
    const regRes = adminAuthRegister(testUser.email, testUser.password, testUser.nameFirst, testUser.nameLast);
    expect(regRes.statusCode).toBe(200);
    const sessionId = regRes.body.controlUserSessionId;

    // Successful password change
    const changeRes = adminControlUserPasswordUpdate(
      sessionId,
      testUser.password,
      'NewPassword123'
    );
    expect(changeRes.statusCode).toBe(200);
    expect(changeRes.body).toEqual({});

    // Verify login with new password
    const loginRes = adminAuthLogin(testUser.email, 'NewPassword123');
    expect(loginRes.statusCode).toBe(200);

    // Verify login fails with old password
    const oldLoginRes = adminAuthLogin(testUser.email, testUser.password);
    expectError(oldLoginRes, 400, getPasswordIncorrectMessage());
  });

  test('Invalid Old Password', () => {
    const testUser = {
      email: `invalid-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`,
      password: 'OriginalPass123',
      nameFirst: 'Test',
      nameLast: 'User'
    };

    // Register user
    const regRes = adminAuthRegister(testUser.email, testUser.password, testUser.nameFirst, testUser.nameLast);
    expect(regRes.statusCode).toBe(200);
    const sessionId = regRes.body.controlUserSessionId;

    // Try to change password with wrong old password
    const changeRes = adminControlUserPasswordUpdate(
      sessionId,
      'WrongPassword123',
      'NewPassword123'
    );
    expectError(changeRes, 400, getOldPasswordIncorrectMessage());
  });

  test('Invalid New Password - Too Short', () => {
    const testUser = {
      email: `short-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`,
      password: 'OriginalPass123',
      nameFirst: 'Test',
      nameLast: 'User'
    };

    // Register user
    const regRes = adminAuthRegister(testUser.email, testUser.password, testUser.nameFirst, testUser.nameLast);
    expect(regRes.statusCode).toBe(200);
    const sessionId = regRes.body.controlUserSessionId;

    // Try to change to a password that's too short
    const changeRes = adminControlUserPasswordUpdate(
      sessionId,
      testUser.password,
      'Short1' // 6 characters, minimum is 8
    );
    expectError(changeRes, 400, getPasswordTooShortMessage());
  });

  test('Invalid New Password - No Number', () => {
    const testUser = {
      email: `nonumber-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`,
      password: 'OriginalPass123',
      nameFirst: 'Test',
      nameLast: 'User'
    };

    // Register user
    const regRes = adminAuthRegister(testUser.email, testUser.password, testUser.nameFirst, testUser.nameLast);
    expect(regRes.statusCode).toBe(200);
    const sessionId = regRes.body.controlUserSessionId;

    // Try to change to a password without numbers
    const changeRes = adminControlUserPasswordUpdate(
      sessionId,
      testUser.password,
      'NoNumbersHere'
    );
    expectError(changeRes, 400, getPasswordInvalidFormatMessage());
  });

  test('Invalid New Password - No Letter', () => {
    const testUser = {
      email: `noletter-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`,
      password: 'OriginalPass123',
      nameFirst: 'Test',
      nameLast: 'User'
    };

    // Register user
    const regRes = adminAuthRegister(testUser.email, testUser.password, testUser.nameFirst, testUser.nameLast);
    expect(regRes.statusCode).toBe(200);
    const sessionId = regRes.body.controlUserSessionId;

    // Try to change to a password without letters
    const changeRes = adminControlUserPasswordUpdate(
      sessionId,
      testUser.password,
      '12345678'
    );
    expectError(changeRes, 400, getPasswordInvalidFormatMessage());
  });

  test('Invalid Session', () => {
    // Try to change password with invalid session
    const changeRes = adminControlUserPasswordUpdate(
      'invalid-session',
      'OldPassword123',
      'NewPassword123'
    );
    expectError(changeRes, 401, getSessionInvalidMessage());
  });

  test('Empty Session', () => {
    // Try to change password with empty session
    const changeRes = adminControlUserPasswordUpdate(
      '',
      'OldPassword123',
      'NewPassword123'
    );
    expectError(changeRes, 401, getSessionInvalidMessage());
  });

  test('Password Reuse Prevention', () => {
    const testUser = {
      email: `reuse-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`,
      password: 'OriginalPass123',
      nameFirst: 'Test',
      nameLast: 'User'
    };

    // Register user
    const regRes = adminAuthRegister(testUser.email, testUser.password, testUser.nameFirst, testUser.nameLast);
    expect(regRes.statusCode).toBe(200);
    const sessionId = regRes.body.controlUserSessionId;

    // Change password successfully
    const firstChange = adminControlUserPasswordUpdate(
      sessionId,
      testUser.password,
      'NewPassword123'
    );
    expect(firstChange.statusCode).toBe(200);

    // Try to change back to original password (should fail)
    const failedRes = adminControlUserPasswordUpdate(
      sessionId,
      'NewPassword123',
      testUser.password
    );
    expectError(failedRes, 400, getNewPasswordUsedMessage());

    // Try to use current password as new password (should fail)
    const failedRes2 = adminControlUserPasswordUpdate(
      sessionId,
      'NewPassword123',
      'NewPassword123'
    );
    expectError(failedRes2, 400, getNewPasswordUsedMessage());
  });

  test('Multiple Password Changes in Sequence', () => {
    const testUser = {
      email: `sequence-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`,
      password: 'OriginalPass123',
      nameFirst: 'Test',
      nameLast: 'User'
    };

    // Register user
    const regRes = adminAuthRegister(testUser.email, testUser.password, testUser.nameFirst, testUser.nameLast);
    expect(regRes.statusCode).toBe(200);
    const sessionId = regRes.body.controlUserSessionId;

    let currentPassword = testUser.password;
    
    // Change password multiple times
    for (let i = 1; i <= 3; i++) {
      const newPassword = `Password${i}23`;
      
      const changeRes = adminControlUserPasswordUpdate(
        sessionId,
        currentPassword,
        newPassword
      );
      expect(changeRes.statusCode).toBe(200);
      
      // Verify login with new password
      const loginRes = adminAuthLogin(testUser.email, newPassword);
      expect(loginRes.statusCode).toBe(200);
      
      // Verify old password no longer works
      const oldLoginRes = adminAuthLogin(testUser.email, currentPassword);
      expectError(oldLoginRes, 400, getPasswordIncorrectMessage());
      
      currentPassword = newPassword;
    }
    
    // Verify we can't reuse any of the previous passwords
    const oldPasswords = [testUser.password, 'Password123', 'Password223'];
    
    oldPasswords.forEach(oldPassword => {
      const failedRes = adminControlUserPasswordUpdate(
        sessionId,
        currentPassword,
        oldPassword
      );
      expectError(failedRes, 400, getNewPasswordUsedMessage());
    });
  });

  test('Session Validity After Password Change', () => {
    const testUser = {
      email: `validity-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`,
      password: 'OriginalPass123',
      nameFirst: 'Test',
      nameLast: 'User'
    };

    // Register user
    const regRes = adminAuthRegister(testUser.email, testUser.password, testUser.nameFirst, testUser.nameLast);
    expect(regRes.statusCode).toBe(200);
    const sessionId = regRes.body.controlUserSessionId;

    // Change password
    const changeRes = adminControlUserPasswordUpdate(
      sessionId,
      testUser.password,
      'NewPassword123'
    );
    expect(changeRes.statusCode).toBe(200);

    // Verify session is still valid after password change
    const detailsRes = adminControlUserDetails(sessionId);
    expect(detailsRes.statusCode).toBe(200);
    expect(detailsRes.body.user.email).toBe(testUser.email);
  });
});