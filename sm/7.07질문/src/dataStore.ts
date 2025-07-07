// dataStore.ts - Hybrid Version (Memory + Auto Persistence)

import fs from 'fs';
import path from 'path';

// ==================== Type Definitions ====================
export interface User {
  controlUserId: number;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  passwordHistory: string[];
}

export interface Session {
  controlUserSessionId: string;
  controlUserId: number;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

export interface Mission {
  missionId: number;
  name: string;
  description: string;
  target: string;
  controlUserId: number;
  ownerId: number;
  timeCreated: number;
  timeLastEdited: number;
  assignedAstronauts: number[];
}

export interface Astronaut {
  astronautId: number;
  nameFirst: string;
  nameLast: string;
  rank: string;
  age: number;
  weight: number;
  height: number;
  timeAdded: number;
  timeLastEdited: number;
  assignedMissionId?: number;
}

// ==================== Global Data & Counters ====================
interface DataStore {
  users: User[];
  missions: Mission[];
  astronauts: Astronaut[];
  sessions: Session[];
}

let data: DataStore = {
  users: [],
  missions: [],
  astronauts: [],
  sessions: [],
};

interface Counters {
  controlUserId: number;
  missionId: number;
  astronautId: number;
}

let counters: Counters = {
  controlUserId: 1,
  missionId: 1,
  astronautId: 1,
};

// ==================== File Configuration ====================
const DATA_FILE = './data/datastore.json';
const COUNTERS_FILE = './data/counters.json';

// Persistence enabled flag (controllable via environment variable)
const PERSISTENCE_ENABLED = process.env.DISABLE_PERSISTENCE !== 'true';

// ==================== Auto-Persistence Utils ====================
function ensureDataDirectory() {
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (error) {
    console.warn('Failed to create data directory:', (error as Error).message);
  }
}

function autoSave() {
  if (!PERSISTENCE_ENABLED) return;

  try {
    ensureDataDirectory();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    fs.writeFileSync(COUNTERS_FILE, JSON.stringify(counters, null, 2));
  } catch (error) {
    console.error('Auto-save failed:', (error as Error).message);
  }
}

function autoLoad() {
  if (!PERSISTENCE_ENABLED) return;

  try {
    if (fs.existsSync(DATA_FILE)) {
      const dataContent = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(dataContent);
    }

    if (fs.existsSync(COUNTERS_FILE)) {
      const countersContent = fs.readFileSync(COUNTERS_FILE, 'utf8');
      counters = JSON.parse(countersContent);
    }

    console.log('Data loaded from files successfully');
  } catch (error) {
    console.warn('Auto-load failed, using fresh data:', (error as Error).message);
  }
}

// ==================== Initialize on Import ====================
autoLoad(); // Auto-load data when module is imported

// ==================== Core Data Access ====================
export function getData() {
  return data;
}

// setData function removed - use individual functions instead

export function clear() {
  data = {
    users: [],
    missions: [],
    astronauts: [],
    sessions: [],
  };
  counters = {
    controlUserId: 1,
    missionId: 1,
    astronautId: 1,
  };
  autoSave(); // Auto-save
}

// ==================== Counter Management ====================
export function getCounters() {
  return { ...counters };
}

export function setCounters(newCounters: Counters) {
  counters = { ...newCounters };
  autoSave(); // Auto-save
}

export function resetCounters() {
  counters = {
    controlUserId: 1,
    missionId: 1,
    astronautId: 1,
  };
  autoSave(); // Auto-save
}

export function incrementCounter(type: keyof Counters) {
  if (type in counters) {
    counters[type]++;
    autoSave(); // Auto-save
  }
}

export function setCounter(type: keyof Counters, value: number) {
  if (type in counters) {
    counters[type] = value;
    autoSave(); // Auto-save
  }
}

// ==================== ID Generation ====================
export function generateControlUserId() {
  const id = counters.controlUserId++;
  autoSave(); // Auto-save
  return id;
}

export function generateMissionId() {
  const id = counters.missionId++;
  autoSave(); // Auto-save
  return id;
}

export function generateAstronautId() {
  const id = counters.astronautId++;
  autoSave(); // Auto-save
  return id;
}

export function generateSessionId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// ==================== User CRUD ====================
export function addUser(user: User) {
  data.users.push(user);
  autoSave(); // Auto-save
}

export function findUserByEmail(email: string): User | undefined {
  const data = getData();
  return data.users.find(user => user.email === email);
}

export function findUserById(controlUserId: number): User | undefined {
  const data = getData();
  return data.users.find(user => user.controlUserId === controlUserId);
}

export function updateUser(controlUserId: number, updates: Partial<User>) {
  const userIndex = data.users.findIndex(
    (user) => user.controlUserId === controlUserId
  );
  if (userIndex === -1) return false;

  data.users[userIndex] = { ...data.users[userIndex], ...updates };
  autoSave(); // Auto-save
  return true;
}

export function isEmailUsedByOther(email: string, excludeUserId: number): boolean {
  const data = getData();
  return data.users.some(user => user.email === email && user.controlUserId !== excludeUserId);
}

// ==================== Session CRUD & Management ====================
export function addSession(session: Session): void {
  const data = getData();
  data.sessions.push(session);
  autoSave(); // Auto-save
}

export function findSessionById(controlUserSessionId: string): Session | undefined {
  return data.sessions.find((session) => session.controlUserSessionId === controlUserSessionId);
}

export function removeSession(controlUserSessionId: string): boolean {
  const index = data.sessions.findIndex(
    (session) => session.controlUserSessionId === controlUserSessionId
  );
  if (index === -1) return false;

  data.sessions.splice(index, 1);
  autoSave(); // Auto-save
  return true;
}

// ==================== Core Session Functions (Swagger Required) ====================
export function createSession(controlUserId: number, expirationHours = 2): string {
  const now = getCurrentTimestamp();
  const session = {
    controlUserSessionId: generateSessionId(),
    controlUserId: controlUserId,
    createdAt: now,
    expiresAt: now + expirationHours * 3600,
    lastActivity: now,
  };

  addSession(session);
  return session.controlUserSessionId;
}

export function validateSession(controlUserSessionId: string): number | null {
  if (!controlUserSessionId) return null;

  const session = findSessionById(controlUserSessionId);
  if (!session) return null;

  // Check expiration
  if (isSessionExpired(controlUserSessionId)) {
    removeSession(controlUserSessionId);
    return null;
  }

  // Update activity
  session.lastActivity = getCurrentTimestamp();
  autoSave();

  return session.controlUserId;
}

export function invalidateSession(controlUserSessionId: string): boolean {
  return removeSession(controlUserSessionId);
}

export function invalidateAllSessions(controlUserId: number): number {
  const userSessions = data.sessions.filter(
    (session) => session.controlUserId === controlUserId
  );

  let removedCount = 0;
  userSessions.forEach((session) => {
    if (removeSession(session.controlUserSessionId)) {
      removedCount++;
    }
  });

  return removedCount;
}

// ==================== Session Validation Helpers ====================
export function isSessionExpired(controlUserSessionId: string): boolean {
  const session = findSessionById(controlUserSessionId);
  if (!session) return true;

  const now = getCurrentTimestamp();
  return session.expiresAt < now;
}

export function cleanupExpiredSessions(): number {
  const now = getCurrentTimestamp();
  const expiredSessions = data.sessions.filter(
    (session) => session.expiresAt < now
  );

  let cleanedCount = 0;
  expiredSessions.forEach((session) => {
    if (removeSession(session.controlUserSessionId)) {
      cleanedCount++;
    }
  });

  return cleanedCount;
}

// ==================== Mission CRUD ====================
export function addMission(mission: Mission): void {
  const data = getData();
  data.missions.push(mission);
  autoSave(); // Auto-save
}

export function findMissionById(missionId: number): Mission | undefined {
  const data = getData();
  return data.missions.find(mission => mission.missionId === missionId);
}

export function getMissionsByOwner(ownerId: number): Mission[] {
  const data = getData();
  return data.missions.filter(mission => mission.ownerId === ownerId);
}

export function findMissionByOwnerAndName(ownerId: number, name: string, excludeId?: number): Mission | undefined {
  const data = getData();
  return data.missions.find(mission =>
    mission.ownerId === ownerId &&
    mission.name === name &&
    (excludeId === undefined || mission.missionId !== excludeId)
  );
}

export function updateMission(missionId: number, updates: Partial<Mission>): boolean {
  const data = getData();
  const missionIndex = data.missions.findIndex(mission => mission.missionId === missionId);

  if (missionIndex === -1) {
    return false;
  }

  // Update the mission with the provided updates
  data.missions[missionIndex] = { ...data.missions[missionIndex], ...updates };
  autoSave(); // Auto-save
  return true;
}

export function deleteMission(missionId: number): boolean {
  const data = getData();
  const missionIndex = data.missions.findIndex(mission => mission.missionId === missionId);

  if (missionIndex === -1) {
    return false;
  }

  // Remove the mission from the array
  data.missions.splice(missionIndex, 1);
  autoSave(); // Auto-save
  return true;
}

export function isMissionOwnedBy(missionId: number, controlUserId: number): boolean {
  const data = getData();
  const mission = data.missions.find(mission => mission.missionId === missionId);
  return mission ? mission.ownerId === controlUserId : false;
}

// ==================== Astronaut CRUD ====================
export function addAstronaut(astronaut: Astronaut): void {
  const data = getData();
  data.astronauts.push(astronaut);
  autoSave(); // Auto-save
}

export function findAstronautById(astronautId: number): Astronaut | undefined {
  const data = getData();
  return data.astronauts.find(astronaut => astronaut.astronautId === astronautId);
}

export function findAstronautByName(nameFirst: string, nameLast: string, excludeId?: number): Astronaut | undefined {
  const data = getData();
  return data.astronauts.find(astronaut =>
    astronaut.nameFirst.toLowerCase() === nameFirst.toLowerCase() &&
    astronaut.nameLast.toLowerCase() === nameLast.toLowerCase() &&
    (excludeId === undefined || astronaut.astronautId !== excludeId)
  );
}

export function getAllAstronauts(): Astronaut[] {
  return data.astronauts;
}

export function updateAstronaut(astronautId: number, updates: Partial<Astronaut>): boolean {
  const data = getData();
  const astronautIndex = data.astronauts.findIndex(astronaut => astronaut.astronautId === astronautId);

  if (astronautIndex === -1) {
    return false;
  }

  // Update the astronaut with the provided updates
  data.astronauts[astronautIndex] = { ...data.astronauts[astronautIndex], ...updates };
  autoSave(); // Auto-save
  return true;
}

export function deleteAstronaut(astronautId: number): boolean {
  const data = getData();
  const astronautIndex = data.astronauts.findIndex(astronaut => astronaut.astronautId === astronautId);

  if (astronautIndex === -1) {
    return false;
  }

  // Remove the astronaut from the array
  data.astronauts.splice(astronautIndex, 1);
  autoSave(); // Auto-save
  return true;
}

// ==================== Mission-Astronaut Assignment ====================
export function assignAstronautToMission(astronautId: number, missionId: number): boolean {
  const data = getData();
  const astronaut = data.astronauts.find(a => a.astronautId === astronautId);
  const mission = data.missions.find(m => m.missionId === missionId);

  if (!astronaut || !mission) {
    return false;
  }

  // Check if astronaut is already assigned to this mission
  if (mission.assignedAstronauts.includes(astronautId)) {
    return false;
  }

  // Check if astronaut is already assigned to another mission
  const otherMission = data.missions.find(m =>
    m.missionId !== missionId && m.assignedAstronauts && m.assignedAstronauts.includes(astronautId)
  );
  if (otherMission) {
    return false;
  }

  // Add astronaut to mission
  mission.assignedAstronauts.push(astronautId);
  autoSave(); // Auto-save
  return true;
}

export function unassignAstronautFromMission(astronautId: number, missionId: number): boolean {
  const data = getData();
  const mission = data.missions.find(m => m.missionId === missionId);

  if (!mission) {
    return false;
  }

  // Find the astronaut in the mission's assigned astronauts
  const astronautIndex = mission.assignedAstronauts.indexOf(astronautId);
  if (astronautIndex === -1) {
    return false;
  }

  // Remove astronaut from mission
  mission.assignedAstronauts.splice(astronautIndex, 1);
  autoSave(); // Auto-save
  return true;
}

// ==================== Mission Transfer ====================
export function transferMission(missionId: number, newOwnerId: number): boolean {
  const data = getData();
  const mission = data.missions.find(m => m.missionId === missionId);

  if (!mission) {
    return false;
  }

  // Update both ownerId and controlUserId
  mission.ownerId = newOwnerId;
  mission.controlUserId = newOwnerId;
  mission.timeLastEdited = getCurrentTimestamp();
  autoSave(); // Auto-save
  return true;
}

// ==================== Deletion Checks ====================
export function canDeleteMission(missionId: number): boolean {
  const data = getData();
  const mission = data.missions.find(m => m.missionId === missionId);
  return mission ? mission.assignedAstronauts.length === 0 : false;
}

export function canDeleteAstronaut(astronautId: number): boolean {
  const data = getData();
  return !data.missions.some(mission => mission.assignedAstronauts.includes(astronautId));
}

// ==================== Utility Functions ====================
export function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

// ==================== Manual Persistence Controls ====================
export function forceSave() {
  autoSave();
}

export function forceReload() {
  autoLoad();
}

export function isPersistenceEnabled() {
  return PERSISTENCE_ENABLED;
}

// ==================== Legacy Session Functions (Compatibility) ====================
// Legacy functions removed - using main functions with cleaner names

// ==================== Legacy Manual Functions (Compatibility) ====================
export function saveData() {
  autoSave();
}

export function loadData() {
  autoLoad();
}

export function saveAll() {
  autoSave();
}

export function loadAll() {
  autoLoad();
}

// ==================== Directory Utils (Compatibility) ====================
export function createDataDirectory() {
  ensureDataDirectory();
}
