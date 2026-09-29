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
      required: [true, "Payment date is required"],
      index: true,
    },

    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0.01, "Payment amount must be greater than 0"],
    },

    type: {
      type: String,
      enum: {
        values: ["milk", "water", "general"],
        message: "Invalid payment type",
      },
      default: "general",
    },

    method: {
      type: String,
      enum: {
        values: ["cash", "bank", "other"],
        message: "Invalid payment method",
      },
      default: "cash",
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

export default mongoose.model("Payment", schema);