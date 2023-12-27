import mongoose from "mongoose";

//The schema for the database: all the data will be saved in DB according to this schema
const userSchema = new mongoose.Schema({
  idNumber: {
    type: String,
  },
  fname: {
    type: String,
  },
  lname: {
    type: String,
  },
  doBirth: {
    type: String,
  },
  doIssue: {
    type: String,
  },
  doExpiry: {
    type: String,
  },
});

export default mongoose.model("User", userSchema);
