import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {
        type: String
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
    },
    role: {
        type:String,
        required: true,
        default: 'user'
    }
})

const User = mongoose.model('users',userSchema)
export default User