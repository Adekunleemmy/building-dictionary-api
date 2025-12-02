import mongoose from "mongoose";

const TermSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    image: { type: String, required: true, trim: true },
    definition: { type: String, required: true },
    usage: { type: String, required: true },
    category: {
      type: String,
      required: true,
    },
    relatedTerms: { type: [String], default: [] },
  },
  { timestamps: true }
);

// text index for search across multiple fields
TermSchema.index({
  name: "text",
  definition: "text",
  usage: "text",
  category: "text",
  relatedTerms: "text",
});

export default mongoose.model("Term", TermSchema);
