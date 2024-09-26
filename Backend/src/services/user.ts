import { GraphQLError } from "graphql"
import { UserModel } from "../models/user.model"
import bcrypt from "bcrypt"
import { sendVerificationEmail } from "../utils/sendVerificationCode"
import { JwtPayload, RegisterUserPayload, VerifyUserPayload } from "../utils/types"
import jwt from "jsonwebtoken"



class UserService {

    private static async generateAccessToken(payload : JwtPayload){
        const {_id, username, email, fullName} = payload

        const accessToken = jwt.sign(
            {
                _id,
                username,
                email,
                fullName
            },
            process.env.ACCESS_TOKEN_SECRET as string,
            {
                expiresIn : process.env.ACCESS_TOKEN_EXPIRY
            }
        )
        const refreshToken = jwt.sign(
            {
                _id,
            },
            process.env.REFRESH_TOKEN_SECRET as string,
            {
                expiresIn : process.env.REFRESH_TOKEN_EXPIRY
            }
        )

        return {accessToken, refreshToken}
    }

    public static async registerUser(payload : RegisterUserPayload){
        const {username,email, password, fullName} = payload

        try {
            if(!username || !email || !password){
                throw new GraphQLError("All fields are required")
            }

            // check for email availabilty 
            const userWithEmail = await UserModel.findOne({email})
            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

            if(userWithEmail){
                if(userWithEmail.isVerified){
                    throw new GraphQLError("User with this email already exists", {
                        extensions :{
                            code : "USER_WITH_EMAIL_ALREADY_EXISTS",
                        }
                    })
                } else {
                    const hashedPassword = await bcrypt.hash(password, 10)
                    userWithEmail.password = hashedPassword
                    userWithEmail.username = username
                    userWithEmail.fullName = fullName || ""
                    userWithEmail.verifyCode = verifyCode
                    userWithEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                    await userWithEmail.save()
                }
            } else{
                const hashedPassword = await bcrypt.hash(password, 10)
                const expiryDate = new Date()
                expiryDate.setHours(expiryDate.getHours() + 1)

                const newUser = await UserModel.create({
                    username,
                    email,
                    fullName,
                    password: hashedPassword,
                    verifyCode,
                    verifyCodeExpiry: expiryDate,
                })
            }

            const emailResponse = await sendVerificationEmail(email, username, verifyCode)

            if(!emailResponse){
                throw new GraphQLError("Unable to send verification email")
            }
            return "Verification email sent to your email. Please verify your email"

        } catch (error) {
            if(error instanceof GraphQLError) throw error
            console.log("error while creating user", error)
            throw new GraphQLError("Unexpected error occured while creating user")
        }
    }

    public static async verifyUser(payload : VerifyUserPayload){
        const {verifyCode, username} = payload

        try {
            const decodedUsername = decodeURIComponent(username)

            const user = await UserModel.findOne({username : decodedUsername})

            if(!user){
                throw new GraphQLError("User not found")
            }

            const isValid = user.verifyCode === verifyCode
            const isNotExpired = user.verifyCodeExpiry > new Date()

            if(!isValid){
                throw new GraphQLError("Invalid verification code")
            }

            if(!isNotExpired){
                throw new GraphQLError("Verification code is expired")
            }

            user.isVerified = true
            const {accessToken, refreshToken} = await this.generateAccessToken({
                _id : user._id,
                username : user.username,
                email : user.email,
                fullName : user.fullName
            })
            user.refreshToken = refreshToken
            await user.save({validateBeforeSave : false})

            return {
                user,
                accessToken,
                refreshToken
            }

        } catch (error) {
            if(error instanceof GraphQLError) throw error
            console.log("error while verifying user", error)
            throw new GraphQLError("Unexpected error occured while verifying user")
        }
    }
}

export default UserService