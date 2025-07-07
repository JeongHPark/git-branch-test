// Import error messages from centralized location
import { ERROR_MESSAGES } from './other';

// Import validation functions from helper
import { validateAstronautData } from './helper';

// ==================== Data Storage (Array-based) ====================
// Using centralized dataStore instead of local arrays

// Import dataStore functions
import { validateSession, getData, addAstronaut, updateAstronaut, deleteAstronaut, generateAstronautId, getCurrentTimestamp } from './dataStore';

function astronautExists(nameFirst: string, nameLast: string, excludeId?: number): boolean {
  const data = getData();
  return data.astronauts.some(a =>
    a.nameFirst.toLowerCase() === nameFirst.toLowerCase() &&
    a.nameLast.toLowerCase() === nameLast.toLowerCase() &&
    a.astronautId !== excludeId
  );
}

// ==================== API Functions ====================

/**
 * GET /v1/admin/astronaut/pool
 * Get current astronaut pool
 */
export function adminAstronautPool(controlUserSessionId: string): { astronauts: Array<{ astronautId: number; name: string; assigned: boolean; }> } | { error: string } {
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  const data = getData();
  const astronautList = data.astronauts.map(a => {
    // Check if astronaut is assigned to any mission
    const isAssigned = data.missions.some(m =>
      m.assignedAstronauts && m.assignedAstronauts.includes(a.astronautId)
    );

    return {
      astronautId: a.astronautId,
      name: `${a.rank} ${a.nameFirst} ${a.nameLast}`,
      assigned: isAssigned
    };
  });

  return { astronauts: astronautList };
}

/**
 * POST /v1/admin/astronaut
 * Add new astronaut
 */
export function adminAstronautCreate(
  controlUserSessionId: string,
  nameFirst: string,
  nameLast: string,
  rank: string,
  age: number,
  weight: number,
  height: number
): { astronautId: number } | { error: string } {
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  // Check for duplicate astronaut name first
  if (astronautExists(nameFirst, nameLast)) {
    return { error: ERROR_MESSAGES.ASTRONAUT_NAME_ALREADY_EXISTS };
  }

  // Use centralized validation function
  const validationError = validateAstronautData({
    nameFirst,
    nameLast,
    rank,
    age,
    weight,
    height
  });

  if (validationError) {
    return { error: validationError };
  }

  // Create new astronaut using dataStore
  const astronautId = generateAstronautId();
  const currentTime = getCurrentTimestamp();

  const newAstronaut = {
    astronautId,
    nameFirst,
    nameLast,
    rank,
    age,
    weight,
    height,
    timeAdded: currentTime,
    timeLastEdited: currentTime
  };

  addAstronaut(newAstronaut);
  return { astronautId };
}

/**
 * GET /v1/admin/astronaut/{astronautid}
 * Get astronaut information
 */
export function adminAstronautInfo(
  controlUserSessionId: string,
  astronautId: number
): {
  astronautId: number;
  designation: string;
  timeAdded: number;
  timeLastEdited: number;
  age: number;
  weight: number;
  height: number;
  assignedMission: { missionId: number; objective: string } | null;
} | { error: string } {
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  const data = getData();
  const astronaut = data.astronauts.find(a => a.astronautId === astronautId);
  if (!astronaut) {
    return { error: ERROR_MESSAGES.ASTRONAUT_ID_INVALID };
  }

  // Check if astronaut is assigned to any mission
  const assignedToMission = data.missions.find(m =>
    m.assignedAstronauts && m.assignedAstronauts.includes(astronautId)
  );

  const result: {
    astronautId: number;
    designation: string;
    timeAdded: number;
    timeLastEdited: number;
    age: number;
    weight: number;
    height: number;
    assignedMission: { missionId: number; objective: string } | null;
  } = {
    astronautId: astronaut.astronautId,
    designation: `${astronaut.rank} ${astronaut.nameFirst} ${astronaut.nameLast}`,
    timeAdded: astronaut.timeAdded,
    timeLastEdited: astronaut.timeLastEdited,
    age: astronaut.age,
    weight: astronaut.weight,
    height: astronaut.height,
    assignedMission: assignedToMission
      ? {
          missionId: assignedToMission.missionId,
          objective: `[${assignedToMission.target}] ${assignedToMission.name}`
        }
      : null
  };

  return result;
}

/**
 * PUT /v1/admin/astronaut/{astronautid}
 * Update astronaut information
 */
export function adminAstronautUpdate(
  controlUserSessionId: string,
  astronautId: number,
  nameFirst: string,
  nameLast: string,
  rank: string,
  age: number,
  weight: number,
  height: number
): Record<string, never> | { error: string } {
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  const data = getData();
  const astronautIndex = data.astronauts.findIndex(a => a.astronautId === astronautId);
  if (astronautIndex === -1) {
    return { error: ERROR_MESSAGES.ASTRONAUT_ID_INVALID };
  }

  // Check for duplicate astronaut name first
  if (astronautExists(nameFirst, nameLast, astronautId)) {
    return { error: ERROR_MESSAGES.ASTRONAUT_NAME_ALREADY_EXISTS };
  }

  // Validate all fields using centralized validation
  const validationError = validateAstronautData({
    nameFirst,
    nameLast,
    rank,
    age,
    weight,
    height
  }, astronautId, true);

  if (validationError) {
    return { error: validationError };
  }

  // Update astronaut using dataStore
  const currentTime = getCurrentTimestamp();
  const updatedAstronaut = {
    astronautId,
    nameFirst,
    nameLast,
    rank,
    age,
    weight,
    height,
    timeAdded: data.astronauts[astronautIndex].timeAdded,
    timeLastEdited: currentTime
  };

  updateAstronaut(astronautId, updatedAstronaut);
  return {};
}

/**
 * DELETE /v1/admin/astronaut/{astronautid}
 * Remove astronaut
 */
export function adminAstronautRemove(
  controlUserSessionId: string,
  astronautId: number
): Record<string, never> | { error: string } {
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    return { error: ERROR_MESSAGES.SESSION_INVALID };
  }

  const data = getData();
  const astronautIndex = data.astronauts.findIndex(a => a.astronautId === astronautId);
  if (astronautIndex === -1) {
    return { error: ERROR_MESSAGES.ASTRONAUT_ID_INVALID };
  }

  // Check if astronaut is assigned to any mission
  const isAssigned = data.missions.some(m =>
    m.assignedAstronauts && m.assignedAstronauts.includes(astronautId)
  );

  if (isAssigned) {
    return { error: ERROR_MESSAGES.ASTRONAUT_CURRENTLY_ASSIGNED };
  }

  // Remove astronaut using dataStore
  deleteAstronaut(astronautId);
  return {};
}

/**
 * Clear all data
 */
export function clear(): Record<string, never> {
  const data = getData();
  data.astronauts.splice(0, data.astronauts.length);
  data.missions.splice(0, data.missions.length);
  data.users.splice(0, data.users.length);
  data.sessions.splice(0, data.sessions.length);
  return {};
}
