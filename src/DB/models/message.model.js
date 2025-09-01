import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      required: true,
      type: String,
      minLength: 2,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const messageModel =
  mongoose.model.message || mongoose.model("message", messageSchema);


  export default messageModel;