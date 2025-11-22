// helpers/normalizeFields.js
export const normalizeFields = (fields) => {
  const flat = {};

  for (const key in fields) {
    // multer form-data often wraps values in arrays
    let val = Array.isArray(fields[key]) ? fields[key][0] : fields[key];

    // Convert relatedTerms to array
    if (key === "relatedTerms") {
      if (Array.isArray(fields[key])) {
        // form-data supports multiple fields: relatedTerms[]=word
        val = fields[key];
      } else if (typeof val === "string") {
        // comma-separated string: "term1, term2"
        val = val.split(",").map((item) => item.trim());
      } else {
        val = [];
      }
    }

    flat[key] = val;
  }

  return flat;
};
