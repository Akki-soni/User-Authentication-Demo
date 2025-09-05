import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./src/utils/db.js";
import userRoutes from "./src/routes/userRoutes.js";

dotenv.config();

const port = process.env.PORT || 8080;

const app = express();

app.use(
  cors({
    origin: process.env.BASE_URL,
    method: ["GET", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db();

app.use("/api/v1/users", userRoutes);

// app.get("/", (req, res) => {
//   res.send("App Created Successfully");
// });

app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
