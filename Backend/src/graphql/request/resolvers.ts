import RequestService from "../../services/request";
import { ContextInterface, RequestPayloadInterface } from "../../types/types";

const mutations = {
    acceptManagerRequest : async (_ : any, payload : RequestPayloadInterface, context : ContextInterface) => {
        return await RequestService.acceptManagerRequest(payload, context)
    }
}

const queries = {
    getUserRequests : async (_ : any, params : any, context : ContextInterface) => {
        return await RequestService.getUserRequests(context)
    }
}

export const resolvers = {
    queries, 
    mutations
}