import { Router } from "express";
import {
  getUser,
  createUser,
  updateUser,
  patchUser,
} from "../controllers/user.controller";

const router = Router();

// GET /api/users?id=1
router.get("/", getUser);

// POST /api/users
router.post("/", createUser);

// PUT /api/users/:id
router.put("/", updateUser);

// PATCH /api/users/:id
router.patch("/", patchUser);

export default router;
