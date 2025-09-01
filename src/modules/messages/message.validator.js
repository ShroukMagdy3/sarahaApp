import Joi from "joi";
import { generalRules } from "../../utilities/generalRules/generalRules.js";

export const sendMessageSchema = {
    body:Joi.object({
        userId:generalRules.id.required(),
        content :Joi.string().min(2).required(),
    }).required()
}

export const getMessageSchema = {
    params:Joi.object({
        id:generalRules.id.required(),
    }).required()
}
