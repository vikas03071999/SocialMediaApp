const User = require("../Models/User");
const bcrypt = require("bcrypt");
const { findByIdAndUpdate, findByIdAndDelete } = require("../Models/User");
const router = require("express").Router();

// update a user
router.put("/:id", async(req,res)=>{
    if(req.body.userId == req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password,salt);
            }catch(err){
                res.status(500).json("Error updating password, please try after sometime")
            }
        }
        try{
            const user = await findByIdAndUpdate(req.params.id,{
                $set : req.body
            });
            res.status(200).json("Updated successfully !!!");
        }catch(err){
            res.status(500).send(err);
        }
    }else{
        res.status(403).json("You are not allowed to update this account");
    }
})

// delete a user

router.delete("/:id",async(req,res)=>{
    if(req.body.userId == req.params.id || req.body.isAdmin){
        try{
            const user = await findByIdAndDelete(req.params.id);
            res.status(200).json("Account deleted successfully");
        }catch(err){
            res.status(500).send(err);
        }
    }else{
        res.status(403).json("You can only delete your account");
    }
})

// get a user
router.get("/:id",async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
    }catch(err){
        res.status(500).json(err);
    }
})

// get users friend
router.get("/friends/:userId",async(req,res)=>{
    try{
        const user = await User.findById(req.params.userId);
        const friends = [];
        for(let i=0;i<user.following.length;i++){
            const friend = await User.findById(user.following[i]);
            friends.push(friend);
        }
        res.status(200).json(friends);
    }catch(err){
        res.status(500).json(err);
    }
})

// follow a user 
router.put('/follow/:id',async(req,res) =>{
    if(req.body.userId !== req.params.id){ // params id is the id of the user that we want to follow
        try{
            const user = await User.findById(req.params.id);
            const currUser = await User.findById(req.body.userId);
            if(!currUser.following.includes(req.params.id)){
                try{
                    await user.updateOne({$push:{followers:req.body.userId}});
                    await currUser.updateOne({$push:{following:req.params.id}});
                    res.status(200).json("Followed successfully");
                }
                catch(err){
                    res.status(500).json(err);
                }
            }else{
                res.status(403).json("You are already following this user");
            }
        }
        catch(err){
            res.status(500).json(err);
        }
    }
    else{
        res.status(403).json("You cannot follow yourself");
    }
})
// unfollow a user

router.put('/unfollow/:id',async(req,res)=>{
    if(req.body.userId !== req.params.id){ // check if both the user are same
        try{
            const userToUnfollow = await User.findById(req.params.id);
            const userWhoIsUnfollowing = await User.findById(req.body.userId);
            if(userWhoIsUnfollowing.following.includes(req.params.id)){ // check if the current user is already following or not
                try{
                    await userToUnfollow.updateOne({$pull:{followers:req.body.userId}}); // removing followers of the user
                    await userWhoIsUnfollowing.updateOne({$pull:{following:req.params.id}}); // removing following of the current user
                }
                catch(err){
                    res.status(500).json(err);
                }
            }else{
                res.status(403).json("You have not followed this user");
            }
        }catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(403).json("You cannot unfollow yourself");
    }
})

module.exports =  router;