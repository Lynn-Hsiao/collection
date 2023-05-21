//Include express from node_modules and define related variables
const express = require('express')
const app = express()
const port = 3000

//Require express-handlebars
const exphbs = require('express-handlebars')

//Setting template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

//Setting static files
app.use(express.static('public'))

//Handle request and response here
app.get('/', (req, res) => {
  res.render('index')
})
app.get('/about', (req, res) => {
  res.render('about')
})
app.get('/portfolio', (req, res) => {
  res.render('portfolio')
})
app.get('/contact', (req, res) => {
  res.render('contact')
})

//Start and listen the server
app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`)
})
