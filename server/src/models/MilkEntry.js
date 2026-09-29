import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer is required"],
      index: true,
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },

    liters: {
      type: Number,
      required: [true, "Milk quantity is required"],
      min: [0.01, "Milk quantity must be greater than 0"],
    },

    rate: {
      type: Number,
      required: [true, "Milk rate is required"],
      min: [0, "Milk rate cannot be negative"],
    },

    total: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total cannot be negative"],
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Notes are too long"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("MilkEntry", schema);