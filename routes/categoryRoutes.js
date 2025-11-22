import express from "express";
import { create } from "../controllers/category.js";

const router = express.Router();

router.post("/category/create", create);

export default router;
