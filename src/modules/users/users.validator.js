import Joi from "joi";
import { userGender } from "../../DB/models/users.model.js";
import { generalRules } from "../../utilities/generalRules/generalRules.js";

export const signUpSchema = {
  body: Joi.object({
    name: Joi.string().alphanum().min(2).max(5).required(),
    email: generalRules.email.required(),
    gender: Joi.string().valid(userGender.male, userGender.female).required(),
    password: generalRules.password.required(),
    cPassword: Joi.string().valid(Joi.ref("password")).required(),
    phone: Joi.string().required(),
    files:Joi.object({
      attachment:Joi.array().items(generalRules.file.required()).required(),
      attachments:Joi.array().items(generalRules.file.required()).required(),

    })
  }).required(),
};

export const signInSchema = {
  body: Joi.object({
    email: generalRules.email.required(),
    password: generalRules.password.required(),
  }).required(),
};
export const updateProfileImageSchema = {
    file:generalRules.file.required()
};

export const getUserSchema = {
  headers: Joi.object({
    authorization: generalRules.headers.extract("authorization").required(),
  })
    .unknown()
    .required(),
};
export const updatePassSchema = {
  body: Joi.object({
    oldPass: generalRules.password.required(),
    newPass: generalRules.password.required(),
    cPass: generalRules.password.valid(Joi.ref("newPass")).required(),
  }).required(),
};
export const forgetSchema = {
  body: Joi.object({
    email:generalRules.email.required()
  }).required(),
};

export const resetPassSchema = {
  body: Joi.object({
    email:generalRules.email.required(),
    otp:Joi.string().required(),
    newPass:generalRules.password.required()
  }).required(),
};



export const updateProfileSchema = {
  body: Joi.object({
    email:generalRules.email,
    name:generalRules.name,
    gender:generalRules.gender,
    phone:generalRules.phone,
  })
};


export const getProfileDataSchema = {
  params: Joi.object({
    id:Joi.string(),
  })
};


export const deleteUserSchema = {
  params: Joi.object({
    id:Joi.string().required(),
  })
};

export const freezeSchema = {
  params: Joi.object({
    id:Joi.string(),
  })
};


export const unfreezeSchema =freezeSchema
