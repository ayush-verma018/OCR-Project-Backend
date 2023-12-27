import User from "../model/userModal.js";
import tesseract from "node-tesseract-ocr";

//controller for creating new data and storing in the DB
export const create = async (req, res) => {
  try {
    const userData = new User(req.body);

    if (!userData) {
      return res.status(404).json({ msg: "User data not found" });
    }

    const savedData = await userData.save();
    res.status(200).json(savedData);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//controller to get all data from DB and provide as a response
export const getAll = async (req, res) => {
  try {
    const userData = await User.find();
    if (!userData) {
      return res.status(404).json({ msg: "No Data Found" });
    }
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//controller to get one data of user with given id and provide as a response
export const getOne = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await User.findById(id);
    if (!userExist) {
      return res.status(404).json({ msg: "User not Found" });
    }
    res.status(200).json(userExist);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//controller to update the data of a user with given ID
export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await User.findById(id);
    if (!userExist) {
      return res.status(401).json({ msg: "User not Found" });
    }

    const updatedData = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//controller to delete the user data based on ID
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await User.findById(id);
    if (!userExist) {
      return res.status(401).json({ msg: "User not Found" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ msg: "User Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

import vision from "@google-cloud/vision";
import moment from "moment/moment.js";

const CREDENTIALS = JSON.parse(
  JSON.stringify({
    type: "service_account",
    project_id: "mystical-magnet-409110",
    private_key_id: "858c719b0e6acb4c3fc8ed38746ada318f047cd9",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDHVBJKbGjfCADm\n1bGRdFTCTq15GiimwaRfO1qLo5R7VLjn14bspOy09I/GK7nXZg1Bv9dXVrR3WULb\n+8cXTUoztN7M12vPCrr/NqTHDphNnAycGUWYh0VwPcn0RSAUGZFxgaLb9p3oQlfP\nTE2OUHj+NCXMMub8iK+q26LrupOg+M4sqGL3h2HtnN5yYwYT7y/SodLr5J9lI1vz\nBGN8DWvi3f8VXspV2sGvJ7udge45akG/6BuO9IhjYisw7czLA84E+p7n0/5VI3D5\nicrO8kbrkveg+ASWMeGPVGvrnl84NNbTsJ37e+k8cSNqKzO3QtERvile1YEZGIKU\nhUGdO5K9AgMBAAECggEAEpv0OzOE1PGz19kyg0Bnm15qDqjVC8B/Xo61hNzoQ11l\nB+wUwiohmUFN3PP/HS9/ZFiLO7GyFoRkXBJVA4VpPIuR03D3NTSswZ/x4U2pBXHg\nsYAggb17S5/RJ3d+p7G9ZOnz8PJEysbK2OUoRnWX3i+zKa3E5+XA9MQdoUFhgAEg\nUA0cfUP0e/Y39ajliviKZaWLqaAqO8P3F69QupsOTkgcyBPVFSWzC8Amsq4sQ6VS\n4MSGynxwUMF5FOXwTEL1f2mCty1I9Ho6rpqg3S8BWvZLcQdeTs8WeUtua6yG964k\nHOUh4iWtd4yg969y4jVoKBL/qKczC3BuEDxVA6IA0QKBgQDtDs6AnI49Vbr4WM8/\ngPHmGx9pC0KwIF2AQjMl0wnHrZoKkk0NM5yl6heRLNmEEV9JWAStAaAM5bCY/pN2\n3f+LaaR4Y6AGvmaddTlzfmhsmRjsDv+IM1D0qu9Sl2ElJNyULpeuZzeCYIM76/9c\ncjzkOpnj7Z4GaRPcfsUzac24qQKBgQDXQXs4AfXTvYe8eVBcyVYkMvuMnmK4Rb9x\nDep5Y/yYVQvtpGlIcSRDlTs+F1WNX2TXpBnCUNxzaF0qP/M7nu6OHO/DCICHh4q3\nPWGqD8vKoifFLmYNNYcv3M4L33xmWthnrA22BB/u5LY2zxgMK40YkHeGFEY9mEu2\n5djwpGWx9QKBgQDa9v1JkNJV1zVfpfCw8LL/3/eweIU92HdlPECwZHG5LiKGN0LS\nueSs4ECqiSnVspI4VgPjpgenQhZQC348oqwjow4XYbZz5DU2pgvOIWnlPbjmeqgP\nr47MoIN0330M6TKR8UOMBa0hUXKGy+NRCfgyu+pfvaFkvHRrC/GtHsK2GQKBgQCG\nE4Zhk28AbXx/m/y/XrUmJQ9kPj91UhR1odpbtDjg1ZBxfEgL1FVnNyvIeBZU0Ydp\nfhCBZYZ66BWnvF+P0mX65PE+xSvxvy5bBoOvvtkMJUaqXkU4kw/acylwYcsFoi5L\nHPMJXbZaQeFxcDslUXc4Rrv8KuK5eQQoLzCaa3vghQKBgQCliuwabm6h7iyMua+U\nh11PHSiueNHQxWkT1EWs1NWVcAIRYWWz0ITaf0G9FL/5vS5Tmq30u9yCQTttSPx3\nDzEmYeNiQ7+YFwBzhA7L2GgHQ+WN+orFxYSjh3/9EkTn7MGOuqpwjepXDMNThtr8\nUe7jIsXRvk9p3LMPRrqZZDTHIg==\n-----END PRIVATE KEY-----\n",
    client_email: "ocr-thai@mystical-magnet-409110.iam.gserviceaccount.com",
    client_id: "111806263100274034020",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/ocr-thai%40mystical-magnet-409110.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  })
);

const CONFIG = {
  credentials: {
    private_key: CREDENTIALS.private_key,
    client_email: CREDENTIALS.client_email,
  },
};

const client = new vision.ImageAnnotatorClient(CONFIG);

export const ocrdata = async (req, res) => {
  try {
    const image = req.body.link;
    console.log(image);
    const [result] = await client.textDetection(image);
    console.log(result);
    const idCardInfo = result.fullTextAnnotation.text;
    console.log(idCardInfo);
    // Regular expressions for extracting information
    const idNumberPattern = /(\d+ \d+ \d+ \d+ \d+)/;
    const thaiNamePattern = /ชื่อตัวและชื่อสกุล น\.ส\. (.+?)\n/;
    const englishNamePattern = /Name (.+?)\n/;
    const lastNamePattern = /Last name (.+?)\n/;
    const dobPattern = /Date of Birth (\d+ \S+ \d+)/;
    const issueDatePattern = /วันออกบัตร\n(\d+ \S+ \d+)/;
    const expiryDatePattern = /วันบัตรหมดอายุ\n(\d+ \S+ \d+)/;

    // Extract information using regular expressions
    const idNumberMatch = idCardInfo.match(idNumberPattern);
    const thaiNameMatch = idCardInfo.match(thaiNamePattern);
    const englishNameMatch = idCardInfo.match(englishNamePattern);
    const lastNameMatch = idCardInfo.match(lastNamePattern);
    const dobMatch = idCardInfo.match(dobPattern);
    const issueDateMatch = idCardInfo.match(issueDatePattern);
    const expiryDateMatch = idCardInfo.match(expiryDatePattern);

    // Convert Thai identification number to numerical format
    const thaiIdNumber = idNumberMatch ? idNumberMatch[1] : "";
    const numericalIdNumber = thaiIdNumber.replace(
      /[\u0E50-\u0E59]/g,
      (digit) => digit.charCodeAt(0) - 3660
    );

    // Get the extracted information
    const name = englishNameMatch
      ? englishNameMatch[1]
      : thaiNameMatch
      ? thaiNameMatch[1]
      : "";
    const lastName = lastNameMatch ? lastNameMatch[1] : "";
    const dateOfBirth = dobMatch
      ? moment(dobMatch[1], "DD MMM YYYY").add(1, "day").format("DD MMM YYYY")
      : "";
    const dateOfIssue = issueDateMatch
      ? moment(issueDateMatch[1], "DD MMM YYYY")
          .add(1, "day")
          .format("DD MMM YYYY")
      : "";
    const dateOfExpiry = expiryDateMatch
      ? moment(expiryDateMatch[1], "DD MMM YYYY")
          .add(1, "day")
          .format("DD MMM YYYY")
      : "";

    // Format the information into the specified format
    const formattedData = {
      idNumber: numericalIdNumber,
      fname: name,
      lname: lastName,
      doBirth: dateOfBirth,
      doIssue: dateOfIssue,
      doExpiry: dateOfExpiry,
    };
    // const existingData = await User.findOne({
    //   identification_number: numericalIdNumber,
    // });
    // if (existingData && existingData.isActive === false) {
    //   existingData.isActive = true;
    //   await existingData.save();
    //   return res
    //     .status(200)
    //     .json({ message: "User creation successfull", user: formattedData });
    // }
    // const user = await User.create(formattedData);
    // console.log(formattedData);
    return res
      .status(200)
      .json({ message: "User creation succesfull", user: formattedData });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Provide a valid card" });
  }
};

//-----------------------------------------------
