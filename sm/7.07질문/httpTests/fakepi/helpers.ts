import request from 'sync-request-curl';
import config from '../../config.json';

// ① Declare types that the library doesn't provide
export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// BASE_URL 조립
const BASE_URL = `${config.url}:${config.port}`;

// ==================== Pure Functional Programming Utilities ====================

// Single property extraction function
export const getValue = (obj: any, key: string): any => obj[key];

// Nested property extraction function
export const getNestedValue = (obj: any, ...keys: string[]): any => 
  keys.reduce((current, key) => getValue(current, key), obj);

// Safe property extraction function (null/undefined check)
export const safeGetValue = (obj: any, key: string): any => 
  obj && obj[key];

// Safe nested property extraction function
export const safeGetNestedValue = (obj: any, ...keys: string[]): any => 
  keys.reduce((current, key) => safeGetValue(current, key), obj);

// Type checking functions
export const isString = (value: any): boolean => typeof value === 'string';
export const isNumber = (value: any): boolean => typeof value === 'number';
export const hasProperty = (obj: any, key: string): boolean => obj && obj[key] !== undefined;

// ② Enhanced options interface for unified apiRequest
export interface ApiRequestOptions {
  qs?: any;
  json?: any;
  body?: any;
  headers?: Record<string, string>;
  fullResponse?: boolean; // ← 새로운 옵션: makeRequestWithStatus 스타일로 받을지 여부
}

// ③ Unified apiRequest function (통합형) - 함수 오버로드로 타입 정확성 보장
export function apiRequest<T = any>(
  method: HttpVerb,
  path: string,
  options: ApiRequestOptions & { fullResponse: true }
): { status: number; statusCode: number; body: T; headers: any };

export function apiRequest<T = any>(
  method: HttpVerb,
  path: string,
  options?: ApiRequestOptions & { fullResponse?: false }
): T;

export function apiRequest<T = any>(
  method: HttpVerb,
  path: string,
  options: ApiRequestOptions = {}
): T | { status: number; statusCode: number; body: T; headers: any } {
  const { qs, json, headers, body, fullResponse } = options;
  
  try {
    const opts: Record<string, any> = {
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {})
      }
    };
    
    if (qs !== undefined) opts['qs'] = qs;
    if (json !== undefined) opts['json'] = json;
    if (body !== undefined) {
      opts['body'] = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = request(method, BASE_URL + path, opts);
    const statusCode = getValue(response, 'statusCode');
    const responseBody = getValue(response, 'body');
    const responseHeaders = getValue(response, 'headers');
    
    let parsedBody = {};
    if (responseBody) {
      try {
        if (typeof responseBody === 'string') {
          parsedBody = JSON.parse(responseBody);
        } else if (responseBody && typeof responseBody === 'object' && typeof responseBody.toString === 'function') {
          const bodyString = responseBody.toString();
          parsedBody = bodyString ? JSON.parse(bodyString) : {};
        } else if (responseBody && typeof responseBody === 'object') {
          parsedBody = responseBody;
        }
      } catch (parseError) {
        parsedBody = {};
      }
    }

    if (fullResponse) {
      return {
        status: statusCode,
        statusCode: statusCode,
        body: parsedBody as T,
        headers: responseHeaders || {}
      };
    }

    return parsedBody as T;
  } catch (error: any) {
    const message = getValue(error, 'message');
    const errorBody = { error: 'Request failed: ' + message };

    if (fullResponse) {
      return {
        status: 500,
        statusCode: 500,
        body: errorBody as T,
        headers: {}
      };
    }

    return errorBody as T;
  }
}

// ④ 호환성을 위한 기존 함수들 (apiRequest를 감싼 wrapper)
export function makeRequest<T = any>(method: string, endpoint: string, body: any = {}, headers: any = {}): T {
  const cleanPath = endpoint.includes(BASE_URL) ? endpoint.replace(BASE_URL, '') : endpoint;
  return apiRequest<T>(method as HttpVerb, cleanPath, {
    body,
    headers,
    fullResponse: false
  });
}

export function makeRequestWithStatus<T = any>(method: string, endpoint: string, body: any = {}, headers: any = {}) {
  const cleanPath = endpoint.includes(BASE_URL) ? endpoint.replace(BASE_URL, '') : endpoint;
  return apiRequest<T>(method as HttpVerb, cleanPath, {
    body,
    headers,
    fullResponse: true
  });
}

// ⑤ 기존 ApiOpts 인터페이스 (하위 호환성)
export interface ApiOpts {
  qs?: any;
  json?: any;
  headers?: any;
  body?: any;
}

// Helper functions compatible with existing test files
export function expectSuccess(response: any, expectedStatus: number) {
  const status = getValue(response, 'status');
  const body = getValue(response, 'body');
  if (status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${status}`);
  }
  return body;
}

export function expectError(response: any, expectedStatus: number, expectedErrorMessage?: string) {
  const status = getValue(response, 'status');
  const body = getValue(response, 'body');
  if (status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${status}`);
  }
  if (expectedErrorMessage && body && getValue(body, 'error')) {
    const error = getValue(body, 'error');
    if (typeof error === 'string' && !error.includes(expectedErrorMessage)) {
      throw new Error(`Expected error message to contain "${expectedErrorMessage}", got "${error}"`);
    }
  }
  return body;
}

export function expectValidSessionId(result: any) {
  const controlUserSessionId = getValue(result, 'controlUserSessionId');
  if (!controlUserSessionId || !isString(controlUserSessionId)) {
    throw new Error('Invalid or missing controlUserSessionId');
  }
  const sessionIdLength = getValue(controlUserSessionId, 'length');
  if (sessionIdLength === 0) {
    throw new Error('controlUserSessionId is empty');
  }
  return controlUserSessionId;
}

// Test initialization helper
export function setupTest(baseUrl: string = 'http://127.0.0.1:3200') {
  const response = makeRequestWithStatus('DELETE', baseUrl + '/clear');
  const status = getValue(response, 'status');
  if (status !== 200) {
    const body = getValue(response, 'body');
    console.error('Clear request failed:', {
      status: status,
      body: body,
      response: response
    });
    throw new Error(`Failed to clear server data. Status: ${status}, Body: ${JSON.stringify(body)}`);
  }
}

// Jest-compatible expectValidSessionId
export function expectValidSessionIdJest(result: any) {
  expect(result).toHaveProperty('controlUserSessionId');
  const controlUserSessionId = getValue(result, 'controlUserSessionId');
  expect(typeof controlUserSessionId).toBe('string');
  const sessionIdLength = getValue(controlUserSessionId, 'length');
  expect(sessionIdLength).toBeGreaterThan(0);
}

// Additional helper functions for tests
export function createTestUser(userData: any) {
  const registerResponse = makeRequestWithStatus('POST', 'http://127.0.0.1:3200/v1/admin/auth/register', userData);
  const status = getValue(registerResponse, 'status');
  const body = getValue(registerResponse, 'body');
  
  if (status !== 200) {
    throw new Error('Failed to register test user: ' + JSON.stringify(body));
  }
  
  const controlUserSessionId = getValue(body, 'controlUserSessionId');
  return controlUserSessionId;
}

export function registerTestUser(userData: any) {
  const registerResponse = makeRequestWithStatus('POST', 'http://127.0.0.1:3200/v1/admin/auth/register', userData);
  const status = getValue(registerResponse, 'status');
  const body = getValue(registerResponse, 'body');
  
  if (status !== 200) {
    throw new Error('Failed to register test user: ' + JSON.stringify(body));
  }
  
  const controlUserSessionId = getValue(body, 'controlUserSessionId');
  return {
    user: userData,
    sessionId: controlUserSessionId
  };
}

export function expectValidMissionId(result: any) {
  const missionId = getMissionId(result);
  expect(missionId).toBeDefined();
  expect(typeof missionId).toBe('number');
}

// Clear data function
export function clearData(): void {
  const response = makeRequestWithStatus('DELETE', 'http://127.0.0.1:3200/clear');
  const status = getValue(response, 'status');
  if (status !== 200) {
    throw new Error('Failed to clear server data');
  }
}

// For success cases only - returns body only
export function expectSuccessAndGetBody<T = any>(method: string, endpoint: string, body: any = {}, headers: any = {}, expectedStatus: number = 200): T {
  const response = makeRequestWithStatus(method, endpoint, body, headers);
  const status = getValue(response, 'status');
  const responseBody = getValue(response, 'body');
  if (status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${status}`);
  }
  return responseBody;
}

// For error cases only - checks status code and error message
export function expectErrorAndGetDetails(method: string, endpoint: string, body: any = {}, headers: any = {}, expectedStatus: number, expectedErrorMessage?: string) {
  const response = makeRequestWithStatus(method, endpoint, body, headers);
  const status = getValue(response, 'status');
  const responseBody = getValue(response, 'body');
  if (status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${status}`);
  }
  if (expectedErrorMessage && responseBody && getValue(responseBody, 'error') && !getValue(getValue(responseBody, 'error'), 'includes')(expectedErrorMessage)) {
    const error = getValue(responseBody, 'error');
    throw new Error(`Expected error message to contain "${expectedErrorMessage}", got "${error}"`);
  }
  return {
    status: status,
    error: getValue(responseBody, 'error')
  };
}

// ==================== Pure Functional Helper Functions ====================

// Extract controlUserSessionId from response
export function getSessionId(response: any): string {
  return getNestedValue(response, 'body', 'controlUserSessionId');
}

// Extract user object from response
export function getUser(response: any): any {
  return getNestedValue(response, 'body', 'user');
}

// Extract missionId from response
export function getMissionId(response: any): number {
  return getNestedValue(response, 'body', 'missionId');
}

// Extract astronautId from response
export function getAstronautId(response: any): number {
  return getNestedValue(response, 'body', 'astronautId');
}

// Extract specific property from response (generic)
export function getBodyProperty(response: any, property: string): any {
  const body = getValue(response, 'body');
  return getValue(body, property);
}

// User-related property extraction functions
export function getUserEmail(response: any): string {
  return getNestedValue(response, 'body', 'user', 'email');
}

export function getUserName(response: any): string {
  return getNestedValue(response, 'body', 'user', 'name');
}

export function getUserId(response: any): number {
  return getNestedValue(response, 'body', 'user', 'controlUserId');
}

export function getUserLogins(response: any): number {
  return getNestedValue(response, 'body', 'user', 'numSuccessfulLogins');
}

export function getUserFailedLogins(response: any): number {
  return getNestedValue(response, 'body', 'user', 'numFailedPasswordsSinceLastLogin');
}

// ==================== registerTestUser Result Processing Functions ====================

// Extract user object from registerTestUser result
export function getRegisteredUser(registerResult: any): any {
  return getValue(registerResult, 'user');
}

// Extract sessionId from registerTestUser result
export function getRegisteredSessionId(registerResult: any): string {
  return getValue(registerResult, 'sessionId');
}

// Property extraction functions from user object
export function getUserEmailFromUser(user: any): string {
  return getValue(user, 'email');
}

export function getUserPasswordFromUser(user: any): string {
  return getValue(user, 'password');
}

export function getUserFirstNameFromUser(user: any): string {
  return getValue(user, 'nameFirst');
}

export function getUserLastNameFromUser(user: any): string {
  return getValue(user, 'nameLast');
}

// ==================== Property Checking Functions (dot notation 제거용) ====================
export function expectHasError(result: any): void {
  if (!hasProperty(result, 'error')) {
    throw new Error('Expected result to have error property');
  }
}

export function expectHasProperty(result: any, property: string): void {
  if (!hasProperty(result, property)) {
    throw new Error(`Expected result to have ${property} property`);
  }
}

export function expectErrorProperty(result: any): any {
  expectHasError(result);
  return getValue(result, 'error');
}

// ==================== Astronaut Property Functions ====================
export function getAstronautAge(result: any): number {
  return getNestedValue(result, 'body', 'age');
}

export function getAstronautWeight(result: any): number {
  return getNestedValue(result, 'body', 'weight');
}

export function getAstronautHeight(result: any): number {
  return getNestedValue(result, 'body', 'height');
}

export function getAstronautRank(result: any): string {
  return getNestedValue(result, 'body', 'rank');
}

export function getAstronautName(result: any): string {
  return getNestedValue(result, 'body', 'name');
}

// ==================== Mission Property Functions ====================
export function getMissionsLength(result: any): number {
  const missions = getValue(result, 'missions');
  return getValue(missions, 'length');
}

export function getMissionName(result: any): string {
  return getValue(result, 'name');
}

export function getMissionDescription(result: any): string {
  return getValue(result, 'description');
}

export function getMissionTarget(result: any): string {
  return getValue(result, 'target');
}

// Astronaut Info Response Helper Functions
export function getAstronautIdFromBody(body: any): number {
  return getValue(body, 'astronautId');
}

export function getDesignation(body: any): string {
  return getValue(body, 'designation');
}

export function getTimeAdded(body: any): number {
  return getValue(body, 'timeAdded');
}

export function getTimeLastEdited(body: any): number {
  return getValue(body, 'timeLastEdited');
}

export function getAgeFromBody(body: any): number {
  return getValue(body, 'age');
}

export function getWeightFromBody(body: any): number {
  return getValue(body, 'weight');
}

export function getHeightFromBody(body: any): number {
  return getValue(body, 'height');
}

export function getAssignedMission(body: any): any {
  return getValue(body, 'assignedMission');
}

export function getAssignedMissionId(assignedMission: any): number {
  return getValue(assignedMission, 'missionId');
}

export function getObjective(assignedMission: any): string {
  return getValue(assignedMission, 'objective');
}

// Helper functions for astronaut info response (for update tests)
export function getDesignationFromResponse(response: any): string {
  return getNestedValue(response, 'body', 'designation');
}

export function getTimeAddedFromResponse(response: any): number {
  return getNestedValue(response, 'body', 'timeAdded');
}

export function getTimeLastEditedFromResponse(response: any): number {
  return getNestedValue(response, 'body', 'timeLastEdited');
}

export function getAssignedMissionFromResponse(response: any): any {
  return getValue(response, 'assignedMission');
}

// Astronaut Pool Helper Functions
export function getAstronautsFromPool(poolResponse: any): any[] {
  return getValue(poolResponse, 'astronauts') || [];
}

export function getAstronautIdFromPoolItem(astronaut: any): number {
  return getValue(astronaut, 'astronautId');
}

export function findAstronautInPool(pool: any, astronautId: number): any {
  const astronauts = getAstronautsFromPool(pool);
  return astronauts.find((astronaut: any) => getAstronautIdFromPoolItem(astronaut) === astronautId);
}

export function getPoolLength(pool: any): number {
  const astronauts = getAstronautsFromPool(pool);
  return getValue(astronauts, 'length');
}

// Empty Response Validation
export function expectEmptyResponse(body: any): void {
  const bodyKeys = Object.keys(body || {});
  const keyCount = getValue(bodyKeys, 'length');
  if (keyCount !== 0) {
    throw new Error(`Expected empty response {}, got ${JSON.stringify(body)}`);
  }
}

// Error Message Extraction
export function getErrorMessage(response: any): string {
  const body = getValue(response, 'body');
  if (body && getValue(body, 'error')) {
    return getValue(body, 'error');
  }
  return '';
}

// Additional helper functions for clear.test.ts
export function getMissionsFromBody(body: any): any[] {
  return getValue(body, 'missions') || [];
}

export function getAssignedAstronautsFromBody(body: any): any[] {
  return getValue(body, 'assignedAstronauts') || [];
}

export function getAssignedMissionFromBody(body: any): any {
  return getValue(body, 'assignedMission');
}

export function getAstronautsFromPoolBody(body: any): any[] {
  return getValue(body, 'astronauts') || [];
}

