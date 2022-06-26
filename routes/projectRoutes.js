import express from 'express'

import {
    getProjects,
    newProject,
    getProject,
    editProject,
    deleteProject,
    searchContributor,
    addContributor,
    removeContributor,
} from '../controllers/projectController.js'

import checkAuth from '../middleware/checkAuth.js'
import isOwner from '../middleware/isOwner.js'

const router = express.Router()

router
    .route('/')
    .get(checkAuth, getProjects)
    .post(checkAuth, newProject)

router
    .route('/:id')
    .get(checkAuth, getProject)
    .put(checkAuth, isOwner, editProject)
    .delete(checkAuth, isOwner, deleteProject)

router.post('/contributors', checkAuth, searchContributor)
router.post('/contributors/:id', checkAuth, addContributor)
router.post('/delete-contributor/:id', checkAuth, removeContributor)

export default router