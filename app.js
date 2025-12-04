import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./config/db.js";

import termRoutes from "./routes/termRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

dotenv.config();
const app = express();

connectDB();

// ★ FIX: Make CORS strict and explicit
app.use(
  cors({
    origin: [
      "http://localhost:3000", // local dev
      "https://construction-bible.vercel.app/", // deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.use("/api", termRoutes);
app.use("/api", categoryRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Dictionary API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
