import Category from "../models/category.js";
import Term from "../models/terms.js";

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

///list controller
export const listByCategory = async (req, res) => {
  try {
    const categoryName = req.params.categoryName;

    // Find the category first
    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Find all terms linked to that category
    const terms = await Term.find({ category: category._id }).select({
      photo: 0,
    });

    return res.json(terms);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const list = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(400).json({ error: "Error fetching categories" });
  }
};
