// adminAuthLogin.test.ts - Admin Auth Login HTTP Tests (Swagger Compliant)

import { apiRequest, expectSuccess, expectError, expectValidSessionId, setupTest, createTestUser, registerTestUser, getSessionId, getUser, getMissionId, getAstronautId, getBodyProperty, getUserEmail, getUserName, getUserId, getUserLogins, getUserFailedLogins, getRegisteredUser, getRegisteredSessionId, getUserEmailFromUser, getUserPasswordFromUser, getUserFirstNameFromUser, getUserLastNameFromUser } from '../fakepi/helpers';

import { getEmailNotExistMessage, getPasswordIncorrectMessage } from '../../src/other';

describe("🔐 Admin Auth Login HTTP Tests (Swagger Compliant)", () => {
  let testUser: any;
  let sessionId: string;

  beforeEach(() => {
    setupTest();

    const result = registerTestUser({
      email: "login.test@starfleet.gov.au",
      password: "LoginPass123",
      nameFirst: "Jane",
      nameLast: "Smith",
    });
    testUser = getRegisteredUser(result);
    sessionId = getRegisteredSessionId(result);
  });

  describe("POST /v1/admin/auth/login", () => {
    test("✅ Valid login should succeed", () => {
      const loginData = {
        email: getUserEmailFromUser(testUser),
        password: getUserPasswordFromUser(testUser),
      };

      const response = apiRequest('POST', '/v1/admin/auth/login', {
        json: loginData,
        fullResponse: true
      });

      const result = expectSuccess(response, 200);
      
      // Swagger spec: should return { controlUserSessionId: string }
      expect(result).toHaveProperty('controlUserSessionId');
      expect(typeof result.controlUserSessionId).toBe('string');
      expect(result.controlUserSessionId.length).toBeGreaterThan(0);
    });

    test("✅ Valid login with correct email and password", () => {
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

      const loginResult = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: 'james.kirk@starfleet.gov.au',
          password: 'livelong123'
        },
        fullResponse: true
      });

      const result = expectSuccess(loginResult, 200);
      
      // Verify Swagger-compliant response structure
      expect(result).toHaveProperty('controlUserSessionId');
      expect(typeof result.controlUserSessionId).toBe('string');
      expect(result.controlUserSessionId.length).toBeGreaterThan(0);
    });

    test("✅ Valid login after multiple registrations", () => {
      // Register multiple users
      apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'user1@test.com',
          password: 'password1',
          nameFirst: 'User',
          nameLast: 'One'
        },
        fullResponse: true
      });

      apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'user2@test.com',
          password: 'password2',
          nameFirst: 'User',
          nameLast: 'Two'
        },
        fullResponse: true
      });

      const registerResult = apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'user3@test.com',
          password: 'password3',
          nameFirst: 'User',
          nameLast: 'Three'
        },
        fullResponse: true
      });
      expectSuccess(registerResult, 200);

      // Login as second user
      const loginResult = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: 'user2@test.com',
          password: 'password2'
        },
        fullResponse: true
      });

      const result = expectSuccess(loginResult, 200);
      expect(result).toHaveProperty('controlUserSessionId');
      expect(typeof result.controlUserSessionId).toBe('string');
    });

    test("❌ Login with non-existent email", () => {
      const result = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: 'nonexistent@test.com',
          password: 'password123'
        },
        fullResponse: true
      });

      // other.ts에서 정의된 정확한 에러 메시지 사용
      const errorResult = expectError(result, 400, getEmailNotExistMessage());
      expect(errorResult).toHaveProperty("error");
    });

    test("❌ Login with incorrect password", () => {
      const registerResult = apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'test@example.com',
          password: 'correctpassword1',
          nameFirst: 'Test',
          nameLast: 'User'
        },
        fullResponse: true
      });
      expectSuccess(registerResult, 200);

      const loginResult = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: 'test@example.com',
          password: 'wrongpassword123'
        },
        fullResponse: true
      });

      // other.ts에서 정의된 정확한 에러 메시지 사용
      const result = expectError(loginResult, 400, getPasswordIncorrectMessage());
      expect(result).toHaveProperty("error");
    });

    test("❌ Login with empty email", () => {
      const result = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: '',
          password: 'password123'
        },
        fullResponse: true
      });

      // 빈 이메일은 존재하지 않는 이메일로 처리
      const errorResult = expectError(result, 400, getEmailNotExistMessage());
      expect(errorResult).toHaveProperty("error");
    });

    test("❌ Login with empty password", () => {
      const registerResult = apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'test@example.com',
          password: 'correctpassword1',
          nameFirst: 'Test',
          nameLast: 'User'
        },
        fullResponse: true
      });
      expectSuccess(registerResult, 200);

      const result = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: 'test@example.com',
          password: ''
        },
        fullResponse: true
      });

      // 빈 비밀번호는 틀린 비밀번호로 처리
      const errorResult = expectError(result, 400, getPasswordIncorrectMessage());
      expect(errorResult).toHaveProperty("error");
    });

    test("❌ Login with both email and password empty", () => {
      const result = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: '',
          password: ''
        },
        fullResponse: true
      });

      // 이메일 검증이 먼저 실행되어야 함
      const errorResult = expectError(result, 400, getEmailNotExistMessage());
      expect(errorResult).toHaveProperty("error");
    });

    test("❌ Case sensitive email validation", () => {
      const registerResult = apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'test@example.com',
          password: 'password123',
          nameFirst: 'Test',
          nameLast: 'User'
        },
        fullResponse: true
      });
      expectSuccess(registerResult, 200);

      const loginResult = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: 'TEST@EXAMPLE.COM', // Different case
          password: 'password123'
        },
        fullResponse: true
      });

      const result = expectError(loginResult, 400, getEmailNotExistMessage());
      expect(result).toHaveProperty("error");
    });

    test("❌ Case sensitive password validation", () => {
      const registerResult = apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'test@example.com',
          password: 'Password123',
          nameFirst: 'Test',
          nameLast: 'User'
        },
        fullResponse: true
      });
      expectSuccess(registerResult, 200);

      const loginResult = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: 'test@example.com',
          password: 'password123' // Different case
        },
        fullResponse: true
      });

      const result = expectError(loginResult, 400, getPasswordIncorrectMessage());
      expect(result).toHaveProperty("error");
    });

    test("❌ Multiple login attempts with wrong password", () => {
      const registerResult = apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'test@example.com',
          password: 'correctpassword1',
          nameFirst: 'Test',
          nameLast: 'User'
        },
        fullResponse: true
      });
      expectSuccess(registerResult, 200);

      // First failed attempt
      const firstAttempt = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: 'test@example.com',
          password: 'wrongpassword1'
        },
        fullResponse: true
      });
      expectError(firstAttempt, 400, getPasswordIncorrectMessage());

      // Second failed attempt
      const secondAttempt = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: 'test@example.com',
          password: 'wrongpassword2'
        },
        fullResponse: true
      });
      expectError(secondAttempt, 400, getPasswordIncorrectMessage());

      // Successful login should still work
      const successfulAttempt = apiRequest('POST', '/v1/admin/auth/login', {
        json: {
          email: 'test@example.com',
          password: 'correctpassword1'
        },
        fullResponse: true
      });
      const result = expectSuccess(successfulAttempt, 200);
      expect(result).toHaveProperty('controlUserSessionId');
    });
  });
});