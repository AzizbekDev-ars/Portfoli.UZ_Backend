import { Project } from "../models/ProjectModel.js";
import cloudinary from "../config/cloudinary.js";

// Project yaratish
const createProject = async (req, res, next) => {
    try {
        // req.file uchun route da upload_project.single("project_image") qilishing kerak
        const project = new Project({
            projectname: req.body.projectname,
            description: req.body.description,
            techStacks: req.body.techStacks,
            demoLink: req.body.demoLink,
            codeLink: req.body.codeLink,
            isCV: req.body.isCV || false,
            image: req.file ? req.file.path : null,
            public_id: req.file ? req.file.filename : null,
            user: req.user.id
        });

        await project.save();
        res.json(project)
    } catch (err) {
        next(err)
    }
}

// Projectlarni olish
const getProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({user: req.user.id});
        res.json(projects)
    } catch (err) {
        next(err)
    }
}

// Bitta projectni olish
const getOneProject = async (req, res, next) => {
    try {
        const project = await Project.findOne({_id: req.params.id, user: req.user.id});
        if(!project) return next(new Error("Project topilmadi"));
        res.json(project)
    } catch (err) {
        next(err)
    }
}

// Projectni yangilash
const updateProjects = async (req, res, next) => {
    try {
        const project = await Project.findOne({_id: req.params.id, user: req.user.id});
        if(!project){
            return next(new Error("Project not found"))
        }

        if(req.file){
            if(project.public_id){
                await cloudinary.uploader.destroy(project.public_id)
            }
            project.image = req.file.path;
            project.public_id = req.file.filename;
        }

        project.projectname = req.body.projectname || project.projectname;
        project.description = req.body.description || project.description;
        project.techStacks = req.body.techStacks || project.techStacks;
        project.demoLink = req.body.demoLink || project.demoLink;
        project.codeLink = req.body.codeLink || project.codeLink;
        if(req.body.isCV !== undefined) project.isCV = req.body.isCV;

        await project.save();
        res.json(project)
    } catch (err) {
        next(err)
    }
}


// Projectni o'chirish
const deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findOne({_id: req.params.id, user: req.user.id});
        if(!project){
            return next(new Error("project not found"))
        }
        // cloudinary dan rasimni o'chiramiz
        if(project.public_id){
            await cloudinary.uploader.destroy(project.public_id)
        }
        await Project.findByIdAndDelete({_id: req.params.id, user: req.user.id});

        res.json({message: "Project deleted successfully"})
    } catch(err) {
        next(err)
    }
}

export {createProject, getProjects, getOneProject, updateProjects, deleteProject}
