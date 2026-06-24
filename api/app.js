import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
dotenv.config()

import cors from 'cors'

import authRoute from './routes/auth.route.js'

const app = express()
app.use(cookieParser())
app.use(express.json())
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}))
// app.use('/api/uploads', express.static('uploads'))

app.use('/uploads', express.static('uploads'))

app.use('',authRoute)

console.log(process.env.EMAIL_PASS)
// Établir une connexion vers MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(()=> {
    console.log('Connecté à la BDD')
    app.listen(PORT, ()=>{
    console.log('Server tourne !')
})
})
.catch(err =>{
    console.log(err)
})

const PORT = process.env.PORT || 3000

