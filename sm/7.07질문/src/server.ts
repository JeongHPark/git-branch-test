import cors from 'cors';
import express, { json, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import morgan from 'morgan';
import path from 'path';
import process from 'process';
import sui from 'swagger-ui-express';
import YAML from 'yaml';
import config from '../config.json';
import {
  findAstronautById,
  findUserById,
  clear,
  validateSession,
  createSession
} from './dataStore';
import { echo } from './newecho';

// Import all services
import {
  adminAuthLogin,
  adminAuthRegister,
  adminAuthLogout,
  adminControlUserDetails,
  adminControlUserDetailsUpdate,
  adminControlUserPasswordUpdate,
} from './auth';

import {
  adminMissionCreate,
  adminMissionList,
  adminMissionInfo,
  adminMissionRemove,
  adminMissionNameUpdate,
  adminMissionDescriptionUpdate,
  adminMissionTargetUpdate,
  adminMissionTransfer,
  adminMissionAssignAstronaut,
  adminMissionUnassignAstronaut,
} from './mission';
import {
  adminAstronautCreate,
  adminAstronautInfo,
  adminAstronautPool,
  adminAstronautRemove,
  adminAstronautUpdate,
} from './astronaut';
import { ERROR_MESSAGES } from './other';

// 미들웨어 import 제거
// import checkControlUserSessionId from './middlewares/controlUserSession.middleware';
// import { IRequest } from './types/IRequest';

// Set up web app
const app = express();

// Use middleware that allows us to access the JSON body of requests
app.use(json({
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));

// Error handling middleware for JSON parsing errors
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next();
});

// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), {
  swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' }
}));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400);
  }

  return res.json(result);
});

// Clear data endpoint
app.delete('/clear', (req: Request, res: Response) => {
  clear();
  return res.json({});
});

// ====================================================================
//  AUTH & SESSION ROUTES
// ====================================================================

/**
 * User registration
 * POST /v1/admin/auth/register
 */
app.post('/v1/admin/auth/register', (req: Request, res: Response): void => {
  const { email, password, nameFirst, nameLast } = req.body;

  const result = adminAuthRegister(email, password, nameFirst, nameLast);

  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }

  // Create session for the registered user
  const controlUserSessionId = createSession(result.controlUserId);

  res.status(200).json({ controlUserSessionId });
});

/**
 * User login
 * POST /v1/admin/auth/login
 */
app.post('/v1/admin/auth/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  const result = adminAuthLogin(email, password);

  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.status(200).json(result);
});

/**
 * User logout
 * POST /v1/admin/auth/logout
 */
app.post('/v1/admin/auth/logout', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;

  if (!controlUserSessionId) {
    res.status(401).json({
      error:
        'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  const result = adminAuthLogout(controlUserSessionId);
  if ('error' in result) {
    res.status(401).json({
      error:
        'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  res.status(200).json(result);
});

// ====================================================================
//  MISSION ROUTES
// ====================================================================

/**
 * Get a list of missions
 * GET /v1/admin/mission/list
 */
app.get('/v1/admin/mission/list', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;

  const result = adminMissionList(controlUserSessionId);
  if ('error' in result) {
    if (result.error === 'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)') {
      res.status(401).json({ error: result.error });
    } else {
      res.status(400).json({ error: result.error });
    }
    return;
  }
  res.status(200).json(result);
});

/**
 * Create a new mission
 * POST /v1/admin/mission
 */
app.post('/v1/admin/mission', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const { name, description, target } = req.body;
  const result = adminMissionCreate(controlUserSessionId, name, description, target);

  if ('error' in result) {
    if (result.error === 'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)') {
      res.status(401).json({ error: result.error });
    } else {
      res.status(400).json({ error: result.error });
    }
    return;
  }
  res.status(200).json(result);
});

/**
 * Get mission details
 * GET /v1/admin/mission/{missionid}
 */
app.get('/v1/admin/mission/:missionid', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);
  const missionId = parseInt(req.params.missionid, 10);

  if (!controlUserId) {
    res.status(401).json({
      error:
        'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  if (isNaN(missionId) || missionId <= 0) {
    res.status(400).json({ error: ERROR_MESSAGES.MISSION_ID_INVALID });
    return;
  }

  const result = adminMissionInfo(controlUserSessionId, missionId);
  if ('error' in result) {
    if (result.error === ERROR_MESSAGES.NOT_OWNER) {
      res.status(403).json({ error: result.error });
    } else {
      res.status(400).json({ error: result.error });
    }
    return;
  }
  res.status(200).json(result);
});

/**
 * Delete a mission
 * DELETE /v1/admin/mission/{missionid}
 */
app.delete('/v1/admin/mission/:missionid', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);
  const missionId = parseInt(req.params.missionid, 10);

  if (!controlUserId) {
    res.status(401).json({
      error:
        'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  if (isNaN(missionId) || missionId <= 0) {
    res.status(400).json({ error: ERROR_MESSAGES.MISSION_ID_INVALID });
    return;
  }

  const result = adminMissionRemove(controlUserSessionId, missionId);
  if ('error' in result) {
    if (
      result.error &&
      result.error.includes('not an owner of this mission')
    ) {
      res.status(403).json({ error: result.error });
    } else {
      res.status(400).json({ error: result.error });
    }
    return;
  }
  res.status(200).json(result);
});

/**
 * Update mission name
 * PUT /v1/admin/mission/{missionid}/name
 */
app.put('/v1/admin/mission/:missionid/name', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);
  const missionId = parseInt(req.params.missionid, 10);

  if (!controlUserId) {
    res.status(401).json({
      error:
        'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  if (isNaN(missionId) || missionId <= 0) {
    res.status(400).json({ error: ERROR_MESSAGES.MISSION_ID_INVALID });
    return;
  }

  const { name } = req.body;
  const result = adminMissionNameUpdate(controlUserSessionId, missionId, name);

  if ('error' in result) {
    if (result.error === ERROR_MESSAGES.NOT_OWNER) {
      res.status(403).json({ error: result.error });
    } else {
      res.status(400).json({ error: result.error });
    }
    return;
  }
  res.status(200).json(result);
});

/**
 * Update mission description
 * PUT /v1/admin/mission/{missionid}/description
 */
app.put('/v1/admin/mission/:missionid/description', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);
  const missionId = parseInt(req.params.missionid, 10);

  if (!controlUserId) {
    res.status(401).json({
      error:
        'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  if (isNaN(missionId) || missionId <= 0) {
    res.status(400).json({ error: ERROR_MESSAGES.MISSION_ID_INVALID });
    return;
  }

  const { description } = req.body;
  const result = adminMissionDescriptionUpdate(
    controlUserSessionId,
    missionId,
    description
  );

  if ('error' in result) {
    if (result.error === ERROR_MESSAGES.NOT_OWNER) {
      res.status(403).json({ error: result.error });
    } else {
      res.status(400).json({ error: result.error });
    }
    return;
  }
  res.status(200).json(result);
});

/**
 * Update mission target
 * PUT /v1/admin/mission/{missionid}/target
 */
app.put('/v1/admin/mission/:missionid/target', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);
  const missionId = parseInt(req.params.missionid, 10);

  if (!controlUserId) {
    res.status(401).json({
      error:
        'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  if (isNaN(missionId) || missionId <= 0) {
    res.status(400).json({ error: ERROR_MESSAGES.MISSION_ID_INVALID });
    return;
  }

  const { target } = req.body;
  const result = adminMissionTargetUpdate(
    controlUserSessionId,
    missionId,
    target
  );

  if ('error' in result) {
    if (result.error === ERROR_MESSAGES.NOT_OWNER) {
      res.status(403).json({ error: result.error });
    } else {
      res.status(400).json({ error: result.error });
    }
    return;
  }
  res.status(200).json(result);
});

/**
 * Transfer mission ownership
 * POST /v1/admin/mission/{missionid}/transfer
 */
app.post('/v1/admin/mission/:missionid/transfer', (req: Request, res: Response) => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);
  const { missionid } = req.params;
  const { userEmail } = req.body;

  if (!controlUserId) {
    res.status(401).json({
      error: 'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  // Validate missionId
  const missionIdNum = parseInt(missionid, 10);
  if (isNaN(missionIdNum) || missionIdNum <= 0) {
    res.status(403).json({ error: 'Valid controlUserSessionId is provided, but the control user is not an owner of this mission or the specified missionId does not exist' });
    return;
  }

  const result = adminMissionTransfer(controlUserSessionId, missionIdNum, userEmail);

  if (result.error) {
    if (result.error === 'Valid controlUserSessionId is provided, but the control user is not an owner of this mission or the specified missionId does not exist') {
      res.status(403).json({ error: result.error });
    } else {
      res.status(400).json({ error: result.error });
    }
    return;
  }

  res.json({});
});

/**
 * Assign astronaut to mission
 * POST /v1/admin/mission/{missionid}/assign/{astronautid}
 */
app.post('/v1/admin/mission/:missionid/assign/:astronautid', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);
  const missionId = parseInt(req.params.missionid, 10);
  const astronautId = parseInt(req.params.astronautid, 10);

  if (!controlUserId) {
    res.status(401).json({
      error:
        'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  if (isNaN(missionId) || missionId <= 0) {
    res.status(400).json({ error: ERROR_MESSAGES.MISSION_ID_INVALID });
    return;
  }

  if (isNaN(astronautId) || astronautId <= 0) {
    res.status(400).json({ error: ERROR_MESSAGES.ASTRONAUT_ID_INVALID });
    return;
  }

  // Check if astronaut exists
  const astronaut = findAstronautById(astronautId);
  if (!astronaut) {
    res.status(400).json({ error: ERROR_MESSAGES.ASTRONAUT_ID_INVALID });
    return;
  }

  const result = adminMissionAssignAstronaut(
    controlUserSessionId,
    missionId,
    astronautId
  );

  if ('error' in result) {
    if (result.error === ERROR_MESSAGES.NOT_OWNER) {
      res.status(403).json({ error: result.error });
    } else {
      res.status(400).json({ error: result.error });
    }
    return;
  }
  res.status(200).json(result);
});

/**
 * Unassign astronaut from mission
 * DELETE /v1/admin/mission/{missionid}/assign/{astronautid}
 */
app.delete(
  '/v1/admin/mission/:missionid/assign/:astronautid',
  (req: Request, res: Response): void => {
    const controlUserSessionId = req.header('controlUserSessionId') as string;
    const controlUserId = validateSession(controlUserSessionId);
    const missionId = parseInt(req.params.missionid, 10);
    const astronautId = parseInt(req.params.astronautid, 10);

    if (!controlUserId) {
      res.status(401).json({
        error:
          'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
      });
      return;
    }

    if (isNaN(missionId) || missionId <= 0) {
      res.status(400).json({ error: ERROR_MESSAGES.MISSION_ID_INVALID });
      return;
    }

    if (isNaN(astronautId) || astronautId <= 0) {
      res.status(400).json({ error: ERROR_MESSAGES.ASTRONAUT_ID_INVALID });
      return;
    }

    // Check if astronaut exists
    const astronaut = findAstronautById(astronautId);
    if (!astronaut) {
      res.status(400).json({ error: ERROR_MESSAGES.ASTRONAUT_ID_INVALID });
      return;
    }

    const result = adminMissionUnassignAstronaut(
      controlUserSessionId,
      missionId,
      astronautId
    );

    if ('error' in result) {
      if (result.error === ERROR_MESSAGES.NOT_OWNER) {
        res.status(403).json({ error: result.error });
      } else {
        res.status(400).json({ error: result.error });
      }
      return;
    }
    res.status(200).json(result);
  }
);

// ====================================================================
//  CONTROL USER ROUTES
// ====================================================================

/**
 * Get user details
 * GET /v1/admin/controluser/details
 */
app.get('/v1/admin/controluser/details', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);

  if (!controlUserId) {
    res.status(401).json({
      error:
        'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  const result = adminControlUserDetails(controlUserId);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(200).json(result);
});

/**
 * Update user details
 * PUT /v1/admin/controluser/details
 */
app.put('/v1/admin/controluser/details', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);

  if (!controlUserId) {
    res.status(401).json({
      error:
        'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  const { email, nameFirst, nameLast } = req.body;

  // Get current user to fill in missing fields (only for undefined values)
  const currentUser = findUserById(controlUserId);
  if (!currentUser) {
    res.status(401).json({
      error:
        'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  // Use current values only if not provided (undefined), not for empty strings
  const updateEmail = email !== undefined ? email : currentUser.email;
  const updateNameFirst = nameFirst !== undefined ? nameFirst : currentUser.nameFirst;
  const updateNameLast = nameLast !== undefined ? nameLast : currentUser.nameLast;

  const result = adminControlUserDetailsUpdate(
    controlUserId,
    updateEmail,
    updateNameFirst,
    updateNameLast
  );

  if (result && 'error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(200).json({});
});

/**
 * Update user password
 * PUT /v1/admin/controluser/password
 */
app.put('/v1/admin/controluser/password', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);

  if (!controlUserId) {
    res.status(401).json({
      error:
        'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)',
    });
    return;
  }

  const { oldPassword, newPassword } = req.body;
  const result = adminControlUserPasswordUpdate(
    controlUserId,
    oldPassword,
    newPassword
  );

  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(200).json(result);
});

// ====================================================================
//  ASTRONAUT ROUTES
// ====================================================================

/**
 * Create an astronaut
 * POST /v1/admin/astronaut
 */
app.post('/v1/admin/astronaut', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;

  // First check authentication
  const controlUserId = validateSession(controlUserSessionId);
  if (!controlUserId) {
    res.status(401).json({
      error: 'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)'
    });
    return;
  }

  // Then check for missing required fields
  const { nameFirst, nameLast, rank, age, weight, height } = req.body;

  if (nameFirst === undefined || nameFirst === null) {
    res.status(400).json({ error: ERROR_MESSAGES.NAME_FIRST_INVALID_LENGTH });
    return;
  }
  if (nameLast === undefined || nameLast === null) {
    res.status(400).json({ error: ERROR_MESSAGES.NAME_LAST_INVALID_LENGTH });
    return;
  }
  if (rank === undefined || rank === null) {
    res.status(400).json({ error: ERROR_MESSAGES.ASTRONAUT_RANK_INVALID_LENGTH });
    return;
  }
  if (age === undefined || age === null) {
    res.status(400).json({ error: ERROR_MESSAGES.AGE_INVALID });
    return;
  }
  if (weight === undefined || weight === null) {
    res.status(400).json({ error: ERROR_MESSAGES.WEIGHT_INVALID });
    return;
  }
  if (height === undefined || height === null) {
    res.status(400).json({ error: ERROR_MESSAGES.HEIGHT_INVALID });
    return;
  }

  const result = adminAstronautCreate(
    controlUserSessionId,
    nameFirst,
    nameLast,
    rank,
    age,
    weight,
    height
  );

  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(200).json(result);
});

/**
 * Retrieve the astronaut pool
 * GET /v1/admin/astronaut/pool
 */
app.get('/v1/admin/astronaut/pool', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);

  if (!controlUserId) {
    res.status(401).json({
      error: 'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)'
    });
    return;
  }

  const result = adminAstronautPool(controlUserSessionId);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(200).json(result);
});

/**
 * Get astronaut information
 * GET /v1/admin/astronaut/{astronautid}
 */
app.get('/v1/admin/astronaut/:astronautid', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);
  const astronautId = parseInt(req.params.astronautid, 10);

  if (!controlUserId) {
    res.status(401).json({
      error: 'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)'
    });
    return;
  }

  if (isNaN(astronautId) || astronautId <= 0) {
    res.status(400).json({ error: ERROR_MESSAGES.ASTRONAUT_ID_INVALID });
    return;
  }

  const result = adminAstronautInfo(controlUserSessionId, astronautId);
  if ('error' in result) {
    if (result.error === 'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)') {
      res.status(401).json({ error: result.error });
    } else {
      res.status(400).json({ error: result.error });
    }
    return;
  }
  res.status(200).json(result);
});

/**
 * Update astronaut details
 * PUT /v1/admin/astronaut/{astronautid}
 */
app.put('/v1/admin/astronaut/:astronautid', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);
  const astronautId = parseInt(req.params.astronautid, 10);

  if (!controlUserId) {
    res.status(401).json({
      error: 'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)'
    });
    return;
  }

  if (isNaN(astronautId) || astronautId <= 0) {
    res.status(400).json({ error: ERROR_MESSAGES.ASTRONAUT_ID_INVALID });
    return;
  }

  const { nameFirst, nameLast, rank, age, weight, height } = req.body;

  // Check for missing required fields
  if (nameFirst === undefined || nameFirst === null) {
    res.status(400).json({ error: ERROR_MESSAGES.NAME_FIRST_INVALID_LENGTH });
    return;
  }
  if (nameLast === undefined || nameLast === null) {
    res.status(400).json({ error: ERROR_MESSAGES.NAME_LAST_INVALID_LENGTH });
    return;
  }
  if (rank === undefined || rank === null) {
    res.status(400).json({ error: ERROR_MESSAGES.ASTRONAUT_RANK_INVALID_LENGTH });
    return;
  }
  if (age === undefined || age === null) {
    res.status(400).json({ error: ERROR_MESSAGES.AGE_INVALID });
    return;
  }
  if (weight === undefined || weight === null) {
    res.status(400).json({ error: ERROR_MESSAGES.WEIGHT_INVALID });
    return;
  }
  if (height === undefined || height === null) {
    res.status(400).json({ error: ERROR_MESSAGES.HEIGHT_INVALID });
    return;
  }

  const result = adminAstronautUpdate(
    controlUserSessionId,
    astronautId,
    nameFirst,
    nameLast,
    rank,
    age,
    weight,
    height
  );

  if ('error' in result) {
    if (result.error === 'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)') {
      res.status(401).json({ error: result.error });
    } else {
      res.status(400).json({ error: result.error });
    }
    return;
  }
  res.status(200).json(result);
});

/**
 * Delete an astronaut
 * DELETE /v1/admin/astronaut/{astronautid}
 */
app.delete('/v1/admin/astronaut/:astronautid', (req: Request, res: Response): void => {
  const controlUserSessionId = req.header('controlUserSessionId') as string;
  const controlUserId = validateSession(controlUserSessionId);
  const astronautId = parseInt(req.params.astronautid, 10);

  if (!controlUserId) {
    res.status(401).json({
      error: 'ControlUserSessionId is empty or invalid (does not refer to valid logged in user session)'
    });
    return;
  }

  if (isNaN(astronautId) || astronautId <= 0) {
    res.status(400).json({ error: ERROR_MESSAGES.ASTRONAUT_ID_INVALID });
    return;
  }

  const result = adminAstronautRemove(controlUserSessionId, astronautId);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(200).json(result);
});

// ====================================================================
//  TESTING/RESET ROUTES
// ====================================================================

app.delete('/clear', (req: Request, res: Response) => {
  clear();
  res.status(200).json({});
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});

// Export for testing
export default app;
