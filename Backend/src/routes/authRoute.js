import express from "express";
import { singUp, signIn, signOut } from "../controllers/authController.js";
const router = express.Router();

router.post("/signUp", singUp);
router.post("/signIn", signIn);
router.post("/signOut", signOut);
export default router;
