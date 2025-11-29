import Term from "../models/terms.js";
import Category from "../models/category.js";

import { errorHandler } from "../Helpers/dbErrorHnadler.js";
import { normalizeFields } from "../Helpers/normalizeFields.js";

//create controller
export const create = async (req, res) => {
  try {
    // Directly get fields from req.body
    const flatFields = normalizeFields(req.body);

    // Create new Term
    const term = new Term(flatFields);

    // Save to DB
    const result = await term.save();

    res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler ? errorHandler(err) : err.message,
    });
  }
};

//term by id controller
export const termById = async (req, res, next, id) => {
  try {
    const term = await Term.findById(id).populate("category");
    if (!term) {
      return res.status(404).json({ error: "Term not found" });
    }
    req.term = term;
    next();
  } catch (err) {
    return res.status(400).json({ error: "Could not retrieve term" });
  }
};

//read controller
export const read = (req, res) => {
  return res.json(req.term);
};

//update controller
export const update = async (req, res) => {
  try {
    // Flatten fields
    const flatFields = normalizeFields(req.body);

    // Get existing term from middleware (req.term)
    let term = req.term;

    // Merge new fields
    term = Object.assign(term, flatFields);

    // Save updated term
    const result = await term.save();

    res.json(result);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler ? errorHandler(err) : err.message,
    });
  }
};

//delete controller
export const remove = async (req, res) => {
  try {
    const term = req.term; // this should be a Mongoose document

    await term.deleteOne(); // deletes it from the DB
    res.json({
      message: "Term deleted successfully",
    });
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

//list controller (gets random terms and max of 30)
export const list = async (req, res) => {
  try {
    const limit = 30; // number of terms to return

    const terms = await Term.aggregate([
      { $sample: { size: limit } }, // random items
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    res.json(terms);
  } catch (err) {
    console.error("❌ Error fetching random terms:", err);
    res.status(500).json({ error: "Error fetching random terms" });
  }
};

export const search = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // ----- 1. Text search across fields -----
    const textMatches = await Term.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    // ----- 2. Find category matches -----
    const matchedCategories = await Category.find({
      name: { $regex: query, $options: "i" },
    });

    const categoryIds = matchedCategories.map((cat) => cat._id);

    const categoryMatches = await Term.find({
      category: { $in: categoryIds },
    });

    // ----- 3. Combine unique results -----
    const combined = [
      ...textMatches,
      ...categoryMatches.filter(
        (term) => !textMatches.some((t) => t._id.equals(term._id))
      ),
    ];

    res.json(combined);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
