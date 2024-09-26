import mongoose, {Schema, Document} from "mongoose";

export interface UserInterface extends Document {
    _id : string;
    username : string;
    fullName : string;
    email : string;
    password : string;
    avatar : string;
    verifyCode : string;
    isVerified : boolean;
    verifyCodeExpiry : Date;
    refreshToken : string;
    createdAt : Date;
    updatedAt : Date
    generateAccessToken() : string
    generateRefreshToken() : string
}

const userSchema : Schema<UserInterface> = new Schema({
    username : {
        type : String,
        required : [true, "Username is required"],
        unique : true,
        trim : true
    },
    fullName : {
        type : String,
    },
    email : {
        type : String,
        required : [true, "Email is required"],
        unique : true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    password : {
        type : String,
        required : [true, "Password is required"]
    },
    avatar : {
        type : String,
        default : "https://res.cloudinary.com/cforchobar/image/upload/v1717658011/memory-map/default-avatar_y7fhqs.png"
    },
    verifyCode : {
        type : String,
        required : [true, "Verify Code is required"],
    },
    verifyCodeExpiry : {
        type : Date,
        required : [true, "Verify Code Expiry is required"],
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    refreshToken : {
        type : String
    }
}, {timestamps : true})

export const UserModel = mongoose.model<UserInterface>("User", userSchema)