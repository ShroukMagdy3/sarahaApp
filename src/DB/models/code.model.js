import mongoose from "mongoose";

const code = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "users",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: [5, "there is no attempts enter another email"],
    },
    expireAt: {
      type: Date,
      default: () => Date.now() + 5 * 60 * 1000,
    },
  },
  {
    timestamps: true,
  }
);

const codeModel = mongoose.model("code", code) || mongoose.models.code;
export default codeModel;
