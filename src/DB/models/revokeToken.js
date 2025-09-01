import mongoose from "mongoose";

const revokeSchema = new mongoose.Schema(
  {
    token: {
      required: true,
      type: String
    },
    expiredAt: {
      type:String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const revokeModel =
  mongoose.model.revokeToken || mongoose.model("revokeToken", revokeSchema);

export default revokeModel;
