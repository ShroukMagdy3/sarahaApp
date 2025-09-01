import Joi from "joi";
import { Types } from "mongoose";
import { userGender } from "../../DB/models/users.model.js";

export const customId = (value, helper) => {
  const data = Types.ObjectId.isValid(value);
  return data ? value : helper.message("Invalid Id");
};
export const generalRules = {
  id: Joi.custom(customId),
  email: Joi.string().email({ tlds: { allow: true }, minDomainSegments: 2 }),
  name: Joi.string().min(2).max(10),
  gender: Joi.string().valid(userGender.male, userGender.female),
  password: Joi.string(),
  phone: Joi.string(),
  file: Joi.object({
    name: Joi.string(),
    size: Joi.number().required(),
    filename: Joi.string().required(),
    destination: Joi.string().required(),
    encoding: Joi.string().required(),
    originalname: Joi.string().required(),
    fieldname: Joi.string().required(),
    mimetype: Joi.string().required(),
    path: Joi.string().required(),
  }),
  headers: Joi.object({
    authorization: Joi.string(),
    Connection: Joi.string(),
    "accept-Encoding": Joi.string(),
    Accept: Joi.string(),
    "content-type": Joi.string(),
    "content-Length": Joi.string(),
    Host: Joi.string(),
    "user-agent": Joi.string(),
  }).unknown(true),
};
