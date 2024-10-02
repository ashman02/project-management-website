export const typeDefs = `#graphql
    type Project {
        _id : ID!
        name : String!
        description : String
        onwer : User!
        managers : [User]
        members : [User]
        tasks : [Task]
        status : Status!
        endDate : Date 
        createdAt : Date!
        updatedAt : Date
    }
    enum Status {
        IN PROGRESS
        COMPLETED
        ON HOLD
    }
`