const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const dotenv = require('dotenv');
const colors =require('colors');
const morgan = require('morgan');
const errorMiddleware = require("./middlewares/error.js")
// Config
dotenv.config()

app.use(express.json())
app.use(morgan("dev"))
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());


//routers
const authRouter = require('./routers/authRouter.js');
app.use("/api/v1/user",authRouter)


const schoolRouter = require('./routers/schoolRouter.js');
app.use("/api/v1/school",schoolRouter)


const studentRouter = require('./routers/studentRouter.js');
app.use("/api/v1/student",studentRouter)


const adminRouter = require('./routers/adminRouter.js');
app.use("/api/v1/admin",adminRouter)


const facultyRouter = require('./routers/facultyRouter.js');
app.use("/api/v1/faculty",facultyRouter)

//api
app.get('/',(req,res)=>{
    res.send({
        message:"welcome to gujarat"
    })
})


// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;