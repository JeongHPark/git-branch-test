// adminAuthRegister.test.ts - Admin Auth Register HTTP Tests (Swagger Compliant)

import { apiRequest, expectSuccess, expectError, expectValidSessionIdJest as expectValidSessionId, setupTest, getSessionId, getUser, getMissionId, getAstronautId, getBodyProperty, getUserEmail, getUserName, getUserId, getUserLogins, getUserFailedLogins } from '../fakepi/helpers';

// Server configuration - BASE_URL은 apiRequest에서 자동으로 처리됨

import { getEmailInUseMessage, getEmailInvalidMessage, getNameFirstInvalidCharsMessage, getNameFirstInvalidLengthMessage, getNameLastInvalidCharsMessage, getNameLastInvalidLengthMessage, getPasswordTooShortMessage, getPasswordInvalidFormatMessage } from '../../src/other';

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

describe('POST /v1/admin/auth/register (Swagger Compliant)', () => {
  
  describe('✅ Success cases', () => {
    beforeEach(() => {
      setupTest();
    });

    test('Valid registration with all correct parameters', () => {
      const result = adminAuthRegister(
        'james.kirk@starfleet.gov.au',
        'livelong123',
        'James',
        'Kirk'
      );

      const response = expectSuccess(result, 200);
      
      // Swagger spec: should return { controlUserSessionId: string }
      expect(response).toHaveProperty('controlUserSessionId');
      expect(typeof response.controlUserSessionId).toBe('string');
      expect(response.controlUserSessionId.length).toBeGreaterThan(0);
    });

    test('Valid registration with minimum length names', () => {
      const result = adminAuthRegister(
        'ab@test.com',
        'password1',
        'Ab', // 2 characters (minimum)
        'Cd'  // 2 characters (minimum)
      );
      
      const response = expectSuccess(result, 200);
      expect(response).toHaveProperty('controlUserSessionId');
    });

    test('Valid registration with maximum length names', () => {
      const result = adminAuthRegister(
        'max@example.com',
        'password123',
        'Abcdefghijklmnopqrst', // 20 characters (maximum)
        'Abcdefghijklmnopqrst'  // 20 characters (maximum)
      );
      
      const response = expectSuccess(result, 200);
      expect(response).toHaveProperty('controlUserSessionId');
    });

    test('Valid registration with names containing allowed special characters', () => {
      const result = adminAuthRegister(
        'mary@test.com',
        'password123',
        "Mary-Jane O'Connor", // hyphens and apostrophes
        'Smith-Jones'          // hyphens
      );
      
      const response = expectSuccess(result, 200);
      expect(response).toHaveProperty('controlUserSessionId');
    });

    test('Valid registration with minimum password length', () => {
      const result = adminAuthRegister(
        'min@test.com',
        'passwor1', // 8 characters with letter and number
        'John',
        'Doe'
      );
      
      const response = expectSuccess(result, 200);
      expect(response).toHaveProperty('controlUserSessionId');
    });

    test('Valid registration with complex password', () => {
      const result = adminAuthRegister(
        'complex@test.com',
        'ComplexPass123!',
        'John',
        'Doe'
      );
      
      const response = expectSuccess(result, 200);
      expect(response).toHaveProperty('controlUserSessionId');
    });

    test('Valid names with spaces', () => {
      const result = adminAuthRegister(
        'spaces@example.com',
        'Password123',
        'Jean Luc',
        'Van Der Berg'
      );
      
      const response = expectSuccess(result, 200);
      expect(response).toHaveProperty('controlUserSessionId');
    });

    test('Valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user123@test-domain.com',
        'simple@example.org'
      ];

      validEmails.forEach(email => {
        const result = adminAuthRegister(
          email,
          'password123',
          'John',
          'Doe'
        );
        
        expectSuccess(result, 200);
      });
    });

    test('Registration with allowed special characters in names', () => {
      const result = adminAuthRegister(
        'mary@test.com',
        'password123',
        "Mary-Jane", // hyphen allowed
        "O'Connor"   // apostrophe allowed
      );
      
      const response = expectSuccess(result, 200);
      expect(response).toHaveProperty('controlUserSessionId');
    });
  });

  describe('❌ Email validation errors', () => {
    beforeEach(() => {
      setupTest();
    });

    test('Invalid email format - missing @', () => {
      const result = adminAuthRegister(
        'invalidemail.com',
        'password123',
        'John',
        'Doe'
      );
      
      expectError(result, 400, getEmailInvalidMessage());
    });

    test('Invalid email format - missing domain', () => {
      const result = adminAuthRegister(
        'test@',
        'password123',
        'John',
        'Doe'
      );
      
      expectError(result, 400, getEmailInvalidMessage());
    });

    test('Invalid email format - empty string', () => {
      const result = adminAuthRegister(
        '',
        'password123',
        'John',
        'Doe'
      );
      
      expectError(result, 400, getEmailInvalidMessage());
    });

    test('Invalid email format - no domain extension', () => {
      const result = adminAuthRegister(
        'test@domain',
        'password123',
        'John',
        'Doe'
      );
      
      expectError(result, 400, getEmailInvalidMessage());
    });

    test('Invalid email format - multiple @ symbols', () => {
      const result = adminAuthRegister(
        'test@@example.com',
        'password123',
        'John',
        'Doe'
      );
      
      expectError(result, 400, getEmailInvalidMessage());
    });

    test('Email address already in use', () => {
      // First registration
      const firstResult = adminAuthRegister(
        'duplicate@test.com',
        'password123',
        'John',
        'Doe'
      );
      expectSuccess(firstResult, 200);

      // Second registration with same email should fail
      const secondResult = adminAuthRegister(
        'duplicate@test.com',
        'password456',
        'Jane',
        'Smith'
      );
      expectError(secondResult, 400, getEmailInUseMessage());
    });

    test('Email case sensitivity - should be case sensitive', () => {
      // Register with lowercase
      const firstResult = adminAuthRegister(
        'case@test.com',
        'password123',
        'John',
        'Doe'
      );
      expectSuccess(firstResult, 200);
      
      // Register with uppercase - should succeed if emails are case sensitive
      const secondResult = adminAuthRegister(
        'CASE@TEST.COM',
        'password456',
        'Jane',
        'Smith'
      );
      expectSuccess(secondResult, 200);
    });
  });

  describe('❌ NameFirst validation errors', () => {
    beforeEach(() => {
      setupTest();
    });

    test('NameFirst too short - 1 character', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        'A',
        'Doe'
      );
      
      expectError(result, 400, getNameFirstInvalidLengthMessage());
    });

    test('NameFirst too long - 21 characters', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        'Abcdefghijklmnopqrstu', // 21 characters
        'Doe'
      );
      
      expectError(result, 400, getNameFirstInvalidLengthMessage());
    });

    test('NameFirst contains invalid characters - numbers', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        'John123',
        'Doe'
      );
      
      expectError(result, 400, getNameFirstInvalidCharsMessage());
    });

    test('NameFirst contains invalid characters - special symbols', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        'John@#$',
        'Doe'
      );
      
      expectError(result, 400, getNameFirstInvalidCharsMessage());
    });

    test('NameFirst empty string', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        '',
        'Doe'
      );
      
      expectError(result, 400, getNameFirstInvalidLengthMessage());
    });

    test('NameFirst with invalid characters - underscores', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        'John_Smith',
        'Doe'
      );
      
      expectError(result, 400, getNameFirstInvalidCharsMessage());
    });

    test('NameFirst with invalid characters - periods', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        'John.Smith',
        'Doe'
      );
      
      expectError(result, 400, getNameFirstInvalidCharsMessage());
    });
  });

  describe('❌ NameLast validation errors', () => {
    beforeEach(() => {
      setupTest();
    });

    test('NameLast too short - 1 character', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        'John',
        'D'
      );
      
      expectError(result, 400, getNameLastInvalidLengthMessage());
    });

    test('NameLast too long - 21 characters', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        'John',
        'Abcdefghijklmnopqrstu' // 21 characters
      );
      
      expectError(result, 400, getNameLastInvalidLengthMessage());
    });

    test('NameLast contains invalid characters - numbers', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        'John',
        'Doe123'
      );
      
      expectError(result, 400, getNameLastInvalidCharsMessage());
    });

    test('NameLast contains invalid characters - special symbols', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        'John',
        'Doe@#$'
      );
      
      expectError(result, 400, getNameLastInvalidCharsMessage());
    });

    test('NameLast empty string', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        'John',
        ''
      );
      
      expectError(result, 400, getNameLastInvalidLengthMessage());
    });

    test('NameLast with invalid characters - underscores', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password123',
        'John',
        'Smith_Jones'
      );
      
      expectError(result, 400, getNameLastInvalidCharsMessage());
    });
  });

  describe('❌ Password validation errors', () => {
    beforeEach(() => {
      setupTest();
    });

    test('Password too short - 7 characters', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'pass123', // 7 characters
        'John',
        'Doe'
      );
      
      expectError(result, 400, getPasswordTooShortMessage());
    });

    test('Password too short - 1 character', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'a',
        'John',
        'Doe'
      );
      
      expectError(result, 400, getPasswordTooShortMessage());
    });

    test('Password missing numbers - only letters', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password', // no numbers
        'John',
        'Doe'
      );
      
      expectError(result, 400, getPasswordInvalidFormatMessage());
    });

    test('Password missing letters - only numbers', () => {
      const result = adminAuthRegister(
        'test@example.com',
        '12345678', // no letters
        'John',
        'Doe'
      );
      
      expectError(result, 400, getPasswordInvalidFormatMessage());
    });

    test('Password empty string', () => {
      const result = adminAuthRegister(
        'test@example.com',
        '',
        'John',
        'Doe'
      );
      
      expectError(result, 400, getPasswordTooShortMessage());
    });

    test('Password with only special characters', () => {
      const result = adminAuthRegister(
        'test@example.com',
        '!@#$%^&*()',
        'John',
        'Doe'
      );
      
      expectError(result, 400, getPasswordInvalidFormatMessage());
    });

    test('Password with special characters but no letters', () => {
      const result = adminAuthRegister(
        'test@example.com',
        '12345!@#',
        'John',
        'Doe'
      );
      
      expectError(result, 400, getPasswordInvalidFormatMessage());
    });

    test('Password with special characters but no numbers', () => {
      const result = adminAuthRegister(
        'test@example.com',
        'password!@#',
        'John',
        'Doe'
      );
      
      expectError(result, 400, getPasswordInvalidFormatMessage());
    });
  });

  describe('❌ Edge cases and combinations', () => {
    beforeEach(() => {
      setupTest();
    });

    test('Multiple validation errors - email validation takes priority', () => {
      const result = adminAuthRegister(
        'invalid-email', // Invalid email
        '123',           // Invalid password
        'A',             // Invalid nameFirst
        'B'              // Invalid nameLast
      );
      
      // 이메일 검증이 먼저 실행되어야 함
      expectError(result, 400, getEmailInvalidMessage());
    });

    test('All empty strings', () => {
      const result = adminAuthRegister(
        '',
        '',
        '',
        ''
      );
      
      // 이메일 검증이 먼저 실행되어야 함
      expectError(result, 400, getEmailInvalidMessage());
    });

    test('Valid email but other fields invalid - nameFirst priority', () => {
      const result = adminAuthRegister(
        'valid@example.com',
        'short', // Invalid password
        'A', // Invalid nameFirst (too short)
        'ValidLastName'
      );

      // Server checks nameFirst validation before password validation
      expectError(result, 400, getNameFirstInvalidLengthMessage());
    });

    test('Unicode characters in names should fail', () => {
      const result = adminAuthRegister(
        'unicode@test.com',
        'password123',
        'José',     // Contains unicode character
        'González'  // Contains unicode character
      );
      
      expectError(result, 400, getNameFirstInvalidCharsMessage());
    });

    test('Mixed valid and invalid characters in names', () => {
      const result = adminAuthRegister(
        'mixed@test.com',
        'password123',
        'John$mith', // Contains invalid $ character
        'Doe'
      );
      
      expectError(result, 400, getNameFirstInvalidCharsMessage());
    });

    test('Names with only spaces should fail length validation', () => {
      const result = adminAuthRegister(
        'spaces@test.com',
        'password123',
        '   ',  // Only spaces
        'Doe'
      );
      
      expectError(result, 400, getNameFirstInvalidLengthMessage());
    });

    test('Very long but valid email should succeed', () => {
      const longEmail = 'verylongemailaddressthatisvalidbutquitelengthy@exampledomainname.com';
      const result = adminAuthRegister(
        longEmail,
        'password123',
        'John',
        'Doe'
      );
      
      const response = expectSuccess(result, 200);
      expect(response).toHaveProperty('controlUserSessionId');
    });

    test('Password at exact minimum requirements', () => {
      const result = adminAuthRegister(
        'exact@test.com',
        'abcdefg1', // Exactly 8 chars, has letter and number
        'John',
        'Doe'
      );
      
      const response = expectSuccess(result, 200);
      expect(response).toHaveProperty('controlUserSessionId');
    });

    test('Names at exact boundaries', () => {
      const result = adminAuthRegister(
        'boundary@test.com',
        'password123',
        'AB',                    // Exactly 2 chars (minimum)
        'ABCDEFGHIJKLMNOPQRST'   // Exactly 20 chars (maximum)
      );
      
      const response = expectSuccess(result, 200);
      expect(response).toHaveProperty('controlUserSessionId');
    });
  });

  describe('❌ Missing parameter validation', () => {
    beforeEach(() => {
      setupTest();
    });

    test('Missing email parameter', () => {
      const response = apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe'
        },
        fullResponse: true
      });
      
      expectError(response, 400, getEmailInvalidMessage());
    });

    test('Missing password parameter', () => {
      const response = apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'test@test.com',
          nameFirst: 'John',
          nameLast: 'Doe'
        },
        fullResponse: true
      });
      
      expectError(response, 400, getPasswordTooShortMessage());
    });

    test('Missing nameFirst parameter', () => {
      const response = apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'test@test.com',
          password: 'password123',
          nameLast: 'Doe'
        },
        fullResponse: true
      });
      
      expectError(response, 400, getNameFirstInvalidLengthMessage());
    });

    test('Missing nameLast parameter', () => {
      const response = apiRequest('POST', '/v1/admin/auth/register', {
        json: {
          email: 'test@test.com',
          password: 'password123',
          nameFirst: 'John'
        },
        fullResponse: true
      });
      
      expectError(response, 400, getNameLastInvalidLengthMessage());
    });

    test('Missing all parameters', () => {
      const response = apiRequest('POST', '/v1/admin/auth/register', {
        json: {},
        fullResponse: true
      });
      
      expectError(response, 400, getEmailInvalidMessage());
    });
  });

  describe('✅ Complex valid scenarios', () => {
    beforeEach(() => {
      setupTest();
    });

    test('Multiple users with similar but different details', () => {
      const users = [
        { email: 'user1@test.com', password: 'password1', nameFirst: 'John', nameLast: 'Smith' },
        { email: 'user2@test.com', password: 'password2', nameFirst: 'Jane', nameLast: 'Smith' },
        { email: 'user3@test.com', password: 'password3', nameFirst: 'John', nameLast: 'Doe' }
      ];

      users.forEach(user => {
        const result = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
        const response = expectSuccess(result, 200);
        expect(response).toHaveProperty('controlUserSessionId');
      });
    });

    test('Registration with all special characters allowed in names', () => {
      const result = adminAuthRegister(
        'special@test.com',
        'password123',
        "Mary-Jane O'Connor",     // 19 chars - within limit
        "Van Der Berg"           // 13 chars - within limit
      );
      
      const response = expectSuccess(result, 200);
      expect(response).toHaveProperty('controlUserSessionId');
    });

    test('Registration with complex valid password', () => {
      const result = adminAuthRegister(
        'complex@test.com',
        'MyVeryComplexPassword123WithManyCharacters!@#',
        'John',
        'Doe'
      );
      
      const response = expectSuccess(result, 200);
      expect(response).toHaveProperty('controlUserSessionId');
    });

    test('Sequential registrations should all succeed', () => {
      const users = [
        { email: 'user1@test.com', nameFirst: 'John', nameLast: 'Doe' },
        { email: 'user2@test.com', nameFirst: 'Jane', nameLast: 'Smith' },
        { email: 'user3@test.com', nameFirst: 'Bob', nameLast: 'Johnson' }
      ];

      users.forEach(user => {
        const result = adminAuthRegister(
          user.email,
          'password123',
          user.nameFirst,
          user.nameLast
        );
        
        const response = expectSuccess(result, 200);
        expect(response).toHaveProperty('controlUserSessionId');
      });
    });
  });
});