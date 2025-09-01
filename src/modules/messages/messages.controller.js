import { Router } from "express";
import * as MS from "./messages.sevice.js";
import { validation } from "../../middleware/validation.js";
import * as MV from "./message.validator.js";
import { authentication } from "../../middleware/authentication.js";

const messageRouter = Router()


messageRouter.post("/send" ,validation(MV.sendMessageSchema)  , MS.sendMessage)
messageRouter.get("/getAllMesg" , authentication , MS.getAllMesg)
messageRouter.get("/getMessage/:id" ,validation(MV.getMessageSchema), authentication , MS.getMessage)



export default messageRouter;