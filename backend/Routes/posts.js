const router = require("express").Router();
const { urlencoded } = require("express");
const { updateOne } = require("../Models/Post");
const Post = require("../Models/Post");
const User = require("../Models/User");

// Post something
router.post('/',async(req,res)=>{
    const newPost = new Post(req.body);
    try{
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    }catch(err){
        res.status(500).json(err);
    }
})

// Update a post
router.put('/update/:id', async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            try{
                const updatedPost = await post.updateOne({$set:req.body});
                res.status(200).json(updatedPost);
            }catch(err){
                res.status(500).json(err);
            }
        }else{
            res.status(403).json("You cannot edit somebody else's post");
        }
    }catch(err){
        res.status(500).json(err);
    }
})

// Delete a post
router.delete('/delete/:id',async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            try{
                await post.deleteOne();
                res.status(200).json("Your post was deleted successfully");
            }catch(err){

            }
        }else{
            res.status(403).json("You can only delete your posts");
        }
    }catch(err){
        res.status(500).json(err);
    }
})

// Like a post 
router.put('/like/:id',async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)){
            try{
                await post.updateOne({$push:{likes:req.body.userId}});
                res.status(200).json("Liked the post successfully");
            }catch(err){
                res.status(500).json(err);
            }
        }else{
            try{
                await post.updateOne({$pull:{likes:req.body.userId}});
                res.status(200).json("You disliked this post");
            }catch(err){
                res.status(500).json(err);
            }
        }
    }catch(err){
        res.status(500).json(err);
    }
})

//get a post
router.get('/:id',async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    }catch(err){
        res.status(500).json(err);
    }
})

//get timeline posts
router.get('/timeline/allposts/:userId',async(req,res)=>{
    console.log("HITTED THE SERVER");
    try{
        const user = await User.findById(req.params.userId);
        var allPosts = [];
        console.log("Found in user database");
        const usersPost = await Post.find({userId:req.params.userId});
        console.log(usersPost.length);
        allPosts = [...usersPost];
        console.log(allPosts);
        
        // const friendsPost = await Promise.all(
        //     user.followings.map(friendId =>{
        //         return Post.findById({userId:friendId});
        //     })
        // )
        for(var i = 0; i < user.following.length; i++){
            const postOfOneUser = await Post.find({userId:user.following[i]});
            allPosts = [...allPosts,...postOfOneUser];
        }
        res.status(200).json(allPosts);
    }catch(err){
        res.status(500).json(err);
    }
})

// get only user's own posts
router.get('/profile/:userLoginId', async(req,res)=>{
    try{
        const usersAllPost = await Post.find({userId:req.params.userLoginId});
        res.status(200).json(usersAllPost);
    }catch(err){
        res.status(500).json(err);
    }
})


module.exports = router;