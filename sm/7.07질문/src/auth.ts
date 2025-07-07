// auth.ts - Assignment optimized implementation
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { getData, addUser, updateUser, removeSession, User, generateControlUserId, createSession } from './dataStore';

// Import error messages and validation rules from centralized location
import { ERROR_MESSAGES, VALIDATION_RULES } from './other';
import { isValidName, isValidEmail, isValidPassword } from './helper';

// ==================== Utility Functions ====================
function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): boolean {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

function findUserByEmail(email: string): User | undefined {
  const data = getData() as { users: User[] };
  return data.users.find((u) => u.email === email);
}

// ==================== Swagger API Implementation ====================

/**
 * User Registration API
 * 수정: 세션 생성 로직 제거, controlUserId만 반환
 */
export function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  // Clean input values - handle undefined/null safely
  const cleanEmail = (email || '').trim();
  const cleanPassword = (password || '').trim();
  const cleanNameFirst = (nameFirst || '').trim();
  const cleanNameLast = (nameLast || '').trim();

  // Check email duplication (case-sensitive)
  if (findUserByEmail(cleanEmail)) {
    return { error: ERROR_MESSAGES.EMAIL_IN_USE };
  }

  // Email validation
  if (!isValidEmail(cleanEmail)) {
    return { error: ERROR_MESSAGES.EMAIL_INVALID };
  }

  // Name validation - check length first, then characters
  if (cleanNameFirst.length < VALIDATION_RULES.NAME.MIN_LENGTH || cleanNameFirst.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return { error: ERROR_MESSAGES.NAME_FIRST_LENGTH };
  }
  if (!validator.matches(cleanNameFirst, /^[a-zA-Z\-'\s]+$/)) {
    return { error: ERROR_MESSAGES.NAME_FIRST_INVALID };
  }

  if (cleanNameLast.length < VALIDATION_RULES.NAME.MIN_LENGTH || cleanNameLast.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return { error: ERROR_MESSAGES.NAME_LAST_LENGTH };
  }
  if (!validator.matches(cleanNameLast, /^[a-zA-Z\-'\s]+$/)) {
    return { error: ERROR_MESSAGES.NAME_LAST_INVALID };
  }

  // Password validation
  if (!isValidPassword(cleanPassword)) {
    if (cleanPassword.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
      return { error: ERROR_MESSAGES.PASSWORD_TOO_SHORT };
    }
    return { error: ERROR_MESSAGES.PASSWORD_INVALID_FORMAT };
  }

  // Create user
  const controlUserId = generateControlUserId();
  const hashedPassword = hashPassword(cleanPassword);

  const newUser: User = {
    controlUserId,
    email: cleanEmail,
    password: hashedPassword,
    nameFirst: cleanNameFirst,
    nameLast: cleanNameLast,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    passwordHistory: [hashedPassword],
  };

  addUser(newUser);

  return { controlUserId };
}

/**
 * User Login API
 */
export function adminAuthLogin(email: string, password: string) {
  const cleanEmail = (email || '').trim();
  const cleanPassword = (password || '').trim();

  // Swagger spec: First check if email exists (regardless of format)
  const user = findUserByEmail(cleanEmail);
  if (!user) {
    return { error: ERROR_MESSAGES.EMAIL_NOT_EXIST };
  }

  // Swagger spec: Then check if password is correct
  if (!verifyPassword(cleanPassword, user.password)) {
    // Increase failure count
    updateUser(user.controlUserId, {
      numFailedPasswordsSinceLastLogin: (user.numFailedPasswordsSinceLastLogin || 0) + 1
    });
    return { error: ERROR_MESSAGES.PASSWORD_INCORRECT };
  }

  // Update count on success
  updateUser(user.controlUserId, {
    numSuccessfulLogins: (user.numSuccessfulLogins || 0) + 1,
    numFailedPasswordsSinceLastLogin: 0
  });

  // Create session
  const controlUserSessionId = createSession(user.controlUserId);

  return { controlUserSessionId };
}

/**
 * User Logout API
 */
export function adminAuthLogout(controlUserSessionId: string) {
  if (!controlUserSessionId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  const success = removeSession(controlUserSessionId);

  if (!success) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  return {}; // Swagger spec: empty object
}

/**
 * User Details Retrieval API
 */
export function adminControlUserDetails(controlUserId: number) {
  const data = getData() as { users: User[] };
  const user = data.users.find((u) => u.controlUserId === controlUserId);

  if (!user) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  return {
    user: {
      controlUserId: user.controlUserId,
      name: `${user.nameFirst} ${user.nameLast}`,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins || 1,
      numFailedPasswordsSinceLastLogin:
        user.numFailedPasswordsSinceLastLogin || 0,
    },
  };
}

/**
 * User Details Update API
 */
export function adminControlUserDetailsUpdate(
  controlUserId: number,
  email: string,
  nameFirst: string,
  nameLast: string
) {
  const data = getData() as { users: User[] };
  const user = data.users.find((u) => u.controlUserId === controlUserId);

  if (!user) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanNameFirst = nameFirst.trim();
  const cleanNameLast = nameLast.trim();

  // Check email duplication (excluding current user)
  const existingUser = data.users.find(
    (u) => u.email === cleanEmail && u.controlUserId !== controlUserId
  );
  if (existingUser) {
    return { error: ERROR_MESSAGES.EMAIL_USED_BY_OTHER };
  }

  // Email validation
  if (!isValidEmail(cleanEmail)) {
    return { error: ERROR_MESSAGES.EMAIL_INVALID };
  }

  // Name validation using centralized function
  if (!isValidName(cleanNameFirst)) {
    return { error: ERROR_MESSAGES.NAME_FIRST_INVALID };
  }

  if (!isValidName(cleanNameLast)) {
    return { error: ERROR_MESSAGES.NAME_LAST_INVALID };
  }

  updateUser(controlUserId, {
    email: cleanEmail,
    nameFirst: cleanNameFirst,
    nameLast: cleanNameLast,
  });

  return {};
}

/**
 * User Password Update API
 */
export function adminControlUserPasswordUpdate(
  controlUserId: number,
  oldPassword: string,
  newPassword: string
) {
  const data = getData() as { users: User[] };
  const user = data.users.find((u) => u.controlUserId === controlUserId);

  if (!user) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  // Check old password
  if (!verifyPassword(oldPassword, user.password)) {
    return { error: ERROR_MESSAGES.OLD_PASSWORD_INCORRECT };
  }

  // Validate new password
  if (!isValidPassword(newPassword)) {
    if (newPassword.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
      return { error: ERROR_MESSAGES.PASSWORD_TOO_SHORT };
    }
    return { error: ERROR_MESSAGES.PASSWORD_INVALID_FORMAT };
  }

  // Check if new password is in history (use bcrypt comparison)
  const hashedNewPassword = hashPassword(newPassword);
  if (user.passwordHistory && user.passwordHistory.some(historicalHash => verifyPassword(newPassword, historicalHash))) {
    return { error: ERROR_MESSAGES.NEW_PASSWORD_USED };
  }

  // Update password and add new password to history
  const updatedPasswordHistory = [...(user.passwordHistory || []), hashedNewPassword];
  updateUser(controlUserId, {
    password: hashedNewPassword,
    passwordHistory: updatedPasswordHistory,
  });

  return {};
}
