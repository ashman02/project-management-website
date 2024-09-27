export const typeDefs = `#graphql
    type User {
        _id : ID!
        username : String
        fullName : String
        email : String
        avatar : String
        createdAt : Date
        updatedAt : Date
    }
    
    type AuthPayload {
        user : User
        accessToken : String
        refreshToken : String
    }
`