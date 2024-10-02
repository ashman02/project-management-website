export const typeDefs = `#graphql
    type Task {
        _id : ID!
        name : String!
        description : String
        assignedTo : User!
        assignedBy : User!
        project : ID!
        reviewedBy : User
        endDate : Date
        status : TaskStatus!
        createdAt : Date!
        updatedAt : Date
    }
    
    enum TaskStatus {
        IN PROGRESS
        READY FOR REVIEW
        CHANGE NEEDED
        COMPLETED
    }
`