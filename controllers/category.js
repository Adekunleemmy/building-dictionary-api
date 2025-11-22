import Category from "../models/category.js";

//create controller
export const create = async (req, res) => {
  const category = new Category(req.body);
  try {
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ error: "Error saving category" });
  }
};

//category by id controller
export const categoryById = async (req, res, next, id) => {
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    req.category = category;
    next();
  } catch (err) {
    return res.status(400).json({ error: "Could not retrieve category" });
  }
};

//read controller
export const read = (req, res) => {
  return res.json(req.category);
};

//remove controller
export const remove = async (req, res) => {
  try {
    const category = req.category; // this should be a Mongoose document
    await category.deleteOne(); // deletes it from the DB
    res.json({
      message: "Category deleted successfully",
    });
  } catch (err) {
    return res.status(400).json({ error: "Error deleting category" });
  }
};

//update controller
export const update = async (req, res) => {
  const category = req.category;
  category.name = req.body.name;
  try {
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ error: "Error updating category" });
  }
};
