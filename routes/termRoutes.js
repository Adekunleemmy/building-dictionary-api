import express from "express";
import {
  create,
  termById,
  read,
  update,
  remove,
  list,
  search,
} from "../controllers/terms.js";

const router = express.Router();

//create new term
router.post("/term/create", create);
//read term
router.get("/term/:termId", read);
//update term
router.put("/term/:termId", update);
//delete term
router.delete("/term/:termId", remove);
//list products
router.get("/terms", list);
//serach terms
router.get("/terms/search", search);

router.param("termId", termById);

export default router;
