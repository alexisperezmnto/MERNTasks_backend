import nodemailer from 'nodemailer'

export const emailRegister = async datos => {
    const { email, name, token } = datos

    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    })

    const info = await transport.sendMail({
        from: 'UpTask - Administrador de Proyectos <cuentas@uptask.com>',
        to: email,
        subject: 'UpTask - Confirma tu cuenta',
        text: 'Confirma tu cuenta en UpTask',
        html: `
            <p>Hola ${name}. Haz click en el siguiente enlace para confirmar tu cuenta</p>
            <a href="${process.env.FRONTEND_URL}/confirm-account/${token}">Confirmar</a>
            <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje.</p>
        `
    })
}

export const emailForgotPassword = async datos => {
    const { email, name, token } = datos

    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const info = await transport.sendMail({
        from: 'UpTask - Administrador de Proyectos <cuentas@uptask.com>',
        to: email,
        subject: 'UpTask - Reestablecer Password',
        text: 'Reestablece tu password',
        html: `
            <p>Hola ${name}. Has solicitado reestablecer tu password. Haz click en el siguiente enlace.</p>
            <a href="${process.env.FRONTEND_URL}/forgot-password/${token}">Reestablecer Password</a>
            <p>Si tu no solicitaste esta acción, puedes ignorar este mensaje.</p>
        `
    })
}