import Project from '../models/Project.js'
import Task from '../models/Task.js'

const addTask = async (req, res) => {
    const { project } = req.body

    const projectExists = await Project.findById(project)

    if(!projectExists) {
        const error = new Error('Project not found')
        return res.status(404).json({msg: error.message})
    }

    if(projectExists.createdBy.toString() !== req.user._id.toString()) {
        const error = new Error('Not allowed to add tasks')
        return res.status(404).json({msg: error.message})
    }

    try {
        const  task = await Task.create(req.body)

        projectExists.tasks.push(task._id)
        await projectExists.save()

        res.json(task)
    } catch (error) {
        console.log(error)
    }
}

const getTask = async (req, res) => {
    const { id } = req.params

    const task = await Task.findById(id).populate('project')
    
    if(!task) {
        const error = new Error('Task not found')
        return res.status(404).json({msg: error.message})
    }

    if(task.project.createdBy.toString() !== req.user._id.toString()) {
        const error = new Error('Not allowed')
        return res.status(403).json({msg: error.message})
    }
    
    res.json(task)
}

const updateTask = async (req, res) => {
    const { id } = req.params

    const task = await Task.findById(id).populate('project')
    
    if(!task) {
        const error = new Error('Task not found')
        return res.status(404).json({msg: error.message})
    }

    if(task.project.createdBy.toString() !== req.user._id.toString()) {
        const error = new Error('Not allowed')
        return res.status(403).json({msg: error.message})
    }

    task.name = req.body.name || task.name
    task.description = req.body.description || task.description
    task.priority = req.body.priority || task.priority
    task.deliveryDate = req.body.deliveryDate || task.deliveryDate

    try {
        await task.save()
        res.json(task)
    } catch(error) {
        console.log(error)
    }
}

const deleteTask = async (req, res) => {
    const { id } = req.params

    const task = await Task.findById(id).populate('project')
    
    if(!task) {
        const error = new Error('Task not found')
        return res.status(404).json({msg: error.message})
    }

    if(task.project.createdBy.toString() !== req.user._id.toString()) {
        const error = new Error('Not allowed')
        return res.status(403).json({msg: error.message})
    }

    try {
        const project = await Project.findById(task.project);
        project.tasks.pull(task._id);
        await Promise.allSettled([await project.save(), await task.deleteOne()]);
        res.json({msg: 'Tarea eliminada correctamente'})
    } catch(error) {
        console.log(error)
    }
}

const changeState = async (req, res) => {
    const { id } = req.params

    const task = await Task.findById(id).populate('project')
    
    if(!task) {
        const error = new Error('Task not found')
        return res.status(404).json({msg: error.message})
    }

    if(task.project.createdBy.toString() !== req.user._id.toString() && 
        !task.project.contributors.some(contributor => contributor._id.toString() === req.user._id.toString())) {
        const error = new Error('Not allowed')
        return res.status(403).json({msg: error.message})
    }

    task.state = !task.state
    task.completed = req.user._id
    await task.save()

    const storedTask = await Task.findById(id)
        .populate('project')
        .populate('completed', 'name')

    res.json(storedTask)
}

export {
    addTask,
    getTask,
    updateTask,
    deleteTask,
    changeState
}