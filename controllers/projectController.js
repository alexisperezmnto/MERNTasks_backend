import Project from '../models/Project.js'
import User from '../models/User.js'

const getProjects = async (req, res) => {
    const projects = await Project.find({
        $or: [
            { contributors: { $in: req.user } },
            { createdBy: { $in: req.user } }
        ]
    }).select('-tasks')

    res.json(projects)
} 

const newProject = async (req, res) => {
    const project = new Project(req.body)
    project.createdBy = req.user._id

    try {
        const savedProject = await project.save()
        res.json(savedProject)
    } catch(error) {
        console.log(error)
    }
}

const getProject = async (req, res) => {
    const { id } = req.params

    const project = await Project.findById(id)
        .populate({
            path: 'tasks',
            populate: { path: 'completed', select: 'name' },
        })
        .populate('contributors', 'name email')

    if(!project) {
        const error = new Error('Project not found')
        return res.status(404).json({msg: error.message})
    }

    if(project.createdBy.toString() !== req.user._id.toString() && 
        !project.contributors.some(contributor => contributor._id.toString() === req.user._id.toString())) {
        const err = new Error('Unauthorized')
        return res.status(401).json({msg: err.message})
    }

    res.json(project)
} 

const editProject = async (req, res) => {
    const project = req.project
    
    project.name = req.body.name || project.name
    project.description = req.body.description || project.description
    project.deliveryDate = req.body.deliveryDate || project.deliveryDate
    project.customer = req.body.customer || project.customer

    try {
        const savedProject = await project.save()
        res.json(savedProject)
    } catch(error) {
        console.log(error)
    }
} 

const deleteProject = async (req, res) => {
    try {
        const project = req.project
        await project.deleteOne()
        return res.json({msg: 'Proyecto eliminado'})
    } catch(error) {
        console.log(error)
    }
} 

const searchContributor = async (req, res) => {
    const {email} = req.body
    const user = await User.findOne({email}).select('-confirmed -createdAt -password -token -updatedAt -__v')

    if(!user) {
        const error = new Error ('Usuario no encontrado')
        return res.status(404).json({msg: error.message})
    }

    res.json(user)
} 

const addContributor = async (req, res) => {
    const project = await Project.findById(req.params.id)

    //If project exists
    if(!project) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({msg: error.message})
    }

    //If owner of project
    if(project.createdBy.toString() !== req.user._id.toString()) {
        const err = new Error('Unauthorized')
        return res.status(401).json({msg: err.message})
    }

    //If user exists
    const {email} = req.body
    const user = await User.findOne({email}).select('-confirmed -createdAt -password -token -updatedAt -__v')
    
    if(!user) {
        const error = new Error ('Usuario no encontrado')
        return res.status(404).json({msg: error.message})
    }

    //If contributor is owner
    if(project.createdBy.toString() === user._id.toString()) {
        const error = new Error ('El creador del proyecto no puede ser el colaborador')
        return res.status(404).json({msg: error.message})
    }

    //If contributor is already added
    if(project.contributors.includes(user._id)) {
        const error = new Error ('El usuario ya pertenece al proyecto')
        return res.status(404).json({msg: error.message})
    }

    project.contributors.push(user._id)
    await project.save()
    res.json({msg: 'Colaborador agregado correctamente'})
} 

const removeContributor = async (req, res) => {
    const project = await Project.findById(req.params.id)

    //If project exists
    if(!project) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({msg: error.message})
    }

    //If owner of project
    if(project.createdBy.toString() !== req.user._id.toString()) {
        const err = new Error('Unauthorized')
        return res.status(401).json({msg: err.message})
    }

    project.contributors.pull(req.body.id)
    await project.save()
    res.json({msg: 'Colaborador eliminado correctamente'})
} 

export {
    getProjects,
    newProject,
    getProject,
    editProject,
    deleteProject,
    addContributor,
    removeContributor,
    searchContributor
}