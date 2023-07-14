const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const app= express();
const userRouter = require('./Routers/user')
const taskRouter = require('./Routers/task')
const jwt = require('jsonwebtoken')

const port = process.env.PORT

//setup environment variables for heroku
//->in terminal using commanad 'heroku config' to set env var , read env var , delete env var
//->  heroku config:set key=value

// see the variable ->  heroku config

// to remove variables -> heroku config:unset key value

//WHY USE ENVIRONMENT VARIBLE
//1->Security
//2->Customazability

// CLUSTER - is nothing more than Mongodb database with multiple server which can aloow younice low latency around the globe

//=====>C:\Users\shiva\mongodb\bin\mongod.exe --dbpath=/Users/shiva/mongodb-data  <====

// middleware == allows us to run the code just before or after given events occur
// for more mongoose doc middleware

// login authnticator sends a token so that the client have proof of authentication 
// to use other endpoints

// without middleware :   new request => run route handler

// with middleware : new request => do something => run route handler

//it automatically parse incoming json so to acess as an object
// it automatically parse the incoming json to an object so we can acess it in request handler===>{app.post(),app.get() etc}

// FILE UPLOAD

// this option object is to set all rstriction to the uploaded file
// const multer = require ('multer')

// const upload = multer ({dest:'images',

//                         limits:{
//                             fileSize:1000000  //bytes
//                         },
//                         fileFilter (req , file, cb ) //cb->call back{

//                             if(!file.originalname.match(/\.(doc|docx)$/))
//                             return cb(new Error("please upload docx"))

//                             return cb(null,true)
//                         }
// })

// app.post('/upload',upload.single('upload'),(req,res)=>{
//     res.send();
// })

app.use(express.json())
 
app.use(userRouter) 
app.use(taskRouter)

app.listen(port,()=>{
    console.log('server is up on port '+port)
});



//Pagination => It is the idea of creating pages of data that 
// can be requested so you are not fetching everthing all at once