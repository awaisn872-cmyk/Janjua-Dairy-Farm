import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import customerRoutes from "./routes/customers.js";
import milkRoutes from "./routes/milk.js";
import waterRoutes from "./routes/water.js";
import paymentRoutes from "./routes/payments.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL?.split(",") || "*", credentials: true }));
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ ok: true, app: "Janjua Dairy Farm" }));
app.use("/api/customers", customerRoutes);
app.use("/api/milk", milkRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.MONGO_URI) {
  mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`API running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
} else {
  console.log("MONGO_URI not set. API server will not start database mode.");
  app.listen(PORT, () => console.log(`API running on ${PORT} without MongoDB`));
}
