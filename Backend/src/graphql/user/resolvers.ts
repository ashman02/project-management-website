import UserService from "../../services/user"
import { RegisterUserPayload, VerifyUserPayload } from "../../utils/types"

const queries = {}
const mutations = {
    registerUser : async (_ : any, payload : RegisterUserPayload) => {
        return await UserService.registerUser(payload)
    },
    verifyUser : async(_ :any, payload : VerifyUserPayload) => {
        return await UserService.verifyUser(payload)
    }
}

export const resolvers = {
    queries,
    mutations
}