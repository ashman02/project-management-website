export const typeDefs = `#graphql
    type User {
        _id : ID!
        username : String
        fullName : String
        email : String
        avatar : Avatar
        createdAt : Date
        updatedAt : Date
    }

    type Avatar {
        fileId : String
        url : String
    }
    
    type AuthPayload {
        user : User
        accessToken : String
        refreshToken : String
    }
`