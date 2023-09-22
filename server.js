const app = require("./index.js");
const connectDatabase = require("./database/database.js");

process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
  });

connectDatabase();

const PORT=process.env.PORT || 8000;

const server=app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`)
})

process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
  
    server.close(() => {
      process.exit(1);
    });
  });
  