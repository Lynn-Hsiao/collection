const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const restaurantList = require('./restaurant.json')

const port = 3000

// express template engine
app.engine('handlebars', exphbs({ defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

// setting static files
app.use(express.static('public'))

// route setting
app.get('/', (req, res) => {
  res.render('index', { restaurants: restaurantList.results })
})

// querystring 
app.get('/search', (req, res) => {
  const keyword = req.query.keyword
  const noFinding = `There is no matched restaurant with keyword: ${req.query.keyword}`
  const restaurants = restaurantList.results.filter( restaurant => {
    return restaurant.name.toLowerCase().includes(keyword.toLowerCase()) || restaurant.category.toLowerCase().includes(keyword.toLowerCase())
  })
  if (restaurants.length === 0) {
    res.render('index', {restaurants, keyword:noFinding})
  } else {
    res.render('index', {restaurants, keyword})
  }
  
})

// show more about restaurant
app.get('/restaurants/:restaurant_id', (req, res) => {
  const restaurant = restaurantList.results.find( restaurant => restaurant.id.toString() === req.params.restaurant_id)
  res.render('show', {restaurant})
})

app.listen(port, () => {
  console.log(`Express is listening on localhost: ${port}`)
} )