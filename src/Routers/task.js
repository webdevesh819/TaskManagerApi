const express = require('express');
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router();
const User = require('../models/user')

// creating tasks in database
router.post('/tasks',auth,async (req,res)=>{
    //const task = new Task(req.body);

    //console.log(req.body)
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })

    //console.log(task)

    try {
        await task.save();
        res.status(201).send(task);   
    } catch (err) {
        res.status(400).send(err);
    }
})

// reading multiple users tasks data from database
// GET/tasks?completed=true
// limit and skip
// GET/tasks?limit=10&skip=10  // limit = is how many we get in one page ||| skip => number of pages we skip and resulting in page number 
// GET/tasks?sortBy=createdAt:desc
router.get('/tasks',auth,async (req,res)=>{

    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed==='true'
    }

    if(req.query.sortBy){
        const parts=req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]==='desc'?-1:1
    }

   // console.log(match)
    try {
            await req.user.populate({path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }        
        
        })
            res.send(req.user.tasks);

        } catch (error) {
            res.status(500).send();
        }
})

//readind data of unique user using id

router.get('/tasks/:id',auth,async (req,res)=>{
    
    try {
        const _id = req.params.id
        const task = await Task.findOne({ _id , owner : req.user._id})

            if(!task)
            res.status(404).send();
    
            res.send(task);
    } catch (error) {
        res.status(500).send();
    }
    
})

router.patch('/tasks/:id',auth, async (req,res)=>{
    const updates= Object.keys(req.body);
    const allowed=['description','completed'];

    const isValid = updates.every((update)=>allowed.includes(update));

    if(!isValid)
    return res.status(400).send({error:"this is invalid update"});

    try {
        
        //const task = await Task.findById(req.params.id);

        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})

        //const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,useValidators:true})

        if(!task)
        return res.status(404).send()

        updates.forEach((update)=>task[update]=req.body[update]);
        
        await task.save();

        res.send(task)
    } catch (err) {
        return res.status(500).send()
    }

})

router.delete('/tasks/:id',auth,async (req,res)=>{
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id});

        if(!task)
        return res.status(404).send();

        res.send(task)

    } catch (err) {
        return res.status(500).send()
    }
})

module.exports = router