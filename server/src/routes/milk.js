import { Router } from "express";
import mongoose from "mongoose";

import MilkEntry from "../models/MilkEntry.js";
import Customer from "../models/Customer.js";

const r = Router();

// GET all milk entries
r.get("/", async (req, res) => {
  try {
    const entries = await MilkEntry.find()
      .populate("customer", "name phone")
      .sort({ date: -1 });

    res.json(entries);
  } catch (error) {
    console.error("Get milk entries error:", error);

    res.status(500).json({
      message: "Failed to fetch milk entries",
    });
  }
});

// GET single milk entry
r.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid milk entry ID",
      });
    }

    const entry = await MilkEntry.findById(req.params.id).populate(
      "customer",
      "name phone"
    );

    if (!entry) {
      return res.status(404).json({
        message: "Milk entry not found",
      });
    }

    res.json(entry);
  } catch (error) {
    console.error("Get milk entry error:", error);

    res.status(500).json({
      message: "Failed to fetch milk entry",
    });
  }
});

// CREATE milk entry
r.post("/", async (req, res) => {
  try {
    const { customer, liters, rate, date, notes } = req.body;

    if (!customer) {
      return res.status(400).json({
        message: "Customer is required",
      });
    }

    if (!mongoose.isValidObjectId(customer)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customerExists = await Customer.findById(customer);

    if (!customerExists) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    if (Number(liters) <= 0) {
      return res.status(400).json({
        message: "Liters must be greater than 0",
      });
    }

    if (Number(rate) < 0) {
      return res.status(400).json({
        message: "Rate cannot be negative",
      });
    }

    const total = Number(liters) * Number(rate);

    const entry = await MilkEntry.create({
      customer,
      liters: Number(liters),
      rate: Number(rate),
      total,
      date: date || new Date(),
      notes,
    });

    const populatedEntry = await entry.populate(
      "customer",
      "name phone"
    );

    res.status(201).json(populatedEntry);
  } catch (error) {
    console.error("Create milk entry error:", error);

    res.status(400).json({
      message: error.message || "Failed to create milk entry",
    });
  }
});

// UPDATE milk entry
r.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid milk entry ID",
      });
    }

    const { customer, liters, rate, date, notes } = req.body;

    if (customer && !mongoose.isValidObjectId(customer)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    if (customer) {
      const customerExists = await Customer.findById(customer);

      if (!customerExists) {
        return res.status(404).json({
          message: "Customer not found",
        });
      }
    }

    const updateData = {};

    if (customer !== undefined) updateData.customer = customer;
    if (liters !== undefined) updateData.liters = Number(liters);
    if (rate !== undefined) updateData.rate = Number(rate);
    if (date !== undefined) updateData.date = date;
    if (notes !== undefined) updateData.notes = notes;

    if (updateData.liters !== undefined && updateData.liters <= 0) {
      return res.status(400).json({
        message: "Liters must be greater than 0",
      });
    }

    if (updateData.rate !== undefined && updateData.rate < 0) {
      return res.status(400).json({
        message: "Rate cannot be negative",
      });
    }

    // Recalculate total
    const existingEntry = await MilkEntry.findById(req.params.id);

    if (!existingEntry) {
      return res.status(404).json({
        message: "Milk entry not found",
      });
    }

    const finalLiters =
      updateData.liters !== undefined
        ? updateData.liters
        : existingEntry.liters;

    const finalRate =
      updateData.rate !== undefined
        ? updateData.rate
        : existingEntry.rate;

    updateData.total = finalLiters * finalRate;

    const entry = await MilkEntry.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("customer", "name phone");

    res.json(entry);
  } catch (error) {
    console.error("Update milk entry error:", error);

    res.status(400).json({
      message: error.message || "Failed to update milk entry",
    });
  }
});

// DELETE milk entry
r.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid milk entry ID",
      });
    }

    const entry = await MilkEntry.findByIdAndDelete(req.params.id);

    if (!entry) {
      return res.status(404).json({
        message: "Milk entry not found",
      });
    }

    res.json({
      ok: true,
      message: "Milk entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete milk entry error:", error);

    res.status(500).json({
      message: "Failed to delete milk entry",
    });
  }
});

export default r;