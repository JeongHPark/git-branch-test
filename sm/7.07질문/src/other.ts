export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20
  },
  MISSION_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30
  },
  PASSWORD: {
    MIN_LENGTH: 8
  },
  DESCRIPTION: {
    MAX_LENGTH: 400
  },
  TARGET: {
    MAX_LENGTH: 100
  },
  RANK: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 50
  },
  AGE: {
    MIN: 20,
    MAX: 60
  },
  WEIGHT: {
    MAX: 100
  },
  HEIGHT: {
    MIN: 150,
    MAX: 200
  }
};

// ==================== Error Message Constants ====================
export const ERROR_MESSAGES = {
  // ==================== Auth-related ====================
  EMAIL_IN_USE: 'Email address is used by another user',
  EMAIL_INVALID: 'Email does not satisfy validator.isEmail',
  EMAIL_NOT_EXIST: 'Email address does not exist',
  EMAIL_USED_BY_OTHER: 'Email is currently used by another user (excluding the current authorised user)',

  // ==================== Password-related ====================
  PASSWORD_INCORRECT: 'Password is not correct for the given email',
  PASSWORD_TOO_SHORT: 'Password is less than 8 characters',
  PASSWORD_INVALID_FORMAT: 'Password does not contain at least one number and at least one letter',
  OLD_PASSWORD_INCORRECT: 'Old Password is not the correct old password',
  OLD_PASSWORD_SAME: 'Old Password and New Password match exactly',
  NEW_PASSWORD_LENGTH: 'New Password is less than 8 characters',
  NEW_PASSWORD_FORMAT: 'New Password does not contain at least one number and at least one letter',
  NEW_PASSWORD_USED: 'New Password has already been used before by this user',

  // ==================== Name-related ====================
  NAME_FIRST_INVALID: 'NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes',
  NAME_LAST_INVALID: 'NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes',
  NAME_FIRST_LENGTH: 'NameFirst is less than 2 characters or more than 20 characters',
  NAME_LAST_LENGTH: 'NameLast is less than 2 characters or more than 20 characters',
  NAME_FIRST_INVALID_LENGTH: 'NameFirst is less than 2 characters or more than 20 characters',
  NAME_LAST_INVALID_LENGTH: 'NameLast is less than 2 characters or more than 20 characters',
  NAME_FIRST_INVALID_CHARACTERS: 'NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes',
  NAME_LAST_INVALID_CHARACTERS: 'NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes',
  NAME_FIRST_INVALID_CHARS: 'NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes',
  NAME_LAST_INVALID_CHARS: 'NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes',

  // ==================== Session-related ====================
  SESSION_INVALID: 'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',

  // ==================== Mission-related ====================
  MISSION_ID_INVALID: 'MissionId is not a valid positive integer',
  NAME_INVALID_CHARACTERS: 'Name contains invalid characters. Valid characters are alphanumeric and spaces',
  NAME_INVALID_LENGTH: 'Name is either less than 3 characters long or more than 30 characters long',
  NAME_ALREADY_USED: 'Name is already used by the current logged in user for another quiz',
  DESCRIPTION_TOO_LONG: 'Description is more than 400 characters in length (note: empty strings are OK)',
  TARGET_TOO_LONG: 'Target is more than 100 characters in length (note: empty strings are OK)',
  MISSION_NOT_OWNED_OR_NOT_EXIST_SINGLE: 'Valid controlUserSessionId is provided, but the control user is not an owner of this mission or the specified missionId does not exist',
  MISSION_NOT_OWNED_OR_NOT_EXIST: 'Valid controlUserSessionId is provided, but the control user is not an owner of this mission or the specified missionId does not exist',
  MISSION_HAS_ASTRONAUTS: 'Astronauts have been assigned to this mission.',
  MISSION_NOT_OWNED: "Valid controlUserSessionId is provided, but control user is not an owner of this space mission or the space mission doesn't exist",
  NOT_OWNER: 'Valid controlUserSessionId is provided, but the control user is not an owner of this mission or the specified missionId does not exist',

  // ==================== Mission Transfer-related ====================
  USER_EMAIL_NOT_REAL: 'userEmail is not a real control user',
  USER_EMAIL_IS_CURRENT_USER: 'userEmail is the current logged in control user',
  MISSION_NAME_ALREADY_USED_BY_TARGET: 'missionId refers to a space mission that has a name that is already used by the target user',

  // ==================== Astronaut-related ====================
  ASTRONAUT_ID_INVALID: 'astronautid is invalid',
  ASTRONAUT_ALREADY_ASSIGNED: 'The astronaut is already assigned to another mission',
  ASTRONAUT_NOT_ASSIGNED: 'The astronaut not assigned to this space mission.',
  ASTRONAUT_NAME_ALREADY_EXISTS: 'Another Astronaut already exists with the same nameFirst and nameLast',
  ASTRONAUT_CURRENTLY_ASSIGNED: 'The astronaut is currently assigned to a mission',
  ASTRONAUT_RANK_INVALID_LENGTH: 'Rank is less than 5 characters or more than 50 characters',
  ASTRONAUT_RANK_INVALID_CHARS_CREATE: 'Rank contains characters other than lowercase letters, uppercase letters, spaces, hyphens, round brackets or apostrophes',
  ASTRONAUT_RANK_INVALID_CHARS_UPDATE: 'Rank contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes',
  ASTRONAUT_RANK_INVALID_CHARS: 'Rank contains characters other than lowercase letters, uppercase letters, spaces, hyphens, round brackets or apostrophes',
  ASTRONAUT_AGE_INVALID: 'Age < 20 or > 60',
  ASTRONAUT_WEIGHT_INVALID: 'Weight (measured in kgs at Earth gravity) > 100',
  ASTRONAUT_HEIGHT_INVALID: 'Height (measured in cms) < 150 or > 200',
  AGE_INVALID: 'Age < 20 or > 60',
  WEIGHT_INVALID: 'Weight (measured in kgs at Earth gravity) > 100',
  HEIGHT_INVALID: 'Height (measured in cms) < 150 or > 200',
};

// ==================== Error Message Functions (dot notation 제거용) ====================
export function getSessionInvalidMessage(): string {
  return ERROR_MESSAGES.SESSION_INVALID;
}

export function getEmailInvalidMessage(): string {
  return ERROR_MESSAGES.EMAIL_INVALID;
}

export function getEmailInUseMessage(): string {
  return ERROR_MESSAGES.EMAIL_IN_USE;
}

export function getEmailNotExistMessage(): string {
  return ERROR_MESSAGES.EMAIL_NOT_EXIST;
}

export function getEmailUsedByOtherMessage(): string {
  return ERROR_MESSAGES.EMAIL_USED_BY_OTHER;
}

export function getPasswordIncorrectMessage(): string {
  return ERROR_MESSAGES.PASSWORD_INCORRECT;
}

export function getPasswordTooShortMessage(): string {
  return ERROR_MESSAGES.PASSWORD_TOO_SHORT;
}

export function getPasswordInvalidFormatMessage(): string {
  return ERROR_MESSAGES.PASSWORD_INVALID_FORMAT;
}

export function getOldPasswordIncorrectMessage(): string {
  return ERROR_MESSAGES.OLD_PASSWORD_INCORRECT;
}

export function getOldPasswordSameMessage(): string {
  return ERROR_MESSAGES.OLD_PASSWORD_SAME;
}

export function getNewPasswordLengthMessage(): string {
  return ERROR_MESSAGES.NEW_PASSWORD_LENGTH;
}

export function getNewPasswordFormatMessage(): string {
  return ERROR_MESSAGES.NEW_PASSWORD_FORMAT;
}

export function getNewPasswordUsedMessage(): string {
  return ERROR_MESSAGES.NEW_PASSWORD_USED;
}

export function getNameFirstInvalidMessage(): string {
  return ERROR_MESSAGES.NAME_FIRST_INVALID;
}

export function getNameLastInvalidMessage(): string {
  return ERROR_MESSAGES.NAME_LAST_INVALID;
}

export function getNameFirstLengthMessage(): string {
  return ERROR_MESSAGES.NAME_FIRST_LENGTH;
}

export function getNameLastLengthMessage(): string {
  return ERROR_MESSAGES.NAME_LAST_LENGTH;
}

export function getNameFirstInvalidLengthMessage(): string {
  return ERROR_MESSAGES.NAME_FIRST_INVALID_LENGTH;
}

export function getNameLastInvalidLengthMessage(): string {
  return ERROR_MESSAGES.NAME_LAST_INVALID_LENGTH;
}

export function getNameFirstInvalidCharactersMessage(): string {
  return ERROR_MESSAGES.NAME_FIRST_INVALID_CHARACTERS;
}

export function getNameLastInvalidCharactersMessage(): string {
  return ERROR_MESSAGES.NAME_LAST_INVALID_CHARACTERS;
}

export function getNameFirstInvalidCharsMessage(): string {
  return ERROR_MESSAGES.NAME_FIRST_INVALID_CHARS;
}

export function getNameLastInvalidCharsMessage(): string {
  return ERROR_MESSAGES.NAME_LAST_INVALID_CHARS;
}

export function getMissionIdInvalidMessage(): string {
  return ERROR_MESSAGES.MISSION_ID_INVALID;
}

export function getNameInvalidCharactersMessage(): string {
  return ERROR_MESSAGES.NAME_INVALID_CHARACTERS;
}

export function getNameInvalidLengthMessage(): string {
  return ERROR_MESSAGES.NAME_INVALID_LENGTH;
}

export function getNameAlreadyUsedMessage(): string {
  return ERROR_MESSAGES.NAME_ALREADY_USED;
}

export function getDescriptionTooLongMessage(): string {
  return ERROR_MESSAGES.DESCRIPTION_TOO_LONG;
}

export function getTargetTooLongMessage(): string {
  return ERROR_MESSAGES.TARGET_TOO_LONG;
}

export function getMissionNotOwnedOrNotExistSingleMessage(): string {
  return ERROR_MESSAGES.MISSION_NOT_OWNED_OR_NOT_EXIST_SINGLE;
}

export function getMissionNotOwnedOrNotExistMessage(): string {
  return ERROR_MESSAGES.MISSION_NOT_OWNED_OR_NOT_EXIST;
}

export function getMissionHasAstronautsMessage(): string {
  return ERROR_MESSAGES.MISSION_HAS_ASTRONAUTS;
}

export function getMissionNotOwnedMessage(): string {
  return ERROR_MESSAGES.MISSION_NOT_OWNED;
}

export function getNotOwnerMessage(): string {
  return ERROR_MESSAGES.NOT_OWNER;
}

export function getUserEmailNotRealMessage(): string {
  return ERROR_MESSAGES.USER_EMAIL_NOT_REAL;
}

export function getUserEmailIsCurrentUserMessage(): string {
  return ERROR_MESSAGES.USER_EMAIL_IS_CURRENT_USER;
}

export function getMissionNameAlreadyUsedByTargetMessage(): string {
  return ERROR_MESSAGES.MISSION_NAME_ALREADY_USED_BY_TARGET;
}

export function getAstronautIdInvalidMessage(): string {
  return ERROR_MESSAGES.ASTRONAUT_ID_INVALID;
}

export function getAstronautAlreadyAssignedMessage(): string {
  return ERROR_MESSAGES.ASTRONAUT_ALREADY_ASSIGNED;
}

export function getAstronautNotAssignedMessage(): string {
  return ERROR_MESSAGES.ASTRONAUT_NOT_ASSIGNED;
}

export function getAstronautNameAlreadyExistsMessage(): string {
  return ERROR_MESSAGES.ASTRONAUT_NAME_ALREADY_EXISTS;
}

export function getAstronautCurrentlyAssignedMessage(): string {
  return ERROR_MESSAGES.ASTRONAUT_CURRENTLY_ASSIGNED;
}

export function getAstronautRankInvalidLengthMessage(): string {
  return ERROR_MESSAGES.ASTRONAUT_RANK_INVALID_LENGTH;
}

export function getAstronautRankInvalidCharsCreateMessage(): string {
  return ERROR_MESSAGES.ASTRONAUT_RANK_INVALID_CHARS_CREATE;
}

export function getAstronautRankInvalidCharsUpdateMessage(): string {
  return ERROR_MESSAGES.ASTRONAUT_RANK_INVALID_CHARS_UPDATE;
}

export function getAstronautRankInvalidCharsMessage(): string {
  return ERROR_MESSAGES.ASTRONAUT_RANK_INVALID_CHARS;
}

export function getAstronautAgeInvalidMessage(): string {
  return ERROR_MESSAGES.ASTRONAUT_AGE_INVALID;
}

export function getAstronautWeightInvalidMessage(): string {
  return ERROR_MESSAGES.ASTRONAUT_WEIGHT_INVALID;
}

export function getAstronautHeightInvalidMessage(): string {
  return ERROR_MESSAGES.ASTRONAUT_HEIGHT_INVALID;
}

export function getAgeInvalidMessage(): string {
  return ERROR_MESSAGES.AGE_INVALID;
}

export function getWeightInvalidMessage(): string {
  return ERROR_MESSAGES.WEIGHT_INVALID;
}

export function getHeightInvalidMessage(): string {
  return ERROR_MESSAGES.HEIGHT_INVALID;
}

// ==================== Validation Rules Functions (dot notation 제거용) ====================
export function getNameMinLength(): number {
  return VALIDATION_RULES.NAME.MIN_LENGTH;
}

export function getNameMaxLength(): number {
  return VALIDATION_RULES.NAME.MAX_LENGTH;
}

export function getMissionNameMinLength(): number {
  return VALIDATION_RULES.MISSION_NAME.MIN_LENGTH;
}

export function getMissionNameMaxLength(): number {
  return VALIDATION_RULES.MISSION_NAME.MAX_LENGTH;
}

export function getPasswordMinLength(): number {
  return VALIDATION_RULES.PASSWORD.MIN_LENGTH;
}

export function getDescriptionMaxLength(): number {
  return VALIDATION_RULES.DESCRIPTION.MAX_LENGTH;
}

export function getTargetMaxLength(): number {
  return VALIDATION_RULES.TARGET.MAX_LENGTH;
}

export function getRankMinLength(): number {
  return VALIDATION_RULES.RANK.MIN_LENGTH;
}

export function getRankMaxLength(): number {
  return VALIDATION_RULES.RANK.MAX_LENGTH;
}

export function getAgeMin(): number {
  return VALIDATION_RULES.AGE.MIN;
}

export function getAgeMax(): number {
  return VALIDATION_RULES.AGE.MAX;
}

export function getWeightMax(): number {
  return VALIDATION_RULES.WEIGHT.MAX;
}

export function getHeightMin(): number {
  return VALIDATION_RULES.HEIGHT.MIN;
}

export function getHeightMax(): number {
  return VALIDATION_RULES.HEIGHT.MAX;
}
