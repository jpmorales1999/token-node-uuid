const express = require('express')
const flash = require('connect-flash-plus')
const exphbs = require('express-handlebars')
const path = require('path')
const session = require('express-session') // Cookie - Importante recordar que la Cookie se almacena en los encabezados del navegador y no cambia (Siempre se envía en cada ruta a la que accedo)

const app = express()

// Imports App

const routes = require('./routes/index')

// Settings

app.set('port', process.env.PORT || 3000) 


// Middlewares

app.use(express.urlencoded({ extended: true })) // Sends of Forms
app.use(session({ // Session
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(flash())

/** Views and Handlebars **/

app.set('views', path.join(__dirname, 'views'))
app.engine('hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}))
app.set('view engine', '.hbs')

// Routes

app.use('/', routes)

// Server

app.listen(app.get('port'), () => {
    console.log('Server on PORT ', app.get('port'))
})