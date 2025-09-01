import { createTransport } from "nodemailer";

export const sendEmail= async ({to, subject ,html,attachments})=>{
    const transporter = createTransport({
  port: 587,
  service:"gmail",
  secure: false, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

  const info = await transporter.sendMail({
    from: `"sarahaApp" <${process.env.EMAIL}>`,
    to: to || process.env.EMAIL,
    subject: subject ||  "Hello ✔",
    html: html ||"<b>Hello world?</b>", 
    attachments:attachments ||[]
  });
  if(info.accepted.length>0){
    return true
  }else{
    return false
  }
}