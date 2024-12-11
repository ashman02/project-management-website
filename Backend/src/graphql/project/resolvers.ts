import { ContextInterface } from "../../types/types"
import { ProjectIdPayload, CreateProjectPayload, ChangeProjectStatus } from "../../types/types"
import ProjectService from "../../services/project"

const mutations = {
    createProject : async(_ : any, payload : CreateProjectPayload, context : ContextInterface) =>{
        return await ProjectService.createProject(payload, context)
    },
    addManager : async (_ : any, payload : ProjectIdPayload, context : ContextInterface) => {
        return await ProjectService.addManager(payload, context) 
    },
    changeProjectStatus : async (_ : any, payload : ChangeProjectStatus, context : ContextInterface) => {
        return await ProjectService.changeProjectStatus(payload, context)
    }
}
const queries = {
    getProject : async (_ : any, payload : {
        projectId : string
    }, context : ContextInterface) => {
        return await ProjectService.getProject(payload.projectId, context)
    }
}

export const resolvers = {
    queries,
    mutations
}