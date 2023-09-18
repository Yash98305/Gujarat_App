const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGO_URL, {
     
    })
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`.yellow.bold);
    });
};

module.exports = connectDatabase;
