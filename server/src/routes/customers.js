import { Router } from "express";
import mongoose from "mongoose";

import Customer from "../models/Customer.js";
import MilkEntry from "../models/MilkEntry.js";
import WaterEntry from "../models/WaterEntry.js";
import Payment from "../models/Payment.js";

const r = Router();

// GET all customers
r.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// GET single customer
r.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({ message: "Failed to fetch customer" });
  }
});

// CREATE customer
r.post("/", async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(400).json({
      message: error.message || "Failed to create customer",
    });
  }
});

// UPDATE customer
r.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(400).json({
      message: error.message || "Failed to update customer",
    });
  }
});

// DELETE customer + related records
r.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await Promise.all([
      MilkEntry.deleteMany({ customer: req.params.id }),
      WaterEntry.deleteMany({ customer: req.params.id }),
      Payment.deleteMany({ customer: req.params.id }),
      Customer.findByIdAndDelete(req.params.id),
    ]);

    res.json({
      ok: true,
      message: "Customer and related records deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({
      message: "Failed to delete customer",
    });
  }
});

// GET complete customer ledger
r.get("/:id/ledger", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const [customer, milk, water, payments] = await Promise.all([
      Customer.findById(req.params.id),
      MilkEntry.find({ customer: req.params.id }).sort({ date: -1 }),
      WaterEntry.find({ customer: req.params.id }).sort({ date: -1 }),
      Payment.find({ customer: req.params.id }).sort({ date: -1 }),
    ]);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const milkTotal = milk.reduce(
      (total, entry) => total + Number(entry.total || 0),
      0
    );

    const waterTotal = water.reduce(
      (total, entry) => total + Number(entry.total || 0),
      0
    );

    const paid = payments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    );

    const totalCharges = milkTotal + waterTotal;
    const balance = totalCharges - paid;

    res.json({
      customer,
      milk,
      water,
      payments,

      summary: {
        milkTotal,
        waterTotal,
        totalCharges,
        paid,
        balance,
      },

      // Kept for frontend compatibility
      milkTotal,
      waterTotal,
      paid,
      balance,
    });
  } catch (error) {
    console.error("Customer ledger error:", error);
    res.status(500).json({
      message: "Failed to fetch customer ledger",
    });
  }
});

export default r;