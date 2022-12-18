const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const userRouter = require('./Routes/users');
const authRouter = require('./Routes/auth');
const postRouter = require('./Routes/posts');
const cors = require('cors');
const multer = require('multer');
const path = require("path");

// Connecting the application to the database
dotenv.config();
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(res =>{
    console.log("Connected successfully");
  }).catch(err=>{
    console.log(err.message);
  })

// creating the express server
const app = express();

app.use("/images",express.static(path.join(__dirname,"public/images")));
// Using middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  // res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// Code and route for uploading files
const storage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null,"public/images")
  },
  filename: (req,file,cb) => {
    cb(null,req.body.name)
  }
})
const upload = multer({storage});
app.post('/api/upload',upload.single("file"),(req,res)=>{
  try{
    return res.status(200).json("File uploaded successfully");
  } catch(err){
    console.log(err);
  }
})


// Handling the routes
app.use('/api/users',userRouter);
app.use('/api/auth',authRouter);
app.use('/api/posts',postRouter);


// listening on port 8080
app.listen(8080,()=>{
    console.log("Backend server is ready yessss!!!")
})