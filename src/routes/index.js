const { Router } = require('express')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

const route = Router()

// Database

const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json')))

/** Login - Validate **/
function login (req, res, next) {
    if (!req.session.userId) {
        res.redirect('/login')
    } else {   
        next()
    }
}

/** CSRF **/

/** 
    user1 -> { token1, token2, token3 } 
    user2 -> { token4, token5, token6 } 
**/

const tokens = new Map() // Crear un conjunto para los tokens

// Generador de Tokens 

const csrfToken = (sessionId) => {
    const token = uuidv4() // Generar identificador

    tokens.get(sessionId).add(token) // Asignarle al session identificador un token generador por la dependencia uuid que se encarga de generar hash de forma aleatoria

    setTimeout(() => tokens.get(sessionId).delete(token), 30000);

    return token
}

// Validar Tokens

const csrf = (req, res, next) => {
    const token = req.body.csrf // Obtener token del formulario

    if (!token || !tokens.get(req.sessionID).has(token)) // Si no existe token o no tiene token el session identificador
    {   
        res.status(422).send('CSRF Token missing or expired')
    } else {
        next()
    }
}

/**  Routes **/

route.get('/home', login, (req, res) => {
    res.send('Home page, must be logged in to access.')
})

route.get('/login', (req, res) => {
    res.render('login', { message: req.flash('message') })
})

route.post('/login', (req, res) => {
    if (!req.body.email || !req.body.password)
    {
        req.flash('message', 'Fill all the fields')
        return res.redirect('/login')
    }

    const user = users.find(user => user.email === req.body.email)

    if (!user || user.password !== req.body.password) 
    {
        req.flash('message', 'Invalid credentials')
        return res.redirect('/login')
    }

    req.session.userId = user.id

    tokens.set(req.sessionID, new Set()) // Almacenar el session identificador

    res.redirect('/home')
})

route.get('/logout', login, (req, res) => {
    req.session.destroy()
    res.send('Logout')
})

route.get('/edit', login, (req, res) => {
    res.render('edit', { token: csrfToken(req.sessionID)}) // Enviar Token al Formulario
})

route.post('/edit', login, csrf, (req, res) => {
    const user = users.find(user => user.id === req.session.userId)
    user.email = req.body.email
    console.log(`User ${user.id} email changed to ${user.email}`)
    res.send(`Email changed to ${user.email}`)
})

module.exports = route