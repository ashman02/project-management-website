export const typeDefs = `#graphql
    type Request {
        _id : ID!
        message : String!
        to : ID!
        from : ID!
        projectId : ID!
        status : RequestStatus!
        type : RequestType!
        expireAt : Date!
        createdAt : Date!
        updatedAt : Date
    }
    enum RequestStatus {
        PENDING
        ACCEPTED
        REJECTED
    }
    enum RequestType {
        MANAGER_REQUEST
        TASK_REQUEST
        MEMBER_REQUEST
        GENERAL
    }    
    `