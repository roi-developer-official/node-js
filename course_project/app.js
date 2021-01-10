const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const adminRoute = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const pageNotFoundCotroller = require('./controllers/404')


app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname , 'public')))
app.use('/admin',adminRoute)
app.use('/',shopRoutes)

app.use(pageNotFoundCotroller.getPageNotFound)



app.listen(3000)

