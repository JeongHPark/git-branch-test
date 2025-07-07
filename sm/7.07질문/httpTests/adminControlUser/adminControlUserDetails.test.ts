// adminControlUserDetails.test.ts - Admin Control User Details HTTP Tests

import { apiRequest } from '../fakepi/helpers';
import { 
  getSessionInvalidMessage,
  getEmailInvalidMessage,
  getEmailUsedByOtherMessage,
  getNameFirstInvalidMessage,
  getNameLastInvalidMessage
} from '../../src/other';

// Helper function to expect error responses
function expectError(response: any, expectedStatus: number, expectedMessage: string) {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.body.error).toBe(expectedMessage);
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

function adminControlUserDetails(sessionId: string | null | undefined) {
  if (!sessionId) {
    return apiRequest('GET', '/v1/admin/controluser/details', {
      headers: { controlUserSessionId: '' },
      fullResponse: true
    });
  }
  return apiRequest('GET', '/v1/admin/controluser/details', {
    headers: { controlUserSessionId: sessionId },
    fullResponse: true
  });
}

function adminControlUserDetailsUpdate(sessionId: string, email?: string, nameFirst?: string, nameLast?: string) {
  const updateData: any = {};
  if (email !== undefined) updateData.email = email;
  if (nameFirst !== undefined) updateData.nameFirst = nameFirst;
  if (nameLast !== undefined) updateData.nameLast = nameLast;

  return apiRequest('PUT', '/v1/admin/controluser/details', {
    json: updateData,
    headers: { controlUserSessionId: sessionId },
    fullResponse: true
  });
}

function clearData(): void {
  const response = apiRequest('DELETE', '/clear', { fullResponse: true });
  expect(response.statusCode).toBe(200);
}

describe('GET /v1/admin/controluser/details', () => {
  // Valid test cases
  describe('Success cases', () => {
    beforeEach(() => {
      clearData();
    });

    test('Valid request with correct session token', () => {
      const registerResult = adminAuthRegister(
        'james.kirk@starfleet.gov.au',
        'livelong123',
        'James',
        'Kirk'
      );
      expect(registerResult.statusCode).toBe(200);
      const sessionId = registerResult.body.controlUserSessionId;

      const detailsResult = adminControlUserDetails(sessionId);
      expect(detailsResult.statusCode).toBe(200);

      expect(detailsResult.body).toStrictEqual({
        user: {
          controlUserId: expect.any(Number),
          name: 'James Kirk',
          email: 'james.kirk@starfleet.gov.au',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0
        }
      });
    });

    test('Valid request after login', () => {
      const registerResult = adminAuthRegister(
        'test@example.com',
        'password123',
        'Test',
        'User'
      );
      expect(registerResult.statusCode).toBe(200);
      
      const loginResult = adminAuthLogin(
        'test@example.com',
        'password123'
      );
      expect(loginResult.statusCode).toBe(200);
      const sessionId = loginResult.body.controlUserSessionId;

      const detailsResult = adminControlUserDetails(sessionId);
      expect(detailsResult.statusCode).toBe(200);

      expect(detailsResult.body).toStrictEqual({
        user: {
          controlUserId: expect.any(Number),
          name: 'Test User',
          email: 'test@example.com',
          numSuccessfulLogins: 2, // Register + Login
          numFailedPasswordsSinceLastLogin: 0
        }
      });
    });

    test('Valid request with names containing special characters', () => {
      const registerResult = adminAuthRegister(
        'mary@test.com',
        'password123',
        "Mary-Jane O'Connor",
        'Smith-Wilson'
      );
      expect(registerResult.statusCode).toBe(200);
      const sessionId = registerResult.body.controlUserSessionId;

      const detailsResult = adminControlUserDetails(sessionId);
      expect(detailsResult.statusCode).toBe(200);

      expect(detailsResult.body).toStrictEqual({
        user: {
          controlUserId: expect.any(Number),
          name: "Mary-Jane O'Connor Smith-Wilson",
          email: 'mary@test.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0
        }
      });
    });

    test('Valid request with failed login attempts counter', () => {
      const registerResult = adminAuthRegister(
        'counter@test.com',
        'correctpass123',
        'Counter',
        'Test'
      );
      expect(registerResult.statusCode).toBe(200);
      
      // Failed login attempts
      const failedLogin1 = adminAuthLogin('counter@test.com', 'wrongpass1');
      expect(failedLogin1.statusCode).toBe(400);

      const failedLogin2 = adminAuthLogin('counter@test.com', 'wrongpass2');
      expect(failedLogin2.statusCode).toBe(400);

      // Successful login
      const successLogin = adminAuthLogin('counter@test.com', 'correctpass123');
      expect(successLogin.statusCode).toBe(200);
      const sessionId = successLogin.body.controlUserSessionId;

      // Check counter reset
      const detailsResult = adminControlUserDetails(sessionId);
      expect(detailsResult.statusCode).toBe(200);
      expect(detailsResult.body.user.numSuccessfulLogins).toBe(2); // Register + Login
      expect(detailsResult.body.user.numFailedPasswordsSinceLastLogin).toBe(0); // Reset after success
    });
  });

  // Invalid test cases
  describe('Error cases', () => {
    beforeEach(() => {
      clearData();
    });

    test('Request with empty session token', () => {
      const result = adminControlUserDetails('');
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('Request with invalid session token', () => {
      const result = adminControlUserDetails('invalid-session-token');
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('Request with non-existent session token', () => {
      const result = adminControlUserDetails('nonexistent123456789');
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('Request with malformed session token', () => {
      const result = adminControlUserDetails('malformed-token-!@#$%');
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('Request with very long session token', () => {
      const longToken = 'a'.repeat(1000);
      const result = adminControlUserDetails(longToken);
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('Request with numeric session token', () => {
      const result = adminControlUserDetails('123456789');
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('Request with null session token', () => {
      const result = adminControlUserDetails(null);
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('Request with undefined session token', () => {
      const result = adminControlUserDetails(undefined);
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('Request without session header should fail with 401', () => {
      const response = apiRequest('GET', '/v1/admin/controluser/details', { fullResponse: true });
      expectError(response, 401, getSessionInvalidMessage());
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      clearData();
    });

    test('Multiple users with different session tokens', () => {
      // Register first user
      const registerResult1 = adminAuthRegister(
        'user1@test.com',
        'password123',
        'User',
        'One'
      );
      expect(registerResult1.statusCode).toBe(200);
      const session1 = registerResult1.body.controlUserSessionId;

      // Register second user
      const registerResult2 = adminAuthRegister(
        'user2@test.com',
        'password123',
        'User',
        'Two'
      );
      expect(registerResult2.statusCode).toBe(200);
      const session2 = registerResult2.body.controlUserSessionId;

      // Get details for first user
      const details1 = adminControlUserDetails(session1);
      expect(details1.statusCode).toBe(200);
      expect(details1.body.user.email).toBe('user1@test.com');
      expect(details1.body.user.name).toBe('User One');

      // Get details for second user
      const details2 = adminControlUserDetails(session2);
      expect(details2.statusCode).toBe(200);
      expect(details2.body.user.email).toBe('user2@test.com');
      expect(details2.body.user.name).toBe('User Two');
    });

    test('Session token case sensitivity', () => {
      const registerResult = adminAuthRegister(
        'case@test.com',
        'password123',
        'Case',
        'Test'
      );
      expect(registerResult.statusCode).toBe(200);
      const token = registerResult.body.controlUserSessionId;
      const upperCaseToken = token.toUpperCase();

      // Should fail with uppercase token
      const result = adminControlUserDetails(upperCaseToken);
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('Session token with special characters should fail', () => {
      const registerResult = adminAuthRegister(
        'special@test.com',
        'password123',
        'Special',
        'Test'
      );
      expect(registerResult.statusCode).toBe(200);
      const token = registerResult.body.controlUserSessionId;

      // Modify token with special characters
      const modifiedToken = token + '!@#$%';
      const result = adminControlUserDetails(modifiedToken);
      expectError(result, 401, getSessionInvalidMessage());
    });

    test('Very short session tokens should fail', () => {
      const shortToken = 'abc';
      const result = adminControlUserDetails(shortToken);
      expectError(result, 401, getSessionInvalidMessage());
    });
  });
});

describe('PUT /v1/admin/controluser/details', () => {
  describe('Success cases', () => {
    beforeEach(() => {
      clearData();
    });

    test('Valid update should succeed', () => {
      const registerResult = adminAuthRegister(
        'update@test.com',
        'password123',
        'Update',
        'Test'
      );
      expect(registerResult.statusCode).toBe(200);
      const validSessionId = registerResult.body.controlUserSessionId;

      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'newemail@test.com',
        'NewFirst',
        'NewLast'
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({});

      // Verify the update
      const getResponse = adminControlUserDetails(validSessionId);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.user.email).toBe('newemail@test.com');
      expect(getResponse.body.user.name).toBe('NewFirst NewLast');
    });

    test('Update only nameFirst should succeed', () => {
      const registerResult = adminAuthRegister(
        'partial@test.com',
        'password123',
        'Partial',
        'Test'
      );
      expect(registerResult.statusCode).toBe(200);
      const validSessionId = registerResult.body.controlUserSessionId;

      const response = adminControlUserDetailsUpdate(
        validSessionId,
        undefined,
        'NewFirst',
        undefined
      );
      expect(response.statusCode).toBe(200);

      const getResponse = adminControlUserDetails(validSessionId);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.user.name).toBe('NewFirst Test');
    });

    test('Update only nameLast should succeed', () => {
      const registerResult = adminAuthRegister(
        'partial2@test.com',
        'password123',
        'Partial',
        'Test'
      );
      expect(registerResult.statusCode).toBe(200);
      const validSessionId = registerResult.body.controlUserSessionId;

      const response = adminControlUserDetailsUpdate(
        validSessionId,
        undefined,
        undefined,
        'NewLast'
      );
      expect(response.statusCode).toBe(200);

      const getResponse = adminControlUserDetails(validSessionId);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.user.name).toBe('Partial NewLast');
    });

    test('Update only email should succeed', () => {
      const registerResult = adminAuthRegister(
        'emailonly@test.com',
        'password123',
        'Email',
        'Test'
      );
      expect(registerResult.statusCode).toBe(200);
      const validSessionId = registerResult.body.controlUserSessionId;

      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'newemail@test.com',
        undefined,
        undefined
      );
      expect(response.statusCode).toBe(200);

      const getResponse = adminControlUserDetails(validSessionId);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.user.email).toBe('newemail@test.com');
      expect(getResponse.body.user.name).toBe('Email Test');
    });

    test('Update with same email should succeed', () => {
      const registerResult = adminAuthRegister(
        'same@test.com',
        'password123',
        'Same',
        'Test'
      );
      expect(registerResult.statusCode).toBe(200);
      const validSessionId = registerResult.body.controlUserSessionId;

      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'same@test.com',
        'Updated',
        'Name'
      );
      expect(response.statusCode).toBe(200);

      const getResponse = adminControlUserDetails(validSessionId);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.user.email).toBe('same@test.com');
      expect(getResponse.body.user.name).toBe('Updated Name');
    });
  });

  describe('Error cases', () => {
    let validSessionId: string;

    beforeEach(() => {
      clearData();
      const registerResult = adminAuthRegister(
        'valid@test.com',
        'password123',
        'Valid',
        'User'
      );
      expect(registerResult.statusCode).toBe(200);
      validSessionId = registerResult.body.controlUserSessionId;
    });

    test('Invalid email should fail with 400', () => {
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'invalid-email',
        'Valid',
        'User'
      );
      expectError(response, 400, getEmailInvalidMessage());
    });

    test('Email used by another user should fail with 400', () => {
      // Register another user
      const registerResult2 = adminAuthRegister(
        'other@test.com',
        'password123',
        'Other',
        'User'
      );
      expect(registerResult2.statusCode).toBe(200);

      // Try to update first user's email to second user's email
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'other@test.com',
        'Valid',
        'User'
      );
      expectError(response, 400, getEmailUsedByOtherMessage());
    });

    test('NameFirst with invalid characters should fail', () => {
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'valid@test.com',
        'Invalid123',
        'User'
      );
      expectError(response, 400, getNameFirstInvalidMessage());
    });

    test('NameFirst with special characters should fail', () => {
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'valid@test.com',
        'Invalid@Name',
        'User'
      );
      expectError(response, 400, getNameFirstInvalidMessage());
    });

    test('NameFirst too short should fail', () => {
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'valid@test.com',
        'A',
        'User'
      );
      expectError(response, 400, getNameFirstInvalidMessage());
    });

    test('NameFirst too long should fail', () => {
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'valid@test.com',
        'A'.repeat(21),
        'User'
      );
      expectError(response, 400, getNameFirstInvalidMessage());
    });

    test('NameLast with invalid characters should fail', () => {
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'valid@test.com',
        'Valid',
        'Invalid123'
      );
      expectError(response, 400, getNameLastInvalidMessage());
    });

    test('NameLast too short should fail', () => {
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'valid@test.com',
        'Valid',
        'A'
      );
      expectError(response, 400, getNameLastInvalidMessage());
    });

    test('NameLast too long should fail', () => {
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'valid@test.com',
        'Valid',
        'B'.repeat(21)
      );
      expectError(response, 400, getNameLastInvalidMessage());
    });

    test('Invalid nameFirst should fail', () => {
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'valid@test.com',
        'José',
        'User'
      );
      expectError(response, 400, getNameFirstInvalidMessage());
    });

    test('Invalid nameLast should fail', () => {
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'valid@test.com',
        'Valid',
        'García'
      );
      expectError(response, 400, getNameLastInvalidMessage());
    });

    test('Invalid session should fail with 401', () => {
      const response = adminControlUserDetailsUpdate(
        'invalid-session',
        'valid@test.com',
        'Valid',
        'User'
      );
      expectError(response, 401, getSessionInvalidMessage());
    });

    test('Empty session should fail with 401', () => {
      const response = adminControlUserDetailsUpdate(
        '',
        'valid@test.com',
        'Valid',
        'User'
      );
      expectError(response, 401, getSessionInvalidMessage());
    });

    test('No session header should fail', () => {
      const response = apiRequest('PUT', '/v1/admin/controluser/details', {
        json: {
          email: 'valid@test.com',
          nameFirst: 'Valid',
          nameLast: 'User'
        },
        fullResponse: true
      });
      expectError(response, 401, getSessionInvalidMessage());
    });
  });

  describe('Edge cases', () => {
    let validSessionId: string;

    beforeEach(() => {
      clearData();
      const registerResult = adminAuthRegister(
        'edge@test.com',
        'password123',
        'Edge',
        'Test'
      );
      expect(registerResult.statusCode).toBe(200);
      validSessionId = registerResult.body.controlUserSessionId;
    });

    test('Update with very long valid names', () => {
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'edge@test.com',
        'A'.repeat(20),
        'B'.repeat(20)
      );
      expect(response.statusCode).toBe(200);

      const getResponse = adminControlUserDetails(validSessionId);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.user.name).toBe('A'.repeat(20) + ' ' + 'B'.repeat(20));
    });

    test('Update with names containing all valid special characters', () => {
      const response = adminControlUserDetailsUpdate(
        validSessionId,
        'edge@test.com',
        "Jean-Luc O'Neill",
        "Smith-Wilson"
      );
      expect(response.statusCode).toBe(200);

      const getResponse = adminControlUserDetails(validSessionId);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.user.name).toBe("Jean-Luc O'Neill Smith-Wilson");
    });

    test('Empty update body should succeed', () => {
      const response = apiRequest('PUT', '/v1/admin/controluser/details', {
        json: {},
        headers: { controlUserSessionId: validSessionId },
        fullResponse: true
      });
      expect(response.statusCode).toBe(200);

      const getResponse = adminControlUserDetails(validSessionId);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body.user.name).toBe('Edge Test');
      expect(getResponse.body.user.email).toBe('edge@test.com');
    });
  });
});