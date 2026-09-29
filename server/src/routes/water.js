import { Router } from "express";
import mongoose from "mongoose";

import WaterEntry from "../models/WaterEntry.js";
import Customer from "../models/Customer.js";

const r = Router();

// GET all water entries
r.get("/", async (req, res) => {
  try {
    const entries = await WaterEntry.find()
      .populate("customer", "name phone")
      .sort({ date: -1 });

    res.json(entries);
  } catch (error) {
    console.error("Get water entries error:", error);

    res.status(500).json({
      message: "Failed to fetch water entries",
    });
  }
});

// GET single water entry
r.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid water entry ID",
      });
    }

    const entry = await WaterEntry.findById(req.params.id).populate(
      "customer",
      "name phone"
    );

    if (!entry) {
      return res.status(404).json({
        message: "Water entry not found",
      });
    }

    res.json(entry);
  } catch (error) {
    console.error("Get water entry error:", error);

    res.status(500).json({
      message: "Failed to fetch water entry",
    });
  }
});

// CREATE water entry
r.post("/", async (req, res) => {
  try {
    const {
      customer,
      hours,
      rate,
      date,
      notes,
    } = req.body;

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

    if (Number(hours) <= 0) {
      return res.status(400).json({
        message: "Hours must be greater than 0",
      });
    }

    if (Number(rate) < 0) {
      return res.status(400).json({
        message: "Rate cannot be negative",
      });
    }

    const total = Number(hours) * Number(rate);

    const entry = await WaterEntry.create({
      customer,
      hours: Number(hours),
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
    console.error("Create water entry error:", error);

    res.status(400).json({
      message: error.message || "Failed to create water entry",
    });
  }
});

// UPDATE water entry
r.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid water entry ID",
      });
    }

    const existingEntry = await WaterEntry.findById(req.params.id);

    if (!existingEntry) {
      return res.status(404).json({
        message: "Water entry not found",
      });
    }

    const {
      customer,
      hours,
      rate,
      date,
      notes,
    } = req.body;

    if (customer) {
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
    }

    if (hours !== undefined && Number(hours) <= 0) {
      return res.status(400).json({
        message: "Hours must be greater than 0",
      });
    }

    if (rate !== undefined && Number(rate) < 0) {
      return res.status(400).json({
        message: "Rate cannot be negative",
      });
    }

    const updateData = {};

    if (customer !== undefined) {
      updateData.customer = customer;
    }

    if (hours !== undefined) {
      updateData.hours = Number(hours);
    }

    if (rate !== undefined) {
      updateData.rate = Number(rate);
    }

    if (date !== undefined) {
      updateData.date = date;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const finalHours =
      updateData.hours !== undefined
        ? updateData.hours
        : existingEntry.hours;

    const finalRate =
      updateData.rate !== undefined
        ? updateData.rate
        : existingEntry.rate;

    updateData.total = finalHours * finalRate;

    const entry = await WaterEntry.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("customer", "name phone");

    res.json(entry);
  } catch (error) {
    console.error("Update water entry error:", error);

    res.status(400).json({
      message: error.message || "Failed to update water entry",
    });
  }
});

// DELETE water entry
r.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid water entry ID",
      });
    }

    const entry = await WaterEntry.findByIdAndDelete(req.params.id);

    if (!entry) {
      return res.status(404).json({
        message: "Water entry not found",
      });
    }

    res.json({
      ok: true,
      message: "Water entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete water entry error:", error);

    res.status(500).json({
      message: "Failed to delete water entry",
    });
  }
});

export default r;