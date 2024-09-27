import { GraphQLError } from "graphql"
import { UserModel } from "../models/user.model"
import bcrypt from "bcrypt"
import { sendVerificationEmail } from "../utils/sendVerificationCode"
import {
  JwtGeneratePayload,
  loginPayload,
  RegisterUserPayload,
  VerifyUserPayload,
} from "../utils/types"
import jwt, { JwtPayload } from "jsonwebtoken"

class UserService {
  private static async generateAccessToken(payload: JwtGeneratePayload) {
    const { _id, username, email, fullName } = payload

    const accessToken = jwt.sign(
      {
        _id,
        username,
        email,
        fullName,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    )
    const refreshToken = jwt.sign(
      {
        _id,
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    )

    return { accessToken, refreshToken }
  }

  // you can improve this by fetching original user from the database and checking if it exists
  public static async decodeAccessToken(accessToken: string) {
    return jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string)
  }

  public static async registerUser(payload: RegisterUserPayload) {
    const { username, email, password, fullName } = payload

    try {
      if (!username || !email || !password) {
        throw new GraphQLError("All fields are required")
      }

      // check for email availabilty
      const userWithEmail = await UserModel.findOne({ email })
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

      if (userWithEmail) {
        if (userWithEmail.isVerified) {
          throw new GraphQLError("User with this email already exists", {
            extensions: {
              code: "USER_WITH_EMAIL_ALREADY_EXISTS",
            },
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
      } else {
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

      const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
      )

      if (!emailResponse) {
        throw new GraphQLError("Unable to send verification email")
      }
      return "Verification email sent to your email. Please verify your email"
    } catch (error) {
      if (error instanceof GraphQLError) throw error
      console.log("error while creating user", error)
      throw new GraphQLError("Unexpected error occured while creating user")
    }
  }

  public static async verifyUser(payload: VerifyUserPayload) {
    const { verifyCode, username } = payload

    try {
      const decodedUsername = decodeURIComponent(username)

      const user = await UserModel.findOne({ username: decodedUsername })

      if (!user) {
        throw new GraphQLError("User not found")
      }

      const isValid = user.verifyCode === verifyCode
      const isNotExpired = user.verifyCodeExpiry > new Date()

      if (!isValid) {
        throw new GraphQLError("Invalid verification code")
      }

      if (!isNotExpired) {
        throw new GraphQLError("Verification code is expired")
      }

      user.isVerified = true
      const { accessToken, refreshToken } = await this.generateAccessToken({
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      })
      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {
        user,
        accessToken,
        refreshToken,
      }
    } catch (error) {
      if (error instanceof GraphQLError) throw error
      console.log("error while verifying user", error)
      throw new GraphQLError("Unexpected error occured while verifying user")
    }
  }

  public static async loginUser(payload: loginPayload) {
    const { username, email, password } = payload
    try {
      if (!username && !email) {
        throw new GraphQLError("You can't leave both username and email empty")
      }
      const user = await UserModel.findOne({
        $or: [{ email }, { username }],
      })

      if (!user) {
        throw new GraphQLError("User not found")
      }

      if (!user.isVerified) {
        throw new GraphQLError("Please verify your email or sign up again")
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password)

      if (!isPasswordCorrect) {
        throw new GraphQLError("Password do not match")
      }

      const { accessToken, refreshToken } = await this.generateAccessToken({
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      })

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {
        user,
        accessToken,
        refreshToken,
      }
    } catch (error) {
      if (error instanceof GraphQLError) throw error
      console.log("error while login user", error)
      throw new GraphQLError("Unexpected error occured while login user")
    }
  }

  public static async refreshAccessToken(payload: {
    incomingRefreshToken: string
  }) {
    const { incomingRefreshToken } = payload
    try {
      if (!incomingRefreshToken) {
        throw new GraphQLError("Refresh token is required")
      }

      const decodedRefreshToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as JwtPayload

      const user = await UserModel.findById(decodedRefreshToken._id)

      if (!user) {
        throw new GraphQLError("Invalid refresh token")
      }

      if (incomingRefreshToken !== user.refreshToken) {
        throw new GraphQLError("Refresh token expired or used")
      }

      const { accessToken, refreshToken } = await this.generateAccessToken({
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      })

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {
        user,
        accessToken,
        refreshToken,
      }
    } catch (error) {
      if (error instanceof GraphQLError) throw error
      console.log("error while refreshing access token", error)
      throw new GraphQLError(
        "Unexpected error occured while refreshing access token"
      )
    }
  }

  public static async logoutUser(context: JwtPayload) {
    try {
      if (!context || !context.user) {
        throw new GraphQLError("Unauthorized request - please login to logout")
      }

      await UserModel.findByIdAndUpdate(
        context.user._id,
        {
          $unset: {
            refreshToken: 1,
          },
        },
        { new: true }
      )

      return "User logged out successfully"
    } catch (error) {
      if(error instanceof GraphQLError) throw error
      console.log("error while logging out user", error)
      throw new GraphQLError("Unexpected error occured while logging out user")
    }
  }
  
  public static async getCurrectUser(context : JwtPayload){
    try {
      if(!context || !context.user){
        throw new GraphQLError("Unauthorized request")
      }

      const user = await UserModel.findById(context.user._id)
      return user
    } catch (error) {
      if(error instanceof GraphQLError) throw error
      console.log("error while getting current user", error)
      throw new GraphQLError("Unexpected error occured while getting current user")
    }
  }
}

export default UserService
