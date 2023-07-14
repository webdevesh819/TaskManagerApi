const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const jwtSecret= process.env.JWT_SECRET
// this is the model of the collection (it is like the class , it is a template of document)
// here we define things like name of collection and fields in collection and their datatypes

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
       trim:true
    },
    age:{
        type:Number,
        validate(value){
            if(value<0)
            throw new Error('age must be a +ve number')
        },
        default:0
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes('password'))
            throw new Error("password must not contain 'password' as a substring");
        }
    },
    email:{
        type:String,
        trim:true,
        required:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value))
            throw new Error('wrong email')
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    } 
},{
    timestamps:true
})

    // virtual property => a virtual property is not actual data stored in the data base
    //  its a relationship between two entities   ..... here user and task

userSchema.virtual('tasks',{
    ref:'Task',

    // where that local data is stored
    localField:'_id', 
    //name of the field in other thing
    foreignField:'owner'
})

// statics methods are accessible on models also called model methods
// methods are acesseble on instances also called instance method

userSchema.methods.generateToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()},jwtSecret)

    user.tokens = user.tokens.concat({token})

    await user.save();

    return token;
}

// when we use response .send  express uses stringify the JSOn send the data back
//   toJson allows us to manaipulate the object which is called implicitaly s
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;


}

userSchema.statics.findByCredentials = async (email,password)=>{

    const user = await User.findOne({email});

    if(!user)
    throw new Error("unable to login");

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch)
    {
        throw new Error("unable to login");
    }
        return user;

} 


// this here we r doing something before saving the schema
// first argument is event ans second is the functionality
// here we use 'function' keywotrd because this binding dont work in arrow function 

//hash the plain text password before saving
userSchema.pre('save', async function(next) {
        const user = this;

        if(user.isModified('password'))
        {
            user.password = await bcrypt.hash(user.password,8);
        }

    next();

})

//Delte user tasks when user is removed 
userSchema.pre('remove', async function (next) {
    const user= this
    await Task.deleteMany({owner:user._id})
    next()
})

// next is called when we are done using the functionality it let the function know that 
// any async process that is being done in functionality is done

const User=mongoose.model('User',userSchema)

module.exports= User