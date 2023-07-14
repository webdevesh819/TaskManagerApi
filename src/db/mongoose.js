const mongoose = require('mongoose')
// at the end of connection url we mentioned the name of datbase 
// which woul;d beee implicitally created 
const connectionURL = process.env.MONGODB_URL


// this is to connect moongoose to data - base 

mongoose.connect(connectionURL,{
    useNewUrlParser:true,
    // useCreateIndex:true,
    // useFindAndModify:false
})


// this is the instance of the model ,it is the document that would be created and storred
// in the collection

// 