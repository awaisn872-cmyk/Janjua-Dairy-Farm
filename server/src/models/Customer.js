import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Customer name must be at least 2 characters"],
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: [30, "Phone number is too long"],
    },

    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Address is too long"],
    },

    milkRate: {
      type: Number,
      default: 220,
      min: [0, "Milk rate cannot be negative"],
    },

    waterRate: {
      type: Number,
      default: 100,
      min: [0, "Water rate cannot be negative"],
    },

    paymentCycle: {
      type: String,
      enum: {
        values: ["daily", "15-days", "30-days"],
        message: "Invalid payment cycle",
      },
      default: "30-days",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Notes are too long"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Customer", schema);