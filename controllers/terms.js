import formidable from "formidable";
import fs from "fs";
import Term from "../models/terms.js";
import Category from "../models/category.js";

import { errorHandler } from "../Helpers/dbErrorHnadler.js";
import { normalizeFields } from "../Helpers/normalizeFields.js";

//create controller
export const create = (req, res) => {
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    try {
      // ✅ flatten + cast fields
      const flatFields = normalizeFields(fields);

      let term = new Term(flatFields);

      if (files.photo) {
        const photo = Array.isArray(files.photo) ? files.photo[0] : files.photo;

        if (photo.size > 1000000) {
          return res.status(400).json({
            error: "Image should be less than 1mb in size",
          });
        }

        term.photo.data = fs.readFileSync(photo.filepath);
        term.photo.contentType = photo.mimetype;
      }

      const result = await term.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({
        error: errorHandler ? errorHandler(err) : err.message,
      });
    }
  });
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
  req.term.photo = undefined; // Exclude photo data
  return res.json(req.term);
};

//update controller
export const update = (req, res) => {
  const form = formidable({ multiples: false, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
    try {
      // ✅ flatten + cast fields
      const flatFields = normalizeFields(fields);
      let term = req.term;
      term = Object.assign(term, flatFields); // Merge existing product with new fields
      if (files.photo) {
        const photo = Array.isArray(files.photo) ? files.photo[0] : files.photo;
        if (photo.size > 1000000) {
          return res.status(400).json({
            error: "Image should be less than 1mb in size",
          });
        }
        term.photo.data = fs.readFileSync(photo.filepath);
        term.photo.contentType = photo.mimetype;
      }
      const result = await term.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({
        error: errorHandler ? errorHandler(err) : err.message,
      });
    }
  });
};

//delete controller
export const remove = async (req, res) => {
  try {
    const term = req.term; // this should be a Mongoose document

    await term.deleteOne(); // deletes it from the DB
    term.photo = undefined;
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
      {
        $project: {
          photo: 0, // remove image buffer
          __v: 0,
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
    )
      .select({ photo: 0 }) // EXCLUDE PHOTO SAFELY
      .sort({ score: { $meta: "textScore" } });

    // ----- 2. Find category matches -----
    const matchedCategories = await Category.find({
      name: { $regex: query, $options: "i" },
    });

    const categoryIds = matchedCategories.map((cat) => cat._id);

    const categoryMatches = await Term.find({
      category: { $in: categoryIds },
    }).select({ photo: 0 }); // EXCLUDE PHOTO

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

// export const listTerms = async (req, res) => {
//   try {
//     const terms = await Term.find().sort({ name: 1 });
//     const out = terms.map(t => {
//       const o = t.toObject();
//       o.imageUrl = buildImageUrl(req, o.image);
//       return o;
//     });
//     res.json(out);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getTerm = async (req, res) => {
//   try {
//     const term = await Term.findById(req.params.id);
//     if (!term) return res.status(404).json({ message: 'Term not found' });
//     const o = term.toObject();
//     o.imageUrl = buildImageUrl(req, o.image);
//     res.json(o);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateTerm = async (req, res) => {
//   try {
//     const term = await Term.findById(req.params.id);
//     if (!term) return res.status(404).json({ message: 'Term not found' });

//     const { name, definition, usage, category, relatedTerms } = req.body;
//     if (name) term.name = name;
//     if (definition) term.definition = definition;
//     if (usage) term.usage = usage;
//     if (category) term.category = category;
//     if (relatedTerms) term.relatedTerms = Array.isArray(relatedTerms) ? relatedTerms : relatedTerms.split(',').map(s => s.trim());

//     if (req.file) {
//       // delete old file if exists
//       if (term.image) {
//         const old = path.join(uploadsDir, term.image);
//         if (fs.existsSync(old)) fs.unlinkSync(old);
//       }
//       term.image = req.file.filename;
//     }

//     const saved = await term.save();
//     const o = saved.toObject();
//     o.imageUrl = buildImageUrl(req, o.image);
//     res.json(o);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const deleteTerm = async (req, res) => {
//   try {
//     const term = await Term.findById(req.params.id);
//     if (!term) return res.status(404).json({ message: 'Term not found' });

//     // remove file
//     if (term.image) {
//       const file = path.join(uploadsDir, term.image);
//       if (fs.existsSync(file)) fs.unlinkSync(file);
//     }

//     await term.deleteOne();
//     res.json({ message: 'Term deleted' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const searchTerms = async (req, res) => {
//   try {
//     const { query } = req.query;
//     if (!query) return res.status(400).json({ message: 'Query required' });

//     // use text search
//     const results = await Term.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
//       .sort({ score: { $meta: 'textScore' } });

//     const out = results.map(t => {
//       const o = t.toObject();
//       o.imageUrl = buildImageUrl(req, o.image);
//       return o;
//     });

//     res.json(out);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// ```

// ---

// ## controllers/categoryController.js

// ```js
// import Category from '../models/Category.js';

// export const createCategory = async (req, res) => {
//   try {
//     const { name, description } = req.body;
//     const cat = await Category.create({ name, description });
//     res.status(201).json(cat);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const listCategories = async (req, res) => {
//   try {
//     const cats = await Category.find().sort({ name: 1 });
//     res.json(cats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
