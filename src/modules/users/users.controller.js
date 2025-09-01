import { Router } from "express";
import * as UC from "./users.service.js";
import { authentication } from "../../middleware/authentication.js";
import { validation } from "../../middleware/validation.js";
import * as UV from "./users.validator.js";
import { authorization } from "../../middleware/authorization.js";
import { roles } from "../../DB/models/users.model.js";
import { allowedExtension, multerHost } from "../../middleware/multer.js";

const userRouter = Router();

userRouter.post(
  "/signUp",
  multerHost({ allowedExtension: [...allowedExtension.image] }).single(
    "attachment"
  ),
  validation(UV.signUpSchema),
  UC.signUp
);
userRouter.post("/signIn", validation(UV.signInSchema), UC.signIn);
userRouter.post(
  "/updateProfileImage",
  authentication,
  multerHost({ allowedExtension: [...allowedExtension.image] }).single(
    "attachment"
  ),
  validation(UV.updateProfileImageSchema),
  UC.updateProfileImage
);
userRouter.post("/loginWithGmail", UC.loginWithGmail);

userRouter.post("/logout", authentication, UC.logOut);
userRouter.post("/refreshToken", UC.refreshToken);
userRouter.post(
  "/updatePass",
  validation(UV.updatePassSchema),
  authentication,
  UC.updatePass
);



userRouter.post("/confirmEmail", UC.confirmEmail);









userRouter.get(
  "/getUser",
  validation(UV.getUserSchema),
  authentication,
  authorization(Object.values(roles)),
  UC.getUser
);
userRouter.patch("/forgetPass", validation(UV.forgetSchema), UC.forgetPass);
userRouter.patch("/resetPass", validation(UV.resetPassSchema), UC.resetPass);
userRouter.patch(
  "/updateProfile",
  validation(UV.updateProfileSchema),
  UC.updateProfile
);
userRouter.get("/getProfileData/:id", UC.getProfileData);
userRouter.get("/getProfileData/:id", UC.getProfileData);
userRouter.delete(
  "/deleteUser/:id",
  validation(UV.deleteUserSchema),
  authentication,
  UC.deleteUser
);
userRouter.delete("/freezeAccount", authentication, UC.freeze);
userRouter.delete(
  "/freezeAccount/:id",
  validation(UV.freezeSchema),
  authentication,
  UC.freeze
);
userRouter.delete("/unfreezeAccount", authentication, UC.unFreeze);
userRouter.delete(
  "/unfreezeAccount/:id",
  validation(UV.unfreezeSchema),
  authentication,
  UC.unFreeze
);

export default userRouter;
