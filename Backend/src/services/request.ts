import { GraphQLError } from "graphql"
import { ContextInterface, RequestPayloadInterface } from "../types/types"
import mongoose from "mongoose"
import ProjectModel from "../models/project.model"
import RequestModel from "../models/notification.model"
import { emitSocketEvent } from "../socket"
import { NotificationEventEnum } from "../constants"
import throwError from "../utils/throwError"

class RequestService {
  public static async getUserRequests(context: ContextInterface) {
    try {
      const { user } = context
      if (!user) throw new GraphQLError("Unauthorized request")

      const requests = await RequestModel.find({ to: user._id })
      if (!requests.length) throw new GraphQLError("No requests in last 24 hours")
      return requests
    } catch (error) {
      throwError(error)
    }
  }

  public static async acceptManagerRequest(
    payload: RequestPayloadInterface,
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

      await project.save({validateBeforeSave : false})

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
      throwError(error)
    }
  }
}

export default RequestService
