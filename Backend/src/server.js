import express from "express";
import dotenv from "dotenv";
import { connect } from "mongoose";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import { protectRoute } from "./middlewares/authMiddleware.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
//public routes
app.use("/api/auth", authRoute);

//private routes
app.use(protectRoute);
app.use("/api/users", userRoute);
// Connect to MongoDB
connectDB().then(() => {
  // Start the server after successful database connection
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
