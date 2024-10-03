import { GraphQLError } from "graphql";
import { ProjectIdPayload, CreateProjectPayload, ChangeProjectStatus } from "../utils/types";
import ProjectModel from "../models/project.model";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

class ProjectService {
    public static async createProject(payload : CreateProjectPayload, userDetails : JwtPayload){
        const { name, description } = payload
        try {
            if(!userDetails || !userDetails.user){
                throw new GraphQLError("Unauthorized request")
            }

            if(!name ) throw new GraphQLError("Name is required")

            const project = await ProjectModel.create({
                name,
                description,
                onwer : userDetails.user._id
            })
            return project.name
        } catch (error) {
            if(error instanceof GraphQLError) throw error
            console.log("error while creating project", error)
            throw new GraphQLError("Unexpected error occured while creating project")
        }
    }

    public static async getProject(projectId : string, userDetails : JwtPayload){
        try {
            if(!userDetails || !userDetails.user){
                throw new GraphQLError("Unauthorized request")
            }

            const project = await ProjectModel.aggregate([
                {
                    $match : {
                        _id : new mongoose.Types.ObjectId(projectId)
                    }
                },
                {
                    $lookup : {
                        from : "users",
                        localField : "owner",
                        foreignField : "_id",
                        as : "owner"
                    }
                },
                {
                    $lookup : {
                        from : "users",
                        localField : "members",
                        foreignField : "_id",
                        as : "members"
                    }
                },
                {
                    $lookup : {
                        from : "users",
                        localField : "managers",
                        foreignField : "_id",
                        as : "managers",
                    }
                },
                {
                    $lookup : {
                        from : "tasks",
                        localField : "tasks",
                        foreignField : "_id",
                        as : "tasks"
                    }
                },
                {
                    $addFields: {
                        owner : {
                            $first: "$owner"
                        }
                    }
                }
            ])
            return project[0]
        } catch (error) {
            if(error instanceof GraphQLError) throw error
            console.log("error while getting project", error)
            throw new GraphQLError("Unexpected error occured while getting project")
        }
    }

    public static async addManager(payload : ProjectIdPayload, userDetails : JwtPayload ){
        const { projectId } = payload
        try {
            if(!userDetails || !userDetails.user){
                throw new GraphQLError("Unauthorized request")
            }
            const project = await ProjectModel.findByIdAndUpdate(projectId, {
                $addToSet : {
                    managers : userDetails.user._id,
                    members : userDetails.user._id
                }
            }, {new : true})
            if(!project) throw new GraphQLError("Project not found")
            return `You have been added as a manager to ${project.name}`
        } catch (error) {
            if(error instanceof GraphQLError) throw error
            console.log("error while adding manager", error)
            throw new GraphQLError("Unexpected error occured while adding manager")
        }

    }

    public static async changeProjectStatus(payload : ChangeProjectStatus, userDetails : JwtPayload){
        const { projectId, status } = payload
        try {
            if(!userDetails || !userDetails.user){
                throw new GraphQLError("Unauthorized request")
            }
            const project = await ProjectModel.findById(projectId)
            if(!project) throw new GraphQLError("Project not found")
            if(!project.managers.includes(userDetails.user._id)){
                throw new GraphQLError("You are not a manager of this project")
            }
            project.status = status
            if(status !== "In Progress"){
                project.endDate = new Date()
            }
            await project.save({validateBeforeSave : false})
            return `Status of ${project.name} has been changed to ${status}`
        } catch (error) {
            if(error instanceof GraphQLError) throw error
            console.log("error while changing status", error)
            throw new GraphQLError("Unexpected error occured while changing status")
        }
    }
}

export default ProjectService