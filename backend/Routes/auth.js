const User = require("../Models/User");
const bcrypt = require("bcrypt");

const router = require("express").Router();

// REGISTERING A USER OR SIGN UP
router.post('/register',async (req,res)=>{

    try{
        // hashing the password provided by the user 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password,salt);

        // creating a new User with the data we are getting with the request
        const newUser = new User({
            username : req.body.username,
            email : req.body.email,
            password : hashedPassword
        })

        const user = await newUser.save();
        res.status(200).json(user);
    }catch(err){
        console.log(err);
    }
    
})

// USER LOGIN ROUTE AND PASSWORD VALIDATION AND USER EXISTENCE

router.post('/login',async(req,res)=>{
    try{
        // finding if the user exists or not
        const user = await User.findOne({email:req.body.email});
        // if no user found 
        !user && res.status(404).json("No user with this email found");
        // matching passwords
        const validPassword = await bcrypt.compare(req.body.password,user.password);
        !validPassword && res.status(400).send("You entered wrong password");
        // if user is authentic and authorized
        res.status(200).json(user);

    }catch(err){
        console.log(err);
    }
})

module.exports =  router;