import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import route from "./routes/userRoute.js";

const app = express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

//Port and MongoURL retrieval from .env file used to save constants
const PORT = process.env.PORT || 7000;
const MONGO_URL = process.env.MONGOURL;

//Database Connectivity Code
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("DB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((error) => console.log(error));

app.use("/api", route);
