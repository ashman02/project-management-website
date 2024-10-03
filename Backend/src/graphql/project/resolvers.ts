import { JwtPayload } from "jsonwebtoken"
import { ProjectIdPayload, CreateProjectPayload, ChangeProjectStatus } from "../../utils/types"
import ProjectService from "../../services/project"

const mutations = {
    createProject : async(_ : any, payload : CreateProjectPayload, context : JwtPayload) =>{
        return await ProjectService.createProject(payload, context)
    },
    addManager : async (_ : any, payload : ProjectIdPayload, context : JwtPayload) => {
        return await ProjectService.addManager(payload, context) 
    },
    changeProjectStatus : async (_ : any, payload : ChangeProjectStatus, context : JwtPayload) => {
        return await ProjectService.changeProjectStatus(payload, context)
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