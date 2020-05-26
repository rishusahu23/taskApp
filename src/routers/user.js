const express=require('express')
const sharp=require('sharp')
const User=require('../models/user')
const auth=require('../middleware/auth')
const multer=require('multer')
const {sendWelcomeEmail,sendDeleteAccountEmail}=require('../emails/account')

const router=new express.Router()



router.post('/users',async (req,res)=>{
    try{
        const user=new User(req.body)
        sendWelcomeEmail(user.email,user.name)
        await user.save()
        const token=await user.generateAuthToken()
        
        res.status(201).send({user,token})
    }catch(error){
        res.status(400).send(error)
    }
})

router.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((data)=>{
            return data.token!=req.token
        })
        await req.user.save()
        res.send()
    }catch(error){
        res.status(500).send(error)
    }
})

router.post('/users/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/users/me',auth,(req,res)=>{
    res.send(req.user)
})



router.patch('/users/me',auth,async (req,res)=>{

    const updates=Object.keys(req.body)
    const allowedUpdates=['name','age','email','password']

    const isValidOperation=updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation)
    return res.status(400).send('not valid updates')

    try{
        // const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        //const user=await User.findById(req.params.id)
        updates.forEach((update)=>{
             req.user[update]=req.body[update]
        })
        
        await req.user.save()
        // if(!user)
        // return res.status(404).send("no user")
        res.send(req.user)
    }catch(error){
        res.status(400).send(error)
    }
})

router.post('/users/login',async (req,res)=>{
   try{
    const user=await User.findUserWithCredintials(req.body.email,req.body.password)
    const token=await user.generateAuthToken()
    //console.log(token)
    res.send({user,token})
   }catch(e){
       res.status(404).send('unable to login')
   }
})

router.delete('/users/me',auth,async (req,res)=>{
    try{
        await req.user.remove()
        sendDeleteAccountEmail(req.user.email,req.user.name)
        res.send(req.user)
       // sendDeleteAccountEmail(req.user.email,req.user.name)
    }catch(error){
        res.status(500).send()
    }
})

const upload=multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        return cb(new Error('file uploaded must be jpg or jpeg or png'))
        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.status(201).send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user=await User.findById(req.params.id)

        if(!user||!user.avatar)
        throw new Error()
        res.set('content-type','image/png')
        res.send(user.avatar)
    }catch(error){
        res.status(404).send()
    }
})


module.exports=router