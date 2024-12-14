import { GraphQLError } from "graphql"

const throwError = (error : unknown) => {
    if(error instanceof GraphQLError) throw error
    console.log("error while getting user requests", error)
    throw new GraphQLError("Unexpected error occured while getting user requests")
}

export default throwError