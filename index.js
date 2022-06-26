import express from 'express'
import dotenv from 'dotenv'
import  cors from 'cors'
import conectartDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'

const app = express()

//Read JSON
app.use(express.json())

//.env
dotenv.config()

//DB
conectartDB()

//Cors
const whiteList = [process.env.FRONTEND_URL]
const corsOptions = {
    origin: function(origin, callback) {
        if(whiteList.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Cors Error'))
        }
    }
}

app.use(cors(corsOptions))

//Routing
app.use('/api/users/', userRoutes)
app.use('/api/projects/', projectRoutes)
app.use('/api/tasks/', taskRoutes)

const PORT = process.env.PORT || 4000

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


//Socket.io
import { Server } from 'socket.io'

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

io.on('connection', (socket) => {
    console.log('Connected to socket io')

    //Events
    socket.on('Open project', (project) => {
        socket.join(project)
    })

    socket.on('new task', task => {
        const project = task.project
        socket.to(project).emit('added task', task)
    })

    socket.on('delete task', task => {
        const project = task.project._id ? task.project._id : task.project
        socket.to(project).emit('deleted task', task)
    })

    socket.on('edited task', task => {
        const project = task.project._id
        socket.to(project).emit('updated task', task)
    })

    socket.on('state task', task => {
        const project = task.project._id
        socket.to(project).emit('task state', task)
    })
})
