const express=require('express')
const Task=require('../models/task')
const auth=require('../middleware/auth')
const User=require('../models/user')
const router=new express.Router()


router.post('/tasks',auth,async (req,res)=>{
    
        try{
            const task=new Task({
                ...req.body,
                owner:req.user._id
            })
            const result=await task.save()
            res.status(201).send(result)

        }catch(error){
            res.status(400).send(error)
        }
    
    
})

router.get('/tasks',auth,async (req,res)=>{
    
    const match={}
    const sort={}
    if(req.query.completed){
        match.completed=req.query.completed==='true'
    }
    if(req.query.sortBy){
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc'?-1:1
    }

        try{
        //    const tasks=await Task.find({owner:req.user._id})
        //    res.send(tasks)
           const user=req.user
           await user.populate({
               path:'tasks',
               match,
               options:{
                   limit:parseInt(req.query.limit),
                   skip:parseInt(req.query.skip),
                   sort
               }
           }).execPopulate()
            res.send(user.tasks)
        
        }catch(error){
            res.status(400).send(error)
        }
   
})

router.get('/tasks/:id',auth,async (req,res)=>{
    
        try{
            const id=req.params.id
            const task=await Task.findOne({_id:id,owner:req.user._id})
            if(!task)
            return res.status(404).send()
            res.send(task)
        }catch(error){
            res.status(500).send(error)
        }
    
})

router.patch('/tasks/:id',auth,async (req,res)=>{
    const allowedUpdates=['description','completed']
    const updates=Object.keys(req.body)

    const isVlaidUpdate=updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isVlaidUpdate)
    return res.status(404).send('no such update field found')

    try{
        //const task=await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})
        updates.forEach((update)=>{
            task[update]=req.body[update]
        })
       
        if(!task)
        return res.status(404).send();
        await task.save()
        res.send(task)
    }catch(error){
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id',auth,async (req,res)=>{
    try{
        const task=await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task)
        res.status(404).send();
        res.send(task)
    }catch(error){
        res.status(500).send()
    }
})

module.exports=router