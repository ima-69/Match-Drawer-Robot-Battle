import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import teamRoutes from "./routes/teamRoutes.js";
import tournamentRoutes from "./routes/tournamentRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/teams", teamRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/matches", matchRoutes);

app.get("/", (req, res) => res.send("Tournament API Running"));

const PORT = process.env.PORT || 5000;

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB connected");
      app.listen(PORT, () =>
        console.log(`🚀 Server running on port ${PORT}`)
      );
    })
    .catch((err) => {
      console.log("MongoDB connection failed:", err.message);
      console.log("Starting server without database...");
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (without database)`));
    });
} else {
  console.log("No MONGO_URI found, starting server without database...");
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (without database)`));
}