import { JwtPayload } from "jsonwebtoken"
import UserService from "../../services/user"
import {
  AvatarPayload,
  loginPayload,
  RegisterUserPayload,
  VerifyUserPayload,
} from "../../utils/types"

const queries = {
  getCurrentUser: async (_: any, params: any, context: JwtPayload) => {
    return await UserService.getCurrectUser(context)
  },
  checkUniqueUsername: async (_: any, payload: { username: string }) => {
    return await UserService.checkUniqueUsername(payload)
  },
}
const mutations = {
  registerUser: async (_: any, payload: RegisterUserPayload) => {
    return await UserService.registerUser(payload)
  },
  verifyUser: async (_: any, payload: VerifyUserPayload) => {
    return await UserService.verifyUser(payload)
  },
  loginUser: async (_: any, payload: loginPayload) => {
    return await UserService.loginUser(payload)
  },
  refreshAccessToken: async (
    _: any,
    payload: { incomingRefreshToken: string }
  ) => {
    return await UserService.refreshAccessToken(payload)
  },
  logoutUser: async (_: any, para: any, context: JwtPayload) => {
    return await UserService.logoutUser(context)
  },
  updateUserAvatar: async (_: any, avatar : AvatarPayload, context : JwtPayload) => {
    console.log(avatar)
    return await UserService.updateUserAvatar({avatar, userDetails: context})
  }
}

export const resolvers = {
  queries,
  mutations,
}
