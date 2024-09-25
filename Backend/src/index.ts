import express from "express"
import cors from "cors"
import { expressMiddleware } from "@apollo/server/express4"
import createGraphqlServer from "./graphql"
import dotenv from "dotenv"

dotenv.config({
    path : "./.env"
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
  
  app.use("/graphql", expressMiddleware(await createGraphqlServer()))

  app.listen(process.env.PORT || 8000, () => console.log("App is listening to the post 8000"))
}

