import mongoose, { Schema, Document, Types } from "mongoose"

interface TaskSchemaInterface extends Document {
  _id: string
  name: string
  description: string
  project: Types.ObjectId
  assignedTo: Types.ObjectId
  assignedBy: Types.ObjectId
  status: "In Progress" | "Completed" | "Ready for review" | "Change needed"
  reviewedBy: Types.ObjectId
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

const taskSchema: Schema<TaskSchemaInterface> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["In Progress", "Completed", "Ready for review", "Change needed"],
      default: "In Progress",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

const TaskModel = mongoose.model<TaskSchemaInterface>("Task", taskSchema)

export default TaskModel
