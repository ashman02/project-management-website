import { JwtPayload } from "jsonwebtoken"
import { CreateProjectPayload } from "../../utils/types"
import ProjectService from "../../services/project"

const mutations = {
    createProject : async(_ : any, payload : CreateProjectPayload, context : JwtPayload) =>{
        return await ProjectService.createProject(payload, context)
    }
}
const queries = {
    getProject : async (_ : any, payload : {
        projectId : string
    }, context : JwtPayload) => {
        return await ProjectService.getProject(payload.projectId, context)
    }
}

export const resolvers = {
    queries,
    mutations
}