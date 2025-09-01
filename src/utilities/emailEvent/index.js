import { EventEmitter } from "events";
import { sendEmail } from "../../service/sendEmail.js";
import { nanoid } from "nanoid";
import { Hash } from "../hash/hash.js";
import codeModel from "../../DB/models/code.model.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("sendEmail", async (data) => {
  const {email , id} = data;
  let originalCode = nanoid(4)
  let otp = await Hash(originalCode , process.env.SALT_ROUNDS)
  let code = await codeModel.create({
    code :otp, 
    userId:id ,
    expireAt: Date.now() + 5 * 60 *1000
  }) ;
  const isSend = await sendEmail({
    to: email,
    html:`<h2> confirmation code : ${originalCode}</h2>`,
    subject:"confirm Email"
  });
  if (!isSend) {
    throw new Error("fail to send", { case: 400 });
  }
});

eventEmitter.on("forgetPass", async (data, otp) => {
  const { email } = data;
  const isSend = await sendEmail({
    to: email,
    html: `<h1>OTP:${otp}</h1>`,
  });
  if (!isSend) {
    throw new Error("fail to send", { case: 400 });
  }
});
