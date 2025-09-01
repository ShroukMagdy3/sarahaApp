import mongoose from "mongoose";

const checkConnection = async () => {
  await mongoose
    .connect(process.env.LINKDB)
    .then(() => {
      console.log("success connection to DB");
    })
    .catch((error) => {
      console.log("fail to connectDB");
    });
};
export default checkConnection;