// helpers/normalizeFields.js
export const normalizeFields = (fields) => {
  const flat = { ...fields }; // copy all fields as-is

  // Ensure relatedTerms is always an array
  if (flat.relatedTerms) {
    if (Array.isArray(flat.relatedTerms)) {
      flat.relatedTerms = flat.relatedTerms.map((item) => item.trim());
    } else if (typeof flat.relatedTerms === "string") {
      flat.relatedTerms = flat.relatedTerms
        .split(",")
        .map((item) => item.trim());
    } else {
      flat.relatedTerms = [];
    }
  }

  return flat;
};
