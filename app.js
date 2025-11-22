import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

//import routes
import termRoutes from "./routes/termRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
// import categoryRoutes from "./routes/categoryRoutes.js";

dotenv.config();
const app = express();

connectDB();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

//routes middleware
app.use("/api", termRoutes);
app.use("/api", categoryRoutes);
// app.use("/api/categories", categoryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
