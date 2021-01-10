const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const adminRoute = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const expressHbs = require('express-handlebars')

// app.engine('hbs', expressHbs({layoutsDir: 'views/layouts', defaultLayout: 'main-layout', extname: 'hbs'})) // by default is 'views/layouts
// app.set('view engine', 'hbs')

app.set('view engine', 'ejs')


// app.set('views', 'views') // needed if the views not in a views folder
// app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname , 'public')))

app.use('/admin',adminRoute.routes)
app.use('/',shopRoutes)

app.use((req,res,next)=>{
    //pug
    res.render('404', {pageTitle : 'Page not Found'})

    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
})

app.listen(3000)

