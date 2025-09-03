const express = require('express');
const router = express.Router();
const User = require('../models/Userschema');
const School = require('../models/Schoolschema');
const auth = require('../middleware/auth');

router.get('/',auth,async(req,res)=>{
    try{
        //get all users with the role of admin
        const users = await User.find({role:'admin'});
        res.status(200).json(users);
    }
    catch(err){
        res.status(500).json({message:err});
    }
})

//delete a user
router.delete('/:id',auth,async(req,res)=>{
    try{
        const removedUser = await User.findByIdAndDelete(req.params.id);
        res.status(200).json(removedUser);
    }
    catch(err){
        res.status(500).json({message:err});
    }
});



module.exports = router;