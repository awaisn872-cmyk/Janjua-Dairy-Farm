import { Router } from "express";
import mongoose from "mongoose";

import Payment from "../models/Payment.js";
import Customer from "../models/Customer.js";

const r = Router();

// GET all payments
r.get("/", async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("customer", "name phone")
      .sort({ date: -1 });

    res.json(payments);
  } catch (error) {
    console.error("Get payments error:", error);

    res.status(500).json({
      message: "Failed to fetch payments",
    });
  }
});

// GET single payment
r.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(req.params.id).populate(
      "customer",
      "name phone"
    );

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json(payment);
  } catch (error) {
    console.error("Get payment error:", error);

    res.status(500).json({
      message: "Failed to fetch payment",
    });
  }
});

// CREATE payment
r.post("/", async (req, res) => {
  try {
    const { customer, amount, date, method, notes } = req.body;

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

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0",
      });
    }

    const payment = await Payment.create({
      customer,
      amount: Number(amount),
      date: date || new Date(),
      method,
      notes,
    });

    const populatedPayment = await payment.populate(
      "customer",
      "name phone"
    );

    res.status(201).json(populatedPayment);
  } catch (error) {
    console.error("Create payment error:", error);

    res.status(400).json({
      message: error.message || "Failed to create payment",
    });
  }
});

// UPDATE payment
r.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid payment ID",
      });
    }

    const existingPayment = await Payment.findById(req.params.id);

    if (!existingPayment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const { customer, amount, date, method, notes } = req.body;

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

    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0",
      });
    }

    const updateData = {};

    if (customer !== undefined) updateData.customer = customer;
    if (amount !== undefined) updateData.amount = Number(amount);
    if (date !== undefined) updateData.date = date;
    if (method !== undefined) updateData.method = method;
    if (notes !== undefined) updateData.notes = notes;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("customer", "name phone");

    res.json(payment);
  } catch (error) {
    console.error("Update payment error:", error);

    res.status(400).json({
      message: error.message || "Failed to update payment",
    });
  }
});

// DELETE payment
r.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json({
      ok: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment error:", error);

    res.status(500).json({
      message: "Failed to delete payment",
    });
  }
});

export default r;