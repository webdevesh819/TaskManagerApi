const express = require('express');
const User = require('../models/user')
const router = new express.Router();
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeMail, sendDeleteMail } = require('../emails/account')

//creatinguser in databae/signup
router.post('/users', async (req, res) => {

    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateToken();

        await sendWelcomeMail(user.email, user.name);
        res.status(201).send({ user, token });
    } catch (err) {
        res.status(400).send(err.message);
    }

})

// login user

router.post('/users/login', async (req, res) => {

    try {

        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken();

        res.send({ user, token });

    } catch (err) {
        res.status(500).send();
    }

})

router.post('/users/logout', auth, async (req, res) => {
    try {


        req.user.tokens = req.user.tokens.filter((token) => { return token.token !== req.token })
        await req.user.save();

        //console.log(req.user)

        res.send()
    } catch (err) {
        res.status(500).send()
    }
})

// logout All 

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];

        await req.user.save();

        res.send();

    } catch (err) {
        res.status(500).send()
    }
})



// reading user's data from database

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    //console.log(req.user)


    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {

        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        // findbyidandupdate bypasses mongoose => it performs a direct operation on the database thats why we need to
        // explicitly set validator option for this
        // so we do traditional mongoose way

        // const user = await User.findById(req.params.id);

        updates.forEach((update) => {
            // [] notation to get value dynamically
            req.user[update] = req.body[update];
        })

        await req.user.save();

        res.send(req.user)
    } catch (e) {
        return res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id);

        // if(!user)
        // return res.status(404).send();
        await req.user.remove();
        await sendDeleteMail(req.user.email, req.user.name)
        res.send(req.user)

    } catch (err) {
        return res.status(500).send()
    }
})


// Uploading avatar


//upload here is instance of multer

const upload = multer(/*options object=>*/{

    // we cana set multiple type of limits
    limits: {
        fileSize: 1000000
    },

    // req=> contain request made
    // file=>has info about file 
    // cb=> its a call back to tell we are done
    fileFilter(req, file, cb) {

        // in regular expression \. is used to escape . then we list out the files we can accept then end it with $

        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) //<= this is regular expression to filter the file type
            return cb(new Error('Please upload jpg,jpeg,png file'))


        return cb(null, true)
    }
});


// single returns middleware 
// we use form data to send binary data
// the key must match the string used in single method of mutlter object
//now just chose file and set the req


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    // we pass data to sharp apply methods and customized it to buffer and save it in DB
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    // buffer contains all binary data of file  we can manipulate it using methoda of sharp
    req.user.avatar = buffer;

    await req.user.save();
    res.status(200).send();


}, (error, req, res, next) => {
    // this would send customized HTML error 
    // it would send errors in middleware if any 
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {

    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error();
        }
        // here we are setting response header 
        // set take two values key value paper
        // content type sets the type of data we are sending
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }
    catch (e) {
        res.send()
    }
})

// deleting avatar

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save()
    res.status(200).send();
})

module.exports = router