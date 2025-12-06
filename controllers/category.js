import Category from "../models/category.js";
import Term from "../models/terms.js";

//create controller
export const create = async (req, res) => {
  try {
    let response;

    if (Array.isArray(req.body)) {
      // Insert many at once
      response = await Category.insertMany(req.body);
    } else {
      // Insert one
      const category = new Category(req.body);
      response = await category.save();
    }

    res.json(response);
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
  try {
    const category = req.category; // Loaded by param middleware

    // Update fields ONLY if provided in req.body
    if (req.body.name !== undefined) category.name = req.body.name;
    if (req.body.description !== undefined)
      category.description = req.body.description;
    if (req.body.image !== undefined) category.image = req.body.image;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (err) {
    console.error(err);
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
    const terms = await Term.find({ category: category._id });

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
