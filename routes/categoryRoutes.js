import express from "express";
import {
  categoryById,
  create,
  read,
  update,
  remove,
  listByCategory,
  list,
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

//user routes
//list categories
//list categories by category
router.get("/categories/:categoryName", listByCategory);
router.get("/categories", list);

router.param("categoryId", categoryById);
router.param("categoryName", listByCategory);

export default router;
