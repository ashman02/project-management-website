import mongoose, { Schema, Document, Types } from "mongoose";

interface ProjectSchemaInterface extends Document {
    _id: string;
    name: string;
    description: string;
    onwer : Types.ObjectId;
    managers : Types.ObjectId[]
    members : Types.ObjectId[]
    tasks : Types.ObjectId[]
    status : "In Progress" | "Completed" | "On Hold"
    endDate : Date
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema : Schema<ProjectSchemaInterface> = new Schema({
    name : {
        type : String,
        required : true
    },
    description : {
        type : String
    },
    onwer : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    managers : [
        {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    members : [
        {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    tasks : [
        {
            type : Schema.Types.ObjectId,
            ref : "Task"
        }
    ],
    endDate : {
        type : Date
    },
    status : {
        type : String,
        enum : ["In Progress", "Completed", "On Hold"],
        default : "In Progress"
    }
}, {timestamps : true})

const ProjectModel = mongoose.model<ProjectSchemaInterface>("Project", projectSchema)

export default ProjectModel