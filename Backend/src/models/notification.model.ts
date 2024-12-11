import mongoose, {Document, Schema, Types} from "mongoose";

export interface NotificationSchemaInterface extends Document {
    message : string
    to : Types.ObjectId
    from : Types.ObjectId
    projectId : Types.ObjectId
    status : "PENDING" | "ACCEPTED" | "REJECTED"
    expiresAt : Date
    createdAt : Date
    updatedAt : Date
}

const notificationSchema : Schema<NotificationSchemaInterface> = new Schema({
    message : {
        type : String,
        required : true
    },
    to : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    from : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    projectId : {
        type : Schema.Types.ObjectId,
        ref : "Project"
    },
    status : {
        type : String,
        enum : ["PENDING", "ACCEPTED", "REJECTED"],
        default : "PENDING"
    },
    expiresAt : {
        type : Date,
        default : Date.now() + 24 * 60 * 60 * 1000
    }
}, {
    timestamps : true
})

const NotificationModel = mongoose.model<NotificationSchemaInterface>("Notification", notificationSchema)

export default NotificationModel