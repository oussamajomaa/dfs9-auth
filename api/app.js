import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

import cors from 'cors'

import authRoute from './routes/auth.route.js'

const app = express()
app.use(express.json())
app.use(cors())

app.use('',authRoute)

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

