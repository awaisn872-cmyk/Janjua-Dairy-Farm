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
      required: [true, "Water entry date is required"],
      index: true,
    },

    hours: {
      type: Number,
      required: [true, "Water hours are required"],
      min: [0.01, "Water hours must be greater than 0"],
    },

    rate: {
      type: Number,
      required: [true, "Water rate is required"],
      min: [0, "Water rate cannot be negative"],
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

export default mongoose.model("WaterEntry", schema);