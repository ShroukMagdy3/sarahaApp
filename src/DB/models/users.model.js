import mongoose from "mongoose";

export const userGender = {
  male: "male",
  female: "female",
};
export const roles = {
  user: "user",
  admin: "admin",
};
export const provider = {
  system: "system",
  google: "google",
};
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 10,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required:true
    },
    cPassword: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: Object.values(userGender),
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.user,
    },
    otp: {
      type: String,
    },
    isDeleted: { type: Boolean },
    deletedBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    image: {
      public_id:{type:String},
      secure_url:{type:String}
    },
    provider: {
      type: String,
      enum: Object.values(provider),
      default: provider.system,
    },
    isBanned:{
      type:Boolean ,
      default:false

    },
    bannedAt:{
      type:Date,
      
    }
  },
  {
    timestamps: true,
  }
);
const userModel = mongoose.models.users || mongoose.model("users", userSchema);

export default userModel;
