import { ContextInterface } from "../../types/types"
import { CreateProjectPayload, ChangeProjectStatus } from "../../types/types"
import ProjectService from "../../services/project"

const mutations = {
  createProject: async (
    _: any,
    payload: CreateProjectPayload,
    context: ContextInterface
  ) => {
    return await ProjectService.createProject(payload, context)
  },
  requestManager: async (
    _: any,
    payload: { managerId: string; projectId: string },
    context: ContextInterface
  ) => {
    return await ProjectService.requestManager(payload, context)
  },
  changeProjectStatus: async (
    _: any,
    payload: ChangeProjectStatus,
    context: ContextInterface
  ) => {
    return await ProjectService.changeProjectStatus(payload, context)
  },
}
const queries = {
  getProject: async (
    _: any,
    payload: {
      projectId: string
    },
    context: ContextInterface
  ) => {
    return await ProjectService.getProject(payload.projectId, context)
  },
  getUserProjects : async (_ : any, params : any, context : ContextInterface) => {
    return await ProjectService.getUserProjects(context)
  }
}

export const resolvers = {
  queries,
  mutations,
}
