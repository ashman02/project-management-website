export const mutations = `#graphql
    createProject(name : String!, description : String) : String
    addManager(projectId : String!) : String
    changeProjectStatus(projectId : String!, status : String!) : String
`