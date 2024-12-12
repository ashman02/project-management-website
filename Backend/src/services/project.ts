import { GraphQLError } from "graphql"
import { CreateProjectPayload, ChangeProjectStatus } from "../types/types"
import ProjectModel from "../models/project.model"
import RequestModel from "../models/notification.model"
import { ContextInterface } from "../types/types"
import mongoose from "mongoose"
import { NotificationEventEnum } from "../constants"
import { emitSocketEvent } from "../socket"

class ProjectService {
  public static async createProject(
    payload: CreateProjectPayload,
    userDetails: ContextInterface
  ) {
    const { name, description } = payload
    try {
      if (!userDetails || !userDetails.user) {
        throw new GraphQLError("Unauthorized request")
      }

      if (!name) throw new GraphQLError("Name is required")

      const project = await ProjectModel.create({
        name,
        description,
        owner: userDetails.user._id,
        managers: [userDetails.user._id],
        members: [userDetails.user._id],
      })
      return project
    } catch (error) {
      if (error instanceof GraphQLError) throw error
      console.log("error while creating project", error)
      throw new GraphQLError("Unexpected error occured while creating project")
    }
  }

  public static async getProject(
    projectId: string,
    userDetails: ContextInterface
  ) {
    try {
      if (!userDetails || !userDetails.user) {
        throw new GraphQLError("Unauthorized request")
      }

      const project = await ProjectModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(projectId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "members",
            foreignField: "_id",
            as: "members",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "managers",
            foreignField: "_id",
            as: "managers",
          },
        },
        {
          $lookup: {
            from: "tasks",
            localField: "tasks",
            foreignField: "_id",
            as: "tasks",
          },
        },
        {
          $addFields: {
            owner: {
              $first: "$owner",
            },
          },
        },
      ])
      return project[0]
    } catch (error) {
      if (error instanceof GraphQLError) throw error
      console.log("error while getting project", error)
      throw new GraphQLError("Unexpected error occured while getting project")
    }
  }

  //user member or user owner you can decide but as of now go with memeber
  public static async getUserProjects(context: ContextInterface) {
    try {
      const { user } = context
      if (!user) throw new GraphQLError("Unauthorized request")

      const projects = await ProjectModel.aggregate([
        {
          $match: {
            members: { $in: [new mongoose.Types.ObjectId(user._id)] },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  username: 1,
                  fullName: 1,
                  avatar: 1,
                  email: 1,
                },
              },
            ],
          },
        },
        {
          $addFields: {
            owner: {
              $first: "$owner",
            },
          },
        },
      ])

      if(!projects.length) throw new GraphQLError("No projects found")
        console.log(projects)

      return projects

    } catch (error) {
      if (error instanceof GraphQLError) throw error
      console.log("error while getting user projects", error)
      throw new GraphQLError("Unexpected error occured while getting user projects")
    }
  }

  public static async requestManager(
    payload: { managerId: string; projectId: string },
    context: ContextInterface
  ) {
    try {
      const { managerId, projectId } = payload
      const { user, io } = context
      if (!user || !io) {
        throw new GraphQLError("Unauthorized request")
      }
      const project = await ProjectModel.findById(projectId)
      if (!project) throw new GraphQLError("Project not found")
      if (!project.managers.includes(new mongoose.Types.ObjectId(user._id))) {
        throw new GraphQLError("You are not a manager of this project")
      }
      if (project.managers.includes(new mongoose.Types.ObjectId(managerId))) {
        throw new GraphQLError("User is already a manager of this project")
      }

      const notification = await RequestModel.create({
        message: `You have been requested to be a manager of ${project.name}`,
        to: managerId,
        from: user._id,
        type: "MANAGER_REQUEST",
        projectId,
      })

      emitSocketEvent(
        io,
        managerId,
        NotificationEventEnum.NOTIFICATION_RECEIVED_EVENT,
        notification
      )

      return "Request sent successfully"
    } catch (error) {
      if (error instanceof GraphQLError) throw error
      console.log("error while adding manager", error)
      throw new GraphQLError(
        "Unexpected error occured while requesting manager"
      )
    }
  }

  //request acceptance logic should be in a different file
  public static async addManager(
    payload: { projectId: string; managerId: string; notificationId: string },
    context: ContextInterface
  ) {
    const { projectId, managerId, notificationId } = payload
    const { user, io } = context
    try {
      if (!user || !io) {
        throw new GraphQLError("Unauthorized request")
      }

      const userId = new mongoose.Types.ObjectId(user._id)

      const project = await ProjectModel.findById(projectId)
      if (!project) throw new GraphQLError("Project not found")

      await RequestModel.findByIdAndUpdate(notificationId, {
        status: "ACCEPTED",
      })

      if (project.managers.includes(userId)) {
        throw new GraphQLError("You are already a manager of this project")
      }

      project.managers.push(userId)
      if (!project.members.includes(userId)) {
        project.members.push(userId)
      }

      //create a notification for manager to inform someone has accepted their request
      const notification = await RequestModel.create({
        message: `${user.username} has accepted your request to be a manager of ${project.name}`,
        to: managerId,
        from: userId,
        projectId,
        status: "ACCEPTED",
        type: "GENERAL",
      })

      emitSocketEvent(
        io,
        managerId,
        NotificationEventEnum.NOTIFICATION_RECEIVED_EVENT,
        notification
      )

      return `You are now a manager of ${project.name}`
    } catch (error) {
      if (error instanceof GraphQLError) throw error
      console.log("error while adding manager", error)
      throw new GraphQLError("Unexpected error occured while adding manager")
    }
  }

  public static async changeProjectStatus(
    payload: ChangeProjectStatus,
    userDetails: ContextInterface
  ) {
    const { projectId, status } = payload
    try {
      if (!userDetails || !userDetails.user) {
        throw new GraphQLError("Unauthorized request")
      }
      const project = await ProjectModel.findById(projectId)
      if (!project) throw new GraphQLError("Project not found")
      if (
        !project.managers.includes(
          new mongoose.Types.ObjectId(userDetails.user._id)
        )
      ) {
        throw new GraphQLError("You are not a manager of this project")
      }
      project.status = status
      if (status !== "In Progress") {
        project.endDate = new Date()
      }
      await project.save({ validateBeforeSave: false })
      return `Status of ${project.name} has been changed to ${status}`
    } catch (error) {
      if (error instanceof GraphQLError) throw error
      console.log("error while changing status", error)
      throw new GraphQLError("Unexpected error occured while changing status")
    }
  }
}

export default ProjectService
