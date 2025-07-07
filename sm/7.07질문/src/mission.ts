import validator from 'validator';
import { getData, addMission, updateMission, deleteMission, findMissionByOwnerAndName, findUserByEmail, transferMission, assignAstronautToMission, unassignAstronautFromMission, validateSession, generateMissionId, getCurrentTimestamp, findAstronautById, Mission } from './dataStore';

// Import error messages from centralized location
import { ERROR_MESSAGES, VALIDATION_RULES } from './other';
import { isValidMissionDescription, isValidMissionTarget, isValidEmail } from './helper';

/**
 * Get all missions for user
 */
export function adminMissionList(controlUserSessionId: string) {
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  const data = getData();
  const userMissions = data.missions.filter(m => m.controlUserId === controlUserId);
  const missions = userMissions.map(mission => ({
    missionId: mission.missionId,
    name: mission.name
  }));

  return { missions };
}

/**
 * Create new mission
 */
export function adminMissionCreate(controlUserSessionId: string, name: string, description: string, target: string): { missionId?: number; error?: string } {
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  // Validate mission name - check length first
  if (!validator.isLength(name, { min: VALIDATION_RULES.MISSION_NAME.MIN_LENGTH, max: VALIDATION_RULES.MISSION_NAME.MAX_LENGTH })) {
    return { error: ERROR_MESSAGES.NAME_INVALID_LENGTH };
  }

  // Then check characters - only alphanumeric and spaces, but not only spaces
  if (!validator.matches(name, /^[a-zA-Z0-9 ]+$/) || name.trim().length === 0) {
    return { error: ERROR_MESSAGES.NAME_INVALID_CHARACTERS };
  }

  if (!isValidMissionDescription(description)) {
    return { error: ERROR_MESSAGES.DESCRIPTION_TOO_LONG };
  }

  if (!isValidMissionTarget(target)) {
    return { error: ERROR_MESSAGES.TARGET_TOO_LONG };
  }

  const data = getData();

  // Check for duplicate name
  const existingMission = data.missions.find(m =>
    m.name === name && m.controlUserId === controlUserId
  );
  if (existingMission) {
    return { error: ERROR_MESSAGES.NAME_ALREADY_USED };
  }

  // Create mission
  const missionId = generateMissionId();
  const currentTime = getCurrentTimestamp();

  const newMission: Mission = {
    missionId,
    name,
    description,
    target,
    ownerId: controlUserId,
    controlUserId,
    timeCreated: currentTime,
    timeLastEdited: currentTime,
    assignedAstronauts: []
  };

  addMission(newMission);
  return { missionId };
}

/**
 * Remove mission
 */
export function adminMissionRemove(controlUserSessionId: string, missionId: number) {
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  const data = getData();
  const missionIndex = data.missions.findIndex(
    m => m.missionId === missionId && m.ownerId === controlUserId
  );

  if (missionIndex === -1) {
    return { error: ERROR_MESSAGES.MISSION_NOT_OWNED_OR_NOT_EXIST_SINGLE };
  }

  const mission = data.missions[missionIndex];
  if (!mission) {
    return { error: ERROR_MESSAGES.MISSION_NOT_OWNED_OR_NOT_EXIST_SINGLE };
  }
  if (mission.assignedAstronauts && mission.assignedAstronauts.length > 0) {
    return { error: ERROR_MESSAGES.MISSION_HAS_ASTRONAUTS };
  }

  // Hard delete - 배열에서 완전 제거
  deleteMission(missionId);
  return {};
}

/**
 * Get mission info
 */
export function adminMissionInfo(controlUserSessionId: string, missionId: number) {
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  const data = getData();
  const mission = data.missions.find(
    m => m.missionId === missionId && m.ownerId === controlUserId
  );

  if (!mission) {
    return { error: ERROR_MESSAGES.NOT_OWNER };
  }

  // assignedAstronauts 배열을 올바른 형식으로 변환
  const assignedAstronauts = (mission.assignedAstronauts || [])
    .map(astronautId => {
      const astronaut = data.astronauts.find(a => a.astronautId === astronautId);
      return astronaut
        ? {
            astronautId: astronaut.astronautId,
            name: `${astronaut.rank} ${astronaut.nameFirst} ${astronaut.nameLast}`
          }
        : null;
    })
    .filter(Boolean);

  return {
    missionId: mission.missionId,
    name: mission.name,
    timeCreated: mission.timeCreated,
    timeLastEdited: mission.timeLastEdited,
    description: mission.description,
    target: mission.target,
    assignedAstronauts
  };
}

/**
 * Update mission name
 */
export function adminMissionNameUpdate(controlUserSessionId: string, missionId: number, name: string): { error?: string } {
  // Validate session
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  // Validate mission name - check length first
  if (!validator.isLength(name, { min: VALIDATION_RULES.MISSION_NAME.MIN_LENGTH, max: VALIDATION_RULES.MISSION_NAME.MAX_LENGTH })) {
    return { error: ERROR_MESSAGES.NAME_INVALID_LENGTH };
  }

  // Then check characters - only alphanumeric and spaces, but not only spaces
  if (!validator.matches(name, /^[a-zA-Z0-9 ]+$/) || name.trim().length === 0) {
    return { error: ERROR_MESSAGES.NAME_INVALID_CHARACTERS };
  }

  const data = getData();
  const mission = data.missions.find(
    m => m.missionId === missionId && m.ownerId === controlUserId
  );

  if (!mission) {
    return { error: ERROR_MESSAGES.NOT_OWNER };
  }

  // Check for duplicate name (excluding current mission)
  const duplicate = data.missions.find(m =>
    m.missionId !== mission.missionId &&
    m.ownerId === controlUserId &&
    m.name === name
  );

  if (duplicate) {
    return { error: ERROR_MESSAGES.NAME_ALREADY_USED };
  }

  // Update mission
  updateMission(missionId, {
    name,
    timeLastEdited: getCurrentTimestamp()
  });

  return {};
}

/**
 * Update mission description
 */
export function adminMissionDescriptionUpdate(controlUserSessionId: string, missionId: number, description: string): { error?: string } {
  // Validate session
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  // Use centralized validation function
  if (!isValidMissionDescription(description)) {
    return { error: ERROR_MESSAGES.DESCRIPTION_TOO_LONG };
  }

  const data = getData();
  const mission = data.missions.find(
    m => m.missionId === missionId && m.ownerId === controlUserId
  );

  if (!mission) {
    return { error: ERROR_MESSAGES.NOT_OWNER };
  }

  // Update mission
  updateMission(missionId, {
    description,
    timeLastEdited: getCurrentTimestamp()
  });

  return {};
}

/**
 * Update mission target
 */
export function adminMissionTargetUpdate(controlUserSessionId: string, missionId: number, target: string): { error?: string } {
  // Validate session
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  // Use centralized validation function
  if (!isValidMissionTarget(target)) {
    return { error: ERROR_MESSAGES.TARGET_TOO_LONG };
  }

  const data = getData();
  const mission = data.missions.find(
    m => m.missionId === missionId && m.ownerId === controlUserId
  );

  if (!mission) {
    return { error: ERROR_MESSAGES.NOT_OWNER };
  }

  // Update mission
  updateMission(missionId, {
    target,
    timeLastEdited: getCurrentTimestamp()
  });

  return {};
}

/**
 * Transfer mission to another user
 */
export function adminMissionTransfer(controlUserSessionId: string, missionId: number, userEmail: string): { error?: string } {
  // Validate session
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  const data = getData();
  const mission = data.missions.find(
    m => m.missionId === missionId && m.ownerId === controlUserId
  );

  if (!mission) {
    return { error: ERROR_MESSAGES.NOT_OWNER };
  }

  // Validate email format first
  if (!isValidEmail(userEmail)) {
    return { error: ERROR_MESSAGES.EMAIL_INVALID };
  }

  // Find target user
  const targetUser = findUserByEmail(userEmail);
  if (!targetUser) {
    return { error: 'userEmail is not a real control user.' };
  }

  // Check if target user is the same as current user
  if (targetUser.controlUserId === controlUserId) {
    return { error: 'userEmail is the current logged in control user.' };
  }

  // Check if target user already has a mission with the same name
  const duplicate = findMissionByOwnerAndName(targetUser.controlUserId, mission.name);
  if (duplicate) {
    return { error: 'missionId refers to a space mission that has a name that is already used by the target user.' };
  }

  // Transfer mission
  transferMission(missionId, targetUser.controlUserId);

  return {};
}

/**
 * Assign astronaut to mission
 */
export function adminMissionAssignAstronaut(controlUserSessionId: string, missionId: number, astronautId: number): { error?: string } {
  // Validate session
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  const data = getData();
  const mission = data.missions.find(
    m => m.missionId === missionId && m.ownerId === controlUserId
  );

  if (!mission) {
    return { error: ERROR_MESSAGES.NOT_OWNER };
  }

  const astronaut = findAstronautById(astronautId);
  if (!astronaut) {
    return { error: ERROR_MESSAGES.ASTRONAUT_ID_INVALID };
  }

  // Check if astronaut is already assigned to this mission
  if (mission.assignedAstronauts.includes(astronautId)) {
    return { error: ERROR_MESSAGES.ASTRONAUT_ALREADY_ASSIGNED };
  }

  // Check if astronaut is assigned to another mission
  const otherMission = data.missions.find(m =>
    m.missionId !== missionId && m.assignedAstronauts && m.assignedAstronauts.includes(astronautId)
  );
  if (otherMission) {
    return { error: ERROR_MESSAGES.ASTRONAUT_ALREADY_ASSIGNED };
  }

  // Assign astronaut to mission
  assignAstronautToMission(astronautId, missionId);

  return {};
}

/**
 * Unassign astronaut from mission
 */
export function adminMissionUnassignAstronaut(controlUserSessionId: string, missionId: number, astronautId: number): { error?: string } {
  // Validate session
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  const data = getData();
  const mission = data.missions.find(
    m => m.missionId === missionId && m.ownerId === controlUserId
  );

  if (!mission) {
    return { error: ERROR_MESSAGES.NOT_OWNER };
  }

  const astronaut = findAstronautById(astronautId);
  if (!astronaut) {
    return { error: ERROR_MESSAGES.ASTRONAUT_ID_INVALID };
  }

  // Check if astronaut is assigned to this mission
  if (!mission.assignedAstronauts.includes(astronautId)) {
    return { error: ERROR_MESSAGES.ASTRONAUT_NOT_ASSIGNED };
  }

  // Unassign astronaut from mission
  unassignAstronautFromMission(astronautId, missionId);

  return {};
}
