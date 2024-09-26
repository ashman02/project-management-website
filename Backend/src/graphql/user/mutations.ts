export const mutations = `#graphql
    registerUser(username : String!, email : String!, password : String!, fullName : String) : String
    verifyUser(verifyCode : String!, username : String!) : User
`