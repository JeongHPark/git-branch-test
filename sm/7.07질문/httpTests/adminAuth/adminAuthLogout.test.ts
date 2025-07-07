// adminAuthLogout.test.ts - Admin Auth Logout HTTP Tests (Swagger Compliant)

import { apiRequest, expectSuccess, expectError, setupTest, registerTestUser, getSessionId, getUser, getMissionId, getAstronautId, getBodyProperty, getUserEmail, getUserName, getUserId, getUserLogins, getUserFailedLogins, getRegisteredUser, getRegisteredSessionId, getUserEmailFromUser, getUserPasswordFromUser, getUserFirstNameFromUser, getUserLastNameFromUser } from '../fakepi/helpers';

import { getSessionInvalidMessage } from '../../src/other';

describe("🔐 Admin Auth Logout HTTP Tests (Swagger Compliant)", () => {
  let validSessionId: string;

  beforeEach(() => {
    setupTest();

    const userData = {
      email: "logout-test@starfleet.gov.au",
      password: "LogoutPass123",
      nameFirst: "John",
      nameLast: "Doe",
    };

    const result = registerTestUser(userData);
    validSessionId = getRegisteredSessionId(result);
  });

  describe("POST /v1/admin/auth/logout", () => {
    test("✅ Valid logout should succeed", () => {
      const response = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          'controlUserSessionId': validSessionId
        },
        fullResponse: true
      });

      const result = expectSuccess(response, 200);
      
      // Swagger spec: should return empty object {}
      expect(result).toEqual({});
    });

    test("✅ Valid logout with valid session from register", () => {
      const registerResult = apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'james.kirk@starfleet.gov.au',
          password: 'livelong123',
          nameFirst: 'James',
          nameLast: 'Kirk'
        },
        fullResponse: true
      });
      expectSuccess(registerResult, 200);
      const sessionId = getSessionId(registerResult);

      const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          'controlUserSessionId': sessionId
        },
        fullResponse: true
      });

      const result = expectSuccess(logoutResult, 200);
      expect(result).toEqual({}); // Swagger spec: Empty object
    });

    test("✅ Valid logout after login", () => {
      const registerResult = apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'spock@starfleet.gov.au',
          password: 'logical123',
          nameFirst: 'Spock',
          nameLast: 'Vulcan'
        },
        fullResponse: true
      });
      expectSuccess(registerResult, 200);

      const loginResult = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: 'spock@starfleet.gov.au',
          password: 'logical123'
        },
        fullResponse: true
      });
      expectSuccess(loginResult, 200);
      const sessionId = getSessionId(loginResult);

      const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          'controlUserSessionId': sessionId
        },
        fullResponse: true
      });

      const result = expectSuccess(logoutResult, 200);
      expect(result).toEqual({}); // Swagger spec: Empty object
    });

    test("❌ Logout with empty session ID", () => {
      const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          'controlUserSessionId': ''
        },
        fullResponse: true
      });

      const result = expectError(logoutResult, 401, getSessionInvalidMessage());
      expect(result).toHaveProperty("error");
    });

    test("❌ Logout with invalid session ID", () => {
      const response = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          'controlUserSessionId': 'invalid-session-12345'
        },
        fullResponse: true
      });

      const result = expectError(response, 401, getSessionInvalidMessage());
      expect(result).toHaveProperty("error");
    });

    test("❌ Logout with non-existent session ID", () => {
      const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          'controlUserSessionId': 'non-existent-session-id-999'
        },
        fullResponse: true
      });

      const result = expectError(logoutResult, 401, getSessionInvalidMessage());
      expect(result).toHaveProperty("error");
    });

    test("❌ Double logout should fail", () => {
      // First logout should succeed
      const firstLogoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          'controlUserSessionId': validSessionId
        },
        fullResponse: true
      });
      const firstResult = expectSuccess(firstLogoutResult, 200);
      expect(firstResult).toEqual({});

      // Second logout with same session should fail
      const secondLogoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          'controlUserSessionId': validSessionId
        },
        fullResponse: true
      });

      const secondResult = expectError(secondLogoutResult, 401, getSessionInvalidMessage());
      expect(secondResult).toHaveProperty("error");
    });

    test("❌ Logout without controlUserSessionId header", () => {
      // Request without the required header
      const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {},
        fullResponse: true
      });

      const result = expectError(logoutResult, 401, getSessionInvalidMessage());
      expect(result).toHaveProperty("error");
    });

    test("✅ Session invalidation after logout", () => {
      // Logout
      const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          'controlUserSessionId': validSessionId
        },
        fullResponse: true
      });
      const logoutResponse = expectSuccess(logoutResult, 200);
      expect(logoutResponse).toEqual({});

      // Try to use the session for another operation (should fail)
      const missionListResult = apiRequest('GET', '/v1/admin/mission/list', {
        headers: {
          'controlUserSessionId': validSessionId
        },
        fullResponse: true
      });

      // 401 에러를 받아야 함 (세션이 더 이상 유효하지 않음)
      const result = expectError(missionListResult, 401, getSessionInvalidMessage());
      expect(result).toHaveProperty("error");
    });

    test("✅ Multiple users can logout independently", () => {
      // Register second user
      const secondUserResult = registerTestUser({
        email: "second-user@starfleet.gov.au",
        password: "SecondPass123",
        nameFirst: "Jane",
        nameLast: "Smith",
      });
      const secondSessionId = getRegisteredSessionId(secondUserResult);

      // First user logout
      const firstLogoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          'controlUserSessionId': validSessionId
        },
        fullResponse: true
      });
      const firstResult = expectSuccess(firstLogoutResult, 200);
      expect(firstResult).toEqual({});

      // Second user should still be able to logout
      const secondLogoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
        json: {},
        headers: {
          'controlUserSessionId': secondSessionId
        },
        fullResponse: true
      });
      const secondResult = expectSuccess(secondLogoutResult, 200);
      expect(secondResult).toEqual({});
    });

    test("❌ Logout with malformed session ID", () => {
      const malformedSessionIds = [
        'null',
        'undefined',
        '123',
        'short',
        'a'.repeat(1000), // Very long string
        'session with spaces',
        'session@with#special$chars'
      ];

      for (const sessionId of malformedSessionIds) {
        const logoutResult = apiRequest('POST', '/v1/admin/auth/logout', {
          json: {},
          headers: {
            'controlUserSessionId': sessionId
          },
          fullResponse: true
        });

        const result = expectError(logoutResult, 401, getSessionInvalidMessage());
        expect(result).toHaveProperty("error");
      }
    });
  });
});