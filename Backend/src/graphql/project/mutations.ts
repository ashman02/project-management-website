export const mutations = `#graphql
    createProject(name : String!, description : String) : Project
    requestManager(managerId : String!, projectId : String!) : String
    changeProjectStatus(projectId : String!, status : String!) : String
`