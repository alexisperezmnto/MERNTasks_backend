import mongoose from 'mongoose'

const conectartDB = async () => {
    try {
        const connection = await mongoose.connect(
            process.env.MONGO_URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        )

        const url = `Host: ${connection.connection.host}. Puerto: ${connection.connection.port}`

        console.log(`MongoDB connected. ${url}`)
    } catch(error) {
        console.log(error.message)
        process.exit(1)
    }
}

export default conectartDB