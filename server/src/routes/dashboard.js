import { Router } from "express";

import Customer from "../models/Customer.js";
import MilkEntry from "../models/MilkEntry.js";
import WaterEntry from "../models/WaterEntry.js";
import Payment from "../models/Payment.js";

const r = Router();

// GET dashboard statistics
r.get("/", async (req, res) => {
  try {
    const [customers, milk, water, payments] = await Promise.all([
      Customer.find(),
      MilkEntry.find(),
      WaterEntry.find(),
      Payment.find(),
    ]);

    const milkSales = milk.reduce(
      (total, entry) => total + Number(entry.total || 0),
      0
    );

    const waterSales = water.reduce(
      (total, entry) => total + Number(entry.total || 0),
      0
    );

    const paid = payments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    );

    const milkLiters = milk.reduce(
      (total, entry) => total + Number(entry.liters || 0),
      0
    );

    const waterHours = water.reduce(
      (total, entry) => total + Number(entry.hours || 0),
      0
    );

    const totalSales = milkSales + waterSales;
    const balance = totalSales - paid;

    res.json({
      customers: customers.length,

      milkSales,
      waterSales,
      totalSales,

      paid,
      balance,

      milkLiters,
      waterHours,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
    });
  }
});

export default r;