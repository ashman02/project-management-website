import express from "express"
import cors from "cors"
import { expressMiddleware } from "@apollo/server/express4"
import createGraphqlServer from "./graphql"
import dotenv from "dotenv"
import connectDB from "./db"
import UserService from "./services/user"

dotenv.config({
  path: "./.env",
})

async function init() {
  const app = express()

  app.use(cors())

  app.use(
    express.json({
      limit: "16kb",
    })
  )

  app.use(express.urlencoded({ extended: true, limit: "16kb" }))

  app.use(express.static("public"))

  await connectDB()

  app.use(
    "/graphql",
    expressMiddleware(await createGraphqlServer(), {
      context: async ({ req }) => {
        const accessToken = req.headers["authorization"] as string
        try {
          const user = await UserService.decodeAccessToken(accessToken)
          return { user }
        } catch (error) {
          return {}
        }
      },
    })
  )

  app.listen(process.env.PORT || 8000, () =>
    console.log("App is listening to the post 8000")
  )
}

init()
