import express from "express";
import {
  categoryById,
  create,
  read,
  update,
  remove,
} from "../controllers/category.js";

const router = express.Router();

//Admin routes
//create new category
router.post("/category/create", create);
//read category
router.get("/category/:categoryId", read);
//update category
router.put("/category/:categoryId", update);
//delete category
router.delete("/category/:categoryId", remove);

router.param("categoryId", categoryById);

export default router;
