import express from 'express';
import { login } from '../authController';
import { refreshAccessToken } from '../tokenUtils';

const router = express.Router();

router.post('/login', login);
router.post('/refresh', refreshAccessToken); // 새 accessToken을 발급받는 API

export default router;
