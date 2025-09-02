import checkConnection from "./DB/connectionDB.js";
import { handleError } from "./middleware/globalErrorHandling.js";
import messageRouter from "./modules/messages/messages.controller.js";
import userRouter from "./modules/users/users.controller.js";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
var whitelist = [process.env.FRONT_ACCESS, undefined];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  handler: (req, res, options, next) => {
    res
      .status(400)
      .json({
        error: "too many requests please wait one minute and send again",
      });
  },
  skipSuccessfulRequests: true,
});


const bootstrap = (app, express) => {
  app.use(limiter);
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use("/uploads", express.static("uploads"));
  checkConnection();
  app.get("/" , (req, res, next)=>{
    res.status(200).json({message:"welcome to my app..."})
  })
  app.use("/users", userRouter);
  app.use("/message", messageRouter);

  app.use("{/*demo}", (req, res, next) => {
    res.status(404).json({ message: "this url not found" });
  });
  app.use(handleError);
};

export default bootstrap;
