import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {
        tyep: String
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password:{
        type: String,
        required:true,
        minLength:8,
        trim:true
    }
})

const User = mongoose.model('users',userSchema)
export default User