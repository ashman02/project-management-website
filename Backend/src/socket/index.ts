import { ChatEventEnum } from "../constants"
import cookie from "cookie"
import jwt from "jsonwebtoken"
import { UserModel } from "../models/user.model"
import { Server, Socket } from "socket.io"
import { JwtGeneratePayload } from "../types/types"
import { GraphQLError } from "graphql"

const mountJoinChatEvent = (socket: Socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    console.log("User joined the chat", chatId)
    socket.join(chatId)
  })
}

const mountParticipantTypingEvent = (socket: Socket) => {
  socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId)
  })
}

const mountParticipantStoppedTypingEvent = (socket: Socket) => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId)
  })
}

const InitializeSocketIO = (io: Server) => {
  return io.on("connection", async (socket) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "")
      let token = cookies?.accessToken || socket.handshake.auth?.token
      console.log("Access token found", token)

      if (!token) {
        throw new GraphQLError("Un-authorized handshake. Token is missing")
      }

      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as JwtGeneratePayload

      const user = await UserModel.findById(decodedToken._id).select(
        "-password -refreshToken"
      )

      if (!user) {
        throw new GraphQLError("Unauthorized handshake.Invalid access token")
      }

      socket.data.user = user

      console.log(socket.data.user)

      socket.join(user._id.toString())
      socket.emit(ChatEventEnum.CONNECTED_EVENT)
      console.log("User connected", user._id)

      mountJoinChatEvent(socket)
      mountParticipantTypingEvent(socket)
      mountParticipantStoppedTypingEvent(socket)

      socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
        console.log("user has disconnected 🚫. userId: " + socket.data.user?._id)
        if (socket.data.user?._id) {
          socket.leave(socket.data.user._id)
        }
      })
    } catch (error) {
      console.log("error of chat", error)
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error || "Something went wrong while connecting to the socket"
      )
    }
  })
}

const emitSocketEvent = (
  io: Server,
  roomId: string,
  eventName: string,
  payload: any
) => {
  io.in(roomId).emit(eventName, payload)
}

export { InitializeSocketIO, emitSocketEvent }
