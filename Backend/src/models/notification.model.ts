import mongoose, {Document, Schema, Types} from "mongoose";

export interface RequestSchemaInterface extends Document {
    message : string
    to : Types.ObjectId
    from : Types.ObjectId
    projectId : Types.ObjectId
    status : "PENDING" | "ACCEPTED" | "REJECTED"
    type : "MANAGER_REQUEST" | "TASK_REQUEST" | "MEMBER_REQUEST" | "GENERAL"
    expiresAt : Date
    createdAt : Date
    updatedAt : Date
}

const requestSchema : Schema<RequestSchemaInterface> = new Schema({
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
    type : {
        type : String,
        enum : ["MANAGER_REQUEST", "TASK_REQUEST", "MEMBER_REQUEST", "GENERAL"],
        default : "GENERAL"
    },
    expiresAt : {
        type : Date,
        default : Date.now() + 24 * 60 * 60 * 1000
    }
}, {
    timestamps : true
})

const RequestModel = mongoose.model<RequestSchemaInterface>("Request", requestSchema)

export default RequestModel