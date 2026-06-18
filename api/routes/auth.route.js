import User from "../models/user.model.js"
import bcrypt from 'bcrypt'
import express from 'express'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/register', async(req,res)=>{
    try {
        const {username, email, password} = req.body
        const user = await User.findOne({email})
        if (user){
            return res.status(400).json({message:'Cet utilisateur existe déjà'})
        }

        const hash = await bcrypt.hash(password, 10)
    
        await User.create({username,email,password:hash})
        res.status(201).json({message:'Utilisateur créé !'})

    }catch(err) {
        res.status(500).json({message:err})
    }
})

router.post('/login-localstorage', async(req,res)=>{
    console.log(req.body)
    try{
        const {email,password} = req.body
        console.log(email,password)
        const user = await User.findOne({email})
        console.log(user)
        if (!user) {
            return res.status(400).json({message:'Invalides identifiants'})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch){
            return res.status(400).json({message:'Invalides identifiants'})
        }

        const token = jwt.sign(
            {id:user._id, username:user.username},
            process.env.JWT_SECRET,
            {expiresIn:'1h'}
        )
        res.status(200).json({token,message:"Vousêtes connecté !"})


    }catch(err){
        console.log(err)
        res.status(500).json({message:err})
    }
})

function verifyToken(req,res,next){
    try {
        const authHeaders = req.headers.authorization
        const token = authHeaders.split(' ')[1]
        if (!token) {
            return res.status(403).json({message:"token manquant !"})
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decode

        next()
    } catch (err) {
        res.status(500).json({message:err})
    }
}

router.get('/protected',verifyToken, async(req,res)=>{

    res.status(200).json({message:req.user.username})
})
export default router
