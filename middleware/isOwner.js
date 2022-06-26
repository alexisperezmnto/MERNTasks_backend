import Project from '../models/Project.js'

const isOwner = async (req, res, next) => {
    const { id } = req.params
    
    try {
        const project = await Project.findById(id)
        
        if(project.createdBy.toString() !== req.user._id.toString()) {
            const err = new Error('Unauthorized')
            return res.status(401).json({msg: err.message})
        }
        
        req.project = project

        return next()
        
    } catch(error) {
        const err = new Error('Not found')
        
        return res.status(404).json({msg: err.message})
    }
}

export default isOwner