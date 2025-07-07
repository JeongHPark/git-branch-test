// helper.ts - Complete Validation & Password Management Helper Functions

import {
  findUserByEmail,
  findUserById,
  updateUser,
  findMissionByOwnerAndName,
  findMissionById,
  validateSession,
  getData
} from './dataStore';
import validator from 'validator';
import { VALIDATION_RULES } from './other';

// ==================== Generic Validators ====================
export function isValidEmail(email: string): boolean {
  return validator.isEmail(email);
}

export function isValidName(name: string): boolean {
  return (
    validator.isLength(name, { min: VALIDATION_RULES.NAME.MIN_LENGTH, max: VALIDATION_RULES.NAME.MAX_LENGTH }) &&
    validator.matches(name, /^[a-zA-Z\-'\s]+$/)
  );
}

export function isValidPassword(password: string): boolean {
  if (!validator.isLength(password, { min: VALIDATION_RULES.PASSWORD.MIN_LENGTH })) {
    return false;
  }
  const hasLetter = validator.matches(password, /[a-zA-Z]/);
  const hasNumber = validator.matches(password, /\d/);
  return hasLetter && hasNumber;
}

export function emailExists(email: string): boolean {
  return findUserByEmail(email) !== undefined;
}

// ==================== ControlUserId Validators ====================
export function isValidControlUserId(controlUserId: unknown): boolean {
  if (typeof controlUserId !== 'number') return false;
  if (!Number.isInteger(controlUserId)) return false;
  if (controlUserId <= 0) return false;
  if (controlUserId > 1_000_000) return false;
  return true;
}

export function isExistingControlUserId(controlUserId: number): boolean {
  return findUserById(controlUserId) !== undefined;
}

// ==================== Astronaut Validators ====================
export function isValidRankForCreate(rank: string): boolean {
  return (
    rank.length >= VALIDATION_RULES.RANK.MIN_LENGTH &&
    rank.length <= VALIDATION_RULES.RANK.MAX_LENGTH &&
    /^[a-zA-Z\-\s()']+$/.test(rank)
  );
}

export function isValidRankForUpdate(rank: string): boolean {
  return (
    rank.length >= VALIDATION_RULES.RANK.MIN_LENGTH &&
    rank.length <= VALIDATION_RULES.RANK.MAX_LENGTH &&
    /^[a-zA-Z\-\s']+$/.test(rank)
  );
}

// Legacy function - kept for backward compatibility
export function isValidRank(rank: string): boolean {
  return isValidRankForCreate(rank);
}

export function isValidAge(age: number): boolean {
  return age >= VALIDATION_RULES.AGE.MIN && age <= VALIDATION_RULES.AGE.MAX;
}

export function isValidWeight(weight: number): boolean {
  return weight > 0 && weight <= VALIDATION_RULES.WEIGHT.MAX;
}

export function isValidHeight(height: number): boolean {
  return height >= VALIDATION_RULES.HEIGHT.MIN && height <= VALIDATION_RULES.HEIGHT.MAX;
}

export function validateAstronautData(
  data: { nameFirst?: string; nameLast?: string; rank?: string; age?: number; weight?: number; height?: number },
  existingAstronautId?: number,
  isUpdate: boolean = false
): string | null {
  // Import ERROR_MESSAGES here to avoid circular dependency
  const { ERROR_MESSAGES } = require('./other');

  console.log('Validating astronaut data:', data);
  console.log('isUpdate flag:', isUpdate);

  // Handle undefined/null/missing fields safely
  if (data === null || data === undefined) {
    return ERROR_MESSAGES.NAME_FIRST_INVALID_LENGTH;
  }

  // Safe string conversion with proper undefined handling - more defensive
  const nameFirst = (data.nameFirst === undefined || data.nameFirst === null || data.nameFirst === 'undefined') ? '' : String(data.nameFirst);
  const nameLast = (data.nameLast === undefined || data.nameLast === null || data.nameLast === 'undefined') ? '' : String(data.nameLast);
  const rank = (data.rank === undefined || data.rank === null || data.rank === 'undefined') ? '' : String(data.rank);

  // Safe number conversion with proper undefined handling
  const age = (data.age === undefined || data.age === null) ? -1 : (typeof data.age === 'number' ? data.age : Number(data.age));
  const weight = (data.weight === undefined || data.weight === null) ? -1 : (typeof data.weight === 'number' ? data.weight : Number(data.weight));
  const height = (data.height === undefined || data.height === null) ? -1 : (typeof data.height === 'number' ? data.height : Number(data.height));

  // Validate nameFirst
  if (nameFirst.length < VALIDATION_RULES.NAME.MIN_LENGTH || nameFirst.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    console.log(`NameFirst validation failed: ${nameFirst.length} min: ${VALIDATION_RULES.NAME.MIN_LENGTH} max: ${VALIDATION_RULES.NAME.MAX_LENGTH}`);
    return ERROR_MESSAGES.NAME_FIRST_INVALID_LENGTH;
  }
  if (!isValidName(nameFirst)) {
    return ERROR_MESSAGES.NAME_FIRST_INVALID_CHARS;
  }

  // Validate nameLast
  if (nameLast.length < VALIDATION_RULES.NAME.MIN_LENGTH || nameLast.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return ERROR_MESSAGES.NAME_LAST_INVALID_LENGTH;
  }
  if (!isValidName(nameLast)) {
    return ERROR_MESSAGES.NAME_LAST_INVALID_CHARS;
  }

  // Validate rank with different rules for create vs update
  if (rank.length < VALIDATION_RULES.RANK.MIN_LENGTH || rank.length > VALIDATION_RULES.RANK.MAX_LENGTH) {
    return ERROR_MESSAGES.ASTRONAUT_RANK_INVALID_LENGTH;
  }

  console.log(`Rank validation - isUpdate: ${isUpdate} rank: ${rank}`);
  const rankValid = isUpdate ? isValidRankForUpdate(rank) : isValidRankForCreate(rank);
  console.log(`Rank validation result: ${rankValid}`);

  if (!rankValid) {
    return isUpdate ? ERROR_MESSAGES.ASTRONAUT_RANK_INVALID_CHARS_UPDATE : ERROR_MESSAGES.ASTRONAUT_RANK_INVALID_CHARS_CREATE;
  }

  // Validate age
  if (isNaN(age) || age < VALIDATION_RULES.AGE.MIN || age > VALIDATION_RULES.AGE.MAX) {
    return ERROR_MESSAGES.AGE_INVALID;
  }

  // Validate weight
  if (isNaN(weight) || weight <= 0 || weight > VALIDATION_RULES.WEIGHT.MAX) {
    return ERROR_MESSAGES.WEIGHT_INVALID;
  }

  // Validate height
  if (isNaN(height) || height < VALIDATION_RULES.HEIGHT.MIN || height > VALIDATION_RULES.HEIGHT.MAX) {
    return ERROR_MESSAGES.HEIGHT_INVALID;
  }

  // Check for duplicate astronaut name (excluding current astronaut if updating)
  try {
    const dataStore = getData();
    const duplicate = dataStore.astronauts.find((a) =>
      a.nameFirst.toLowerCase() === nameFirst.toLowerCase() &&
      a.nameLast.toLowerCase() === nameLast.toLowerCase() &&
      a.astronautId !== existingAstronautId
    );
    if (duplicate) {
      return ERROR_MESSAGES.ASTRONAUT_NAME_ALREADY_EXISTS;
    }
  } catch (error) {
    console.error('Error checking duplicate astronaut:', error);
    // If there's an error accessing data, we can still proceed with other validations
  }

  return null; // Valid
}

// ==================== Mission Validators ====================
export function isValidMissionName(name: string): boolean {
  // First check length
  if (!validator.isLength(name, { min: VALIDATION_RULES.MISSION_NAME.MIN_LENGTH, max: VALIDATION_RULES.MISSION_NAME.MAX_LENGTH })) {
    return false;
  }

  // Then check characters - only alphanumeric and spaces
  return validator.matches(name, /^[a-zA-Z0-9 ]+$/);
}

export function isValidMissionDescription(description: string): boolean {
  return validator.isLength(description, { max: VALIDATION_RULES.DESCRIPTION.MAX_LENGTH });
}

export function isValidMissionTarget(target: string): boolean {
  return validator.isLength(target, { max: VALIDATION_RULES.TARGET.MAX_LENGTH });
}

export function missionNameExistsForUser(
  ownerId: number,
  name: string,
  excludeId?: number
): boolean {
  const mission = findMissionByOwnerAndName(ownerId, name);
  if (mission && mission.missionId !== excludeId) {
    return true;
  }
  return false;
}

// ==================== Password History Management ====================
export function addPasswordToHistory(controlUserId: number, password: string): boolean {
  const user = findUserById(controlUserId);
  if (!user) {
    return false;
  }

  const updatedHistory = [...(user.passwordHistory || []), password];
  return updateUser(controlUserId, {
    passwordHistory: updatedHistory
  });
}

export function isPasswordReused(controlUserId: number, password: string): boolean {
  const user = findUserById(controlUserId);
  if (!user || !user.passwordHistory) {
    return false;
  }
  return user.passwordHistory.includes(password);
}

export function incrementFailedLogins(controlUserId: number): boolean {
  const user = findUserById(controlUserId);
  if (!user) {
    return false;
  }
  return updateUser(controlUserId, {
    numFailedPasswordsSinceLastLogin: (user.numFailedPasswordsSinceLastLogin || 0) + 1
  });
}

export function resetFailedLogins(controlUserId: number): boolean {
  const user = findUserById(controlUserId);
  if (!user) {
    return false;
  }
  return updateUser(controlUserId, {
    numFailedPasswordsSinceLastLogin: 0
  });
}

export function incrementSuccessfulLogins(controlUserId: number): boolean {
  const user = findUserById(controlUserId);
  if (!user) {
    return false;
  }
  return updateUser(controlUserId, {
    numSuccessfulLogins: (user.numSuccessfulLogins || 0) + 1
  });
}

export function initializeUserLoginStats(controlUserId: number): boolean {
  const user = findUserById(controlUserId);
  if (!user) {
    return false;
  }
  return updateUser(controlUserId, {
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0
  });
}

export function canTransferMissionToUser(targetEmail: string, currentUserId: number): string | null {
  const targetUser = findUserByEmail(targetEmail);
  if (!targetUser) {
    return 'EMAIL_NOT_EXIST';
  }

  if (targetUser.controlUserId === currentUserId) {
    return 'CANNOT_TRANSFER_TO_SELF';
  }

  return null;
}

export function validateMissionTransfer(missionId: number, targetEmail: string, currentUserId: number): string | null {
  const mission = findMissionById(missionId);
  if (!mission) {
    return 'MISSION_ID_INVALID';
  }

  if (mission.ownerId !== currentUserId) {
    return 'NOT_OWNER';
  }

  return canTransferMissionToUser(targetEmail, currentUserId);
}

export function getControlUserIdFromSession(controlUserSessionId: string | undefined): number | null {
  if (!controlUserSessionId) {
    return null;
  }
  return validateSession(controlUserSessionId);
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}
