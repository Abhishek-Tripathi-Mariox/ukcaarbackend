const mongoose = require("mongoose");

const url = process.env.LOCAL_MONGO_DB;
mongoose.connect(url);

const con = mongoose.connection;

con.on("open", async () => {
  console.log("Connected to database");

  try {
  } catch (error) {
    console.error("Seeder error", { error: error.message });
  }
});

con.on("error", (error) => {
  console.error("Error connecting to database", { error: error.message });
});

module.exports = con;
