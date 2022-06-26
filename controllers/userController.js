import User from '../models/User.js'
import generateID from '../helpers/generateId.js'
import generateJWT from '../helpers/generateJWT.js'
import {emailRegister, emailForgotPassword} from '../helpers/email.js'

//Register
const register = async (req, res) => {

    const { email } = req.body
    const userExists = await User.findOne({email})
    
    if(userExists) {
        const error = new Error('El usuario ya está registrado')
        return res.status(400).json({msg: error.message})
    }

    try {
        const user = new User(req.body)

        //Generate token
        user.token = generateID()

        await user.save()
        
        //Send confirmation email
        emailRegister({
            email: user.email,
            name: user.name,
            token: user.token
        })

        res.json({msg: 'Usuario creado correctamente. Revisa tu email para confirmar tu cuenta'})        
    } catch (error) {
        console.log(error.message)
    }
}

//Login
const login = async (req, res) => {
    
    const { email, password } = req.body
    
    const user = await User.findOne({email})
    
    //Check user exists
    if(!user) {
        const error = new Error('El usuario no existe')
        return res.status(404).json({msg: error.message})
    }

    //Check user confirmed
    if(!user.confirmed) {
        const error = new Error('Cuenta sin confirmar')
        return res.status(404).json({msg: error.message})
    }

    //Check password
    if(await user.checkPassword(password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateJWT(user._id)
        })
    } else {
        const error = new Error('Usuario o password incorrecto')
        return res.status(404).json({msg: error.message})
    }
}

//Confirm
const confirm = async (req, res) => {
    const { token } = req.params
    const userConfirmed = await User.findOne({token})

    if(!userConfirmed) {
        const error = new Error('Invalid token')
        return res.status(404).json({msg: error.message})
    }

    try {
        userConfirmed.confirmed = true
        userConfirmed.token = ''

        await userConfirmed.save()

        res.json({msg: 'Usuario confirmado correctamente'})
    } catch (error) {
        console.log(error)
    }
}

//Forgot password
const forgotPassword = async (req, res) => {
    const { email } = req.body
    
    const user = await User.findOne({email})
    
    //Check user exists
    if(!user) {
        const error = new Error('El usuario no existe')
        return res.status(404).json({msg: error.message})
    }

    try {
        user.token = generateID()
        await user.save()

        //Send email
        emailForgotPassword({
            email: user.email,
            name: user.name,
            token: user.token
        })

        res.json({msg: 'Enviamos un email con instrucciones'})
    } catch (error) {
        console.log(error)
    }
}

//Check token
const checkToken = async (req, res) => {
    const { token } = req.params
    
    const validToken = await User.findOne({token})
    
    //Check token
    if(validToken) {
        try {
            res.json({msg: 'Valid token'})
        } catch (error) {
            console.log(error)
        }
    } else {
        const error = new Error('Invalid token')
        return res.status(404).json({msg: error.message})
    }
}

//New password
const newPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({token})
    
    //Check token
    if(user) {
        user.password = password
        user.token = ''

        try {
            await user.save()
            res.json({msg: 'Password modificado correctamente'})
        } catch (error) {
            console.log(error)
        }
    } else {
        const error = new Error('Invalid token')
        return res.status(404).json({msg: error.message})
    }
}

//Profile
const profile = async (req, res) => {
    const { user } = req
    res.json(user)
}

export { register, login, confirm, forgotPassword, checkToken, newPassword, profile }