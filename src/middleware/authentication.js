import jwt from "jsonwebtoken";
import userModel from "../DB/models/users.model.js";
import revokeModel from "../DB/models/revokeToken.js";

export const authentication = async (req, res, next) => {
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
    throw new Error("you must login again" ,{cause:403});
  }

  const user = await userModel
    .findById(decode.id)
  if (!user) {
    throw new Error("user not found", { cause: 404 });
  }
  req.user = user;  
  req.decode = decode;
  return next();
};
