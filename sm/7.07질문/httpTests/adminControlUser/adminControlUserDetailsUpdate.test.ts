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

function adminUserDetails(controlUserSessionId: string): any {
  return apiRequest('GET', '/v1/admin/controluser/details', {
    headers: { controlUserSessionId },
    fullResponse: true
  });
}

function adminUserDetailsUpdate(controlUserSessionId: string, email: string, nameFirst: string, nameLast: string): any {
  return apiRequest('PUT', '/v1/admin/controluser/details', {
    json: { email, nameFirst, nameLast },
    headers: { controlUserSessionId },
    fullResponse: true
  });
}

function clearData(): void {
  const response = apiRequest('DELETE', '/clear', { fullResponse: true });
  expect(response.statusCode).toBe(200);
}

describe('Admin Control User Details Update Tests', () => {
  beforeEach(() => {
    clearData();
  });

  test('Successful user details update', () => {
    const registerResult = adminAuthRegister(
      'alice@example.com',
      'Password123',
      'Alice',
      'Smith'
    );
    expect(registerResult.statusCode).toBe(200);
    const controlUserSessionId = registerResult.body.controlUserSessionId;

    const res = adminUserDetailsUpdate(
      controlUserSessionId,
      'aliceupdated@example.com',
      'AliceUpdated',
      'SmithUpdated'
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({});
    
    // Verify details were updated
    const detailsRes = adminUserDetails(controlUserSessionId);
    expect(detailsRes.statusCode).toBe(200);
    expect(detailsRes.body.user.email).toBe('aliceupdated@example.com');
    expect(detailsRes.body.user.name).toBe('AliceUpdated SmithUpdated');
  });

  test('User details update with invalid session', () => {
    const result = adminUserDetailsUpdate(
      'invalid-session-id',
      'test@example.com',
      'Test',
      'User'
    );
    expectError(result, 401, getSessionInvalidMessage());
  });

  test('User details update with email already in use', () => {
    // Register first user
    const registerResult1 = adminAuthRegister(
      'user1@example.com',
      'Password123',
      'User',
      'One'
    );
    expect(registerResult1.statusCode).toBe(200);
    
    // Register second user
    const registerResult2 = adminAuthRegister(
      'user2@example.com',
      'Password123',
      'User',
      'Two'
    );
    expect(registerResult2.statusCode).toBe(200);
    const controlUserSessionId = registerResult2.body.controlUserSessionId;

    // Try to update second user's email to first user's email
    const result = adminUserDetailsUpdate(
      controlUserSessionId,
      'user1@example.com',
      'User',
      'Two'
    );
    expectError(result, 400, getEmailUsedByOtherMessage());
  });

  test('User details update with invalid email formats', () => {
    const registerResult = adminAuthRegister(
      'valid@example.com',
      'Password123',
      'Valid',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const controlUserSessionId = registerResult.body.controlUserSessionId;

    // Test emails that fail validator.isEmail() according to Swagger spec
    const invalidEmails = [
      '',                        // Empty string
      'invalid-email',           // No @ symbol
      'test@',                   // No domain
      '@example.com',            // No local part
      'test.example.com',        // No @ symbol
      'test@',                   // Incomplete domain
      'test@.com',               // Invalid domain start
      'test@com',                // No domain extension
      'test space@example.com',  // Space in local part
      'test@exam ple.com'        // Space in domain
    ];

    invalidEmails.forEach(email => {
      const res = adminUserDetailsUpdate(
        controlUserSessionId,
        email,
        'Valid',
        'User'
      );
      expectError(res, 400, getEmailInvalidMessage());
    });
  });

  test('User details update with comprehensive name validation', () => {
    const registerResult = adminAuthRegister(
      'test@example.com',
      'Password123',
      'Test',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const controlUserSessionId = registerResult.body.controlUserSessionId;

    // Test nameFirst validation - too short (< 2 characters)
    let res = adminUserDetailsUpdate(
      controlUserSessionId,
      'test@example.com',
      'T',
      'User'
    );
    expectError(res, 400, getNameFirstInvalidMessage());

    // Test nameFirst validation - too long (> 20 characters)
    res = adminUserDetailsUpdate(
      controlUserSessionId,
      'test@example.com',
      'A'.repeat(21),
      'User'
    );
    expectError(res, 400, getNameFirstInvalidMessage());

    // Test nameLast validation - too short (< 2 characters)
    res = adminUserDetailsUpdate(
      controlUserSessionId,
      'test@example.com',
      'Test',
      'U'
    );
    expectError(res, 400, getNameLastInvalidMessage());

    // Test nameLast validation - too long (> 20 characters)
    res = adminUserDetailsUpdate(
      controlUserSessionId,
      'test@example.com',
      'Test',
      'B'.repeat(21)
    );
    expectError(res, 400, getNameLastInvalidMessage());

    // Test valid boundary names
    res = adminUserDetailsUpdate(
      controlUserSessionId,
      'test@example.com',
      'Ab',  // 2 characters (minimum)
      'Cd'   // 2 characters (minimum)
    );
    expect(res.statusCode).toBe(200);

    res = adminUserDetailsUpdate(
      controlUserSessionId,
      'test@example.com',
      'A'.repeat(20),  // 20 characters (maximum)
      'B'.repeat(20)   // 20 characters (maximum)
    );
    expect(res.statusCode).toBe(200);
  });

  test('User details update with partial data', () => {
    const registerResult = adminAuthRegister(
      'test@example.com',
      'Password123',
      'Original',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const controlUserSessionId = registerResult.body.controlUserSessionId;

    // Update only email
    let res = adminUserDetailsUpdate(
      controlUserSessionId,
      'newemail@example.com',
      'Original',
      'User'
    );
    expect(res.statusCode).toBe(200);

    // Verify email was updated
    let detailsRes = adminUserDetails(controlUserSessionId);
    expect(detailsRes.statusCode).toBe(200);
    expect(detailsRes.body.user.email).toBe('newemail@example.com');
    expect(detailsRes.body.user.name).toBe('Original User');

    // Update only names
    res = adminUserDetailsUpdate(
      controlUserSessionId,
      'newemail@example.com',
      'NewFirst',
      'NewLast'
    );
    expect(res.statusCode).toBe(200);

    // Verify names were updated
    detailsRes = adminUserDetails(controlUserSessionId);
    expect(detailsRes.statusCode).toBe(200);
    expect(detailsRes.body.user.email).toBe('newemail@example.com');
    expect(detailsRes.body.user.name).toBe('NewFirst NewLast');
  });

  test('User details update with same email (comprehensive)', () => {
    const registerResult = adminAuthRegister(
      'same@example.com',
      'Password123',
      'Same',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const controlUserSessionId = registerResult.body.controlUserSessionId;

    // Update with same email should succeed
    const res = adminUserDetailsUpdate(
      controlUserSessionId,
      'same@example.com',
      'Updated',
      'Names'
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({});

    // Verify update was successful
    const detailsRes = adminUserDetails(controlUserSessionId);
    expect(detailsRes.statusCode).toBe(200);
    expect(detailsRes.body.user.email).toBe('same@example.com');
    expect(detailsRes.body.user.name).toBe('Updated Names');
  });

  test('User details update with special characters in names', () => {
    const registerResult = adminAuthRegister(
      'special@example.com',
      'Password123',
      'Original',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const controlUserSessionId = registerResult.body.controlUserSessionId;

    // Test valid special characters in names (only letters, spaces, hyphens, apostrophes)
    const validNames = [
      { first: "Jean-Luc", last: "Picard" },
      { first: "Mary", last: "O'Connor" },
      { first: "Anne Marie", last: "Smith" },
      { first: "Jean-Pierre", last: "Dubois" }
    ];

    validNames.forEach(({ first, last }) => {
      const res = adminUserDetailsUpdate(
        controlUserSessionId,
        'special@example.com',
        first,
        last
      );
      expect(res.statusCode).toBe(200);

      // Verify the update
      const detailsRes = adminUserDetails(controlUserSessionId);
      expect(detailsRes.statusCode).toBe(200);
      expect(detailsRes.body.user.name).toBe(`${first} ${last}`);
    });
  });

  test('User details update with invalid name characters', () => {
    const registerResult = adminAuthRegister(
      'invalid@example.com',
      'Password123',
      'Valid',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const controlUserSessionId = registerResult.body.controlUserSessionId;

    // Test invalid characters in names
    const invalidNames = [
      { first: "José", last: "García" },      // Accented characters
      { first: "李", last: "小明" },             // Non-Latin characters
      { first: "Test123", last: "User" },     // Numbers
      { first: "Test@", last: "User" },       // Special symbols
      { first: "Test()", last: "User" }       // Parentheses
    ];

    invalidNames.forEach(({ first, last }) => {
      const res = adminUserDetailsUpdate(
        controlUserSessionId,
        'invalid@example.com',
        first,
        last
      );
      // Should fail with name validation error
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe(getNameFirstInvalidMessage());
    });
  });

  test('User details update multiple times consecutively', () => {
    const registerResult = adminAuthRegister(
      'multi@example.com',
      'Password123',
      'Multi',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const controlUserSessionId = registerResult.body.controlUserSessionId;

    // Perform multiple updates with valid names (no numbers)
    const names = [
      { first: 'FirstA', last: 'LastA' },
      { first: 'FirstB', last: 'LastB' },
      { first: 'FirstC', last: 'LastC' },
      { first: 'FirstD', last: 'LastD' },
      { first: 'FirstE', last: 'LastE' }
    ];

    names.forEach(({ first, last }, i) => {
      const res = adminUserDetailsUpdate(
        controlUserSessionId,
        `multi${i + 1}@example.com`,
        first,
        last
      );
      expect(res.statusCode).toBe(200);

      // Verify each update
      const detailsRes = adminUserDetails(controlUserSessionId);
      expect(detailsRes.statusCode).toBe(200);
      expect(detailsRes.body.user.email).toBe(`multi${i + 1}@example.com`);
      expect(detailsRes.body.user.name).toBe(`${first} ${last}`);
    });
  });

  test('User details update with edge case emails', () => {
    const registerResult = adminAuthRegister(
      'edge@example.com',
      'Password123',
      'Edge',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const controlUserSessionId = registerResult.body.controlUserSessionId;

    // Test valid edge case emails
    const validEmails = [
      'test.email@example.com',
      'test+tag@example.com',
      'test_underscore@example.com',
      'test123@example.com',
      '123test@example.com',
      'test@subdomain.example.com',
      'a@b.co',  // Very short but valid
      'very.long.email.address@very.long.domain.name.com'
    ];

    validEmails.forEach(email => {
      const res = adminUserDetailsUpdate(
        controlUserSessionId,
        email,
        'Edge',
        'User'
      );
      expect(res.statusCode).toBe(200);

      // Verify the update
      const detailsRes = adminUserDetails(controlUserSessionId);
      expect(detailsRes.statusCode).toBe(200);
      expect(detailsRes.body.user.email).toBe(email);
    });
  });

  test('User details update preserves session validity', () => {
    const registerResult = adminAuthRegister(
      'session@example.com',
      'Password123',
      'Session',
      'User'
    );
    expect(registerResult.statusCode).toBe(200);
    const controlUserSessionId = registerResult.body.controlUserSessionId;

    // Update details
    const updateRes = adminUserDetailsUpdate(
      controlUserSessionId,
      'newsession@example.com',
      'NewSession',
      'User'
    );
    expect(updateRes.statusCode).toBe(200);

    // Verify session is still valid by making another request
    const detailsRes = adminUserDetails(controlUserSessionId);
    expect(detailsRes.statusCode).toBe(200);
    expect(detailsRes.body.user.email).toBe('newsession@example.com');
    expect(detailsRes.body.user.name).toBe('NewSession User');
  });
});