import mongoose from "mongoose";

const db = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("MongoDB Connected");
    })
    .catch((err) => {
      console.log(err, "MongoDB not Connected");
    });
};

export default db;
