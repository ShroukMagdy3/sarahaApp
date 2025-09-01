import userModel, { provider, roles } from "../../DB/models/users.model.js";
import { generateToken } from "../../utilities/token/generateToken.js";
import { verifyToken } from "../../utilities/token/verifyToken.js";
import { Hash } from "../../utilities/hash/hash.js";
import { compare } from "../../utilities/hash/compare.js";
import { encrypt } from "../../utilities/encrypt/encrypt.js";
import { decrypt } from "../../utilities/encrypt/decrypt.js";
import { eventEmitter } from "../../utilities/emailEvent/index.js";
import { nanoid } from "nanoid";
import revokeModel from "../../DB/models/revokeToken.js";
import jwt from "jsonwebtoken";
import { customOtp } from "../../utilities/customOTP/customOtp.js";
import codeModule from "../../DB/models/code.model.js";
import codeModel from "../../DB/models/code.model.js";
import { OAuth2Client } from "google-auth-library";
import cloudinary from "../../utilities/cloudinary/index.js";

// ===========================signUp================================
export const signUp = async (req, res, next) => {
  // get data from body
  const { name, email, phone, password, cPassword, gender } = req.body;
  // check email
  const user = await userModel.findOne({ email });
  if (user) {
    throw new Error("this user already exist", { cause: 409 });
  }
  if (!req.file) {
    throw new Error("file is required");
  }
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "sarahaApp/users/image",
    }
  );
  // hash pass
  const hash = await Hash(password, process.env.SALT_ROUNDS);
  const hashCPass = await Hash(cPassword, process.env.SALT_ROUNDS);
  // encrypt phone
  const encryptPhone = await encrypt(phone, process.env.ENCRYPT_PHONE);
  // create
  const userCreated = await userModel.create({
    name,
    email,
    phone: encryptPhone,
    password: hash,
    cPassword: hashCPass,
    gender,
    image: { public_id, secure_url },
  });

  // confirm Mail
  eventEmitter.emit("sendEmail", { email, id: userCreated._id });

  await userCreated.save();
  return res.status(201).json({ message: "success created !!", userCreated });
};

// ==================confirm EMAil=====================
export const confirmEmail = async (req, res, next) => {
  const { code, email } = req.body;
  if (!code || !email) {
    throw new Error("email and code are required", { cause: 404 });
  }

  const user = await userModel.findOne({ email: email, confirmed: false });
  if (!user) {
    throw new Error("user isn't exist or already confirmed", { cause: 404 });
  }

  let otp = await codeModel.findOne({ userId: user._id });
  if (!otp) {
    eventEmitter.emit("sendEmail", { email: user.email, id: user._id });

    throw new Error("code not found we will send it again ");
  }
  if (user.isBanned) {
    const banExpire = user.bannedAt.getTime() + 5 * 60 * 1000;
    if (banExpire > Date.now()) {
      throw new Error("you are banned, please try again after a few minutes");
    } else {
      user.isBanned = false;
      user.bannedAt = null;
      await user.save();
    }
  }
  if (otp.expireAt.getTime() < Date.now()) {
    await codeModel.deleteOne({ _id: otp._id });
    eventEmitter.emit("sendEmail", { email: user.email, id: user._id });
    throw new Error("otp is expired, we sent another code");
  }

  if (otp.attempts >= 5) {
    user.isBanned = true;
    user.bannedAt = Date.now();
    eventEmitter.emit("sendEmail", { email: user.email, id: user._id });
    throw new Error(
      "you have reached the maximum attempts please wait few minutes and we will send another code"
    );
  }

  let flag = await compare(code, otp.code);
  if (!flag) {
    otp.attempts++;
    await codeModel.deleteOne({
      _id: otp._id,
    });

    if (otp.attempts >= 5) {
      user.isBanned = true;
      await user.save();
      user.bannedAt = Date.now();
      eventEmitter.emit("sendEmail", { email: user.email, id: user._id });
      throw new Error(
        "you have reached the maximum attempts please wait few minutes and we will send another code"
      );
    }
    throw new Error("this code is wrong");
  }
  user.confirmed = true;
  await user.save();
  return res.status(200).json({ message: "confirmed Done" });
};
//===========================signIN=========================
export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email, confirmed: true });
  // check email
  if (!user) {
    throw new Error("this email not found or not confirmed", { cause: 404 });
  }
  const match = await compare(password, user.password);
  // check password
  if (!match) {
    throw new Error("invalid password", { cause: 400 });
  }

  if (!user.confirmed) {
    if (user.isBanned) {
      let bantime = user - bannedAt + 5 * 60 * 1000;
      if (bantime > Date.now()) {
        throw new Error("please try gain after few minutes");
      }
    } else {
      user.isBanned = false;
      user.bannedAt = null;
      await user.save();
      eventEmitter.on("sendEmail", { email: user.email, id: user._id });
      throw new Error("you are not confirmed please wait and code wil be sent");
    }
  }

  // create token
  const access_token = await generateToken({
    payload: { id: user._id, email },
    signature:
      user.role == roles.user
        ? process.env.SIGNATURE_access_USER
        : process.env.SIGNATURE_access_ADMIN,
    options: {
      expiresIn: "1d",
      jwtid: nanoid(),
    },
  });
  const refresh_token = await generateToken({
    payload: { id: user._id, email },
    signature:
      user.role == roles.admin
        ? process.env.SIGNATURE_REFRESH_ADMIN
        : process.env.SIGNATURE_REFRESH_USER,
    options: { expiresIn: "1y", jwtid: nanoid() },
  });
  // done
  return res.status(200).json({ message: "Done", access_token, refresh_token });
};
// =============================loginWithGmail==============
export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.WEB_CLIENT_ID,
    });
    return (payload = ticket.getPayload());
  }
  const { email, email_verified, name, picture } = await verify();
  let user = await userModel.findOne({ email });
  if (!user) {
    user = await userModel.create({
      email,
      name,
      confirmed: email_verified,
      image: picture,
      provider: provider.google,
      password: nanoid(),
    });
  }
  if (user.provider != provider.google) {
    throw new Error("please login in the system");
  }
  // create token
  const access_token = await generateToken({
    payload: { id: user._id, email },
    signature:
      user.role == roles.user
        ? process.env.SIGNATURE_access_USER
        : process.env.SIGNATURE_access_ADMIN,
    options: {
      expiresIn: "1d",
      jwtid: nanoid(),
    },
  });
  const refresh_token = await generateToken({
    payload: { id: user._id, email },
    signature:
      user.role == roles.admin
        ? process.env.SIGNATURE_REFRESH_ADMIN
        : process.env.SIGNATURE_REFRESH_USER,
    options: { expiresIn: "1y", jwtid: nanoid() },
  });

  return res
    .status(201)
    .json({ message: "created", access_token, refresh_token });
};

//=======================get_user =============================
export const getUser = async (req, res, next) => {
  let phone = await decrypt(req.user.phone, process.env.ENCRYPT_PHONE);
  req.user.phone = phone;
  return res.status(200).json({ message: "Done", user: req.user });
};

// =========================logout===============================
export const logOut = async (req, res, next) => {
  const revoke = await revokeModel.create({
    token: req.decode.jti,
    expiredAt: req.decode.exp,
  });
  return res.status(200).json({ message: "logged OUT!" });
};

// =====================refreshToken==================
export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  const [prefix, token] = authorization.split(" ") || [];
  if (!prefix || !token) {
    return res.status(404).json({ message: "token is required" });
  }
  let signature = "";
  if (prefix == "bearer") {
    signature = process.env.SIGNATURE_access_USER;
  } else if (prefix == "admin") {
    signature = process.env.SIGNATURE_access_ADMIN;
  } else {
    return res.status(400).json({ message: "invalid token" });
  }

  const decode = jwt.verify(token, signature);
  const revokeToken = await revokeModel.findOne({ token: decode.jti });
  if (revokeToken) {
    throw new Error("you must login again", { cause: 403 });
  }
  const user = await userModel.findById(decode.id);
  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }
  // create token
  const access_token = await generateToken({
    payload: { id: user._id, email: user.email },
    signature:
      user.role == roles.user
        ? process.env.SIGNATURE_access_USER
        : process.env.SIGNATURE_access_ADMIN,
    options: {
      expiresIn: "1d",
      jwtid: nanoid(),
    },
  });
  const refresh_token = await generateToken({
    payload: { id: user._id, email: user.email },
    signature:
      user.role == roles.admin
        ? process.env.SIGNATURE_REFRESH_ADMIN
        : process.env.SIGNATURE_REFRESH_USER,
    options: { expiresIn: "1y", jwtid: nanoid() },
  });
  return res.status(200).json({ message: "Done", access_token, refresh_token });
};

// =====================updatePass=================
export const updatePass = async (req, res, next) => {
  const { oldPass, newPass } = req.body;
  if (!(await compare(oldPass, req.user.password))) {
    throw new Error("invalid Password");
  }
  const hash = await Hash(newPass, process.env.SALT_ROUNDS);
  req.user.password = hash;
  await req.user.save();
  return res.status(200).json({ message: "done", user: req.user });
};

// =====================forgetPass=================
export const forgetPass = async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email: email });
  if (!user) {
    throw new Error("user not exist", { cause: 404 });
  }
  const otp = customOtp();
  eventEmitter.emit("forgetPass", email, otp);
  const hash = await Hash(otp, process.env.SALT_ROUNDS);
  user.otp = hash;
  await user.save();
  return res.status(200).json({ message: "sent OTP" });
};

// ====================resetPass=========================
export const resetPass = async (req, res, next) => {
  const { email, otp, newPass } = req.body;
  const user = await userModel.findOne({
    email,
    otp: { $exists: true },
  });
  if (!user) {
    throw new Error("user not exist", { cause: 404 });
  }
  const match = await compare(otp, user.otp);
  if (!match) {
    throw new Error("invalid otp", { cause: 400 });
  }
  const hash = await Hash(newPass, process.env.SALT_ROUNDS);
  const newUser = await userModel.updateOne(
    { email },
    { password: hash, $unset: { otp: "" } }
  );

  return res.status(200).json({ message: "Done" });
};

// ====================updateProfile=================
export const updateProfile = async (req, res, next) => {
  const { name, email, phone, gender, age } = req.body;
  if (name) {
    req.user.name = name;
  }
  if (gender) {
    req.user.gender = gender;
  }
  if (phone) {
    const encrypt = await Hash(phone, process.env.SALT_ROUNDS);
    req.user.phone = encrypt;
  }
  if (email) {
    const user = await userModel.findOne({ email: email });
    if (user) {
      throw new Error("this email is already exist");
    }
    // send email
    eventEmitter.emit("sendEmail", email);
    req.user.confirmed = false;
    req.user.email = email;
  }
  await req.user.save();
  return res.status(200).json({ message: "Done" });
};

// ===================getProfileData=================
export const getProfileData = async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findById(id);
  if (!user) {
    throw new Error("no user found", { cause: 404 });
  }
  return res.status(200).json({ message: "done", user });
};
// ===================deleteUser=================
// ==============hard delete======================
export const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  if (id != req.user._id) {
    throw new Error("you are not authorized", { cause: 403 });
  }
  const user = await userModel.findById(req.user._id);
  if (!user) {
    throw new Error("no user found", { cause: 404 });
  }
  if (user.public_id) {
    await cloudinary.v2.uploader.destroy(user.public_id);
  }
  await userModel.findByIdAndDelete(id);
  return res.status(200).json({ message: "deleted", user });
};

//======================== freeze================
export const freeze = async (req, res, next) => {
  const { id } = req.params;
  if (id && req.user.role !== roles.admin) {
    throw new Error("not authorized");
  }
  const user = await userModel.updateOne(
    { _id: id || req.user._id, isDeleted: { $exists: false } },
    { isDeleted: true, deletedBy: req.user._id },
    { $inc: { __v: 1 } }
  );
  if (user.matchedCount) {
    return res.status(200).json({ message: "freezed" });
  } else {
    return res.status(500).json({ message: "fail to freeze" });
  }
};

//======================== Unfreeze================
export const unFreeze = async (req, res, next) => {
  const { id } = req.params;
  if (id && req.user.role !== roles.admin) {
    throw new Error("not authorized");
  }
  const user = await userModel.updateOne(
    { _id: id || req.user._id, isDeleted: true },
    { $unset: { isDeleted: "", deletedBy: "" } },
    { $inc: { __v: 1 } }
  );
  if (user.matchedCount) {
    return res.status(200).json({ message: "unFreezed" });
  } else {
    return res
      .status(500)
      .json({ message: "fail to unfreeze or already unfreeze !" });
  }
};

// ====================updateProfileImage=================
export const updateProfileImage = async (req, res, next) => {
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "sarahaApp/users/image",
    }
  );
  const user = await userModel.findByIdAndUpdate(
    { _id: req.user._id },
    { image: { public_id, secure_url } }
  );
  if (!user) {
    throw new Error("not exist");
  }
  await cloudinary.uploader.destroy(user.image.public_id);
  return res.status(200).json({ message: "updated" });
};
