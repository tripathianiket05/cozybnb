const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
require("dotenv").config();

const MONGO_URL = process.env.ATLAS_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  
  // Attach your Admin User ID to the pre-baked data
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6a3d83bf51c55f52056fb041", // YOUR USER ID!
  }));
  
  // Insert instantly without needing fetch!
  await Listing.insertMany(initData.data);
  console.log("data was initialized successfully with Maps!");
};

initDB();