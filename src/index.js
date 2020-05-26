const express=require('express')
require('./db/mongoose.js')
const User=require('./models/user')
const Task=require('./models/task')
const userRouter=require('./routers/user')
const tasRouter=require('./routers/task')

const app=express()
const port=process.env.PORT



app.use(express.json())

app.use(userRouter)
app.use(tasRouter)



app.listen(port,()=>{
    console.log(`server is listening on port ${port}`);
    
})

//////////////////////////////******PLAYGROUND*******//////////////////////

// const bcrypt=require('bcrypt')
// const jwt=require('jsonwebtoken')

// const myFunction=async ()=>{
//     // const task=await Task.findById("5ecb79f80f447559f4e65b57")
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner)

//     const user=await User.findById("5ecb78711b65bf54b42855f5")
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }
// myFunction()
