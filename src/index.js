import './style.css'
import View from './modules/view'
import displayWeather, { getCity, getSuggestions } from './modules/app'
import Weather from './modules/weather'

const initialize = function() {
  let app = document.querySelector('#app')

  View(app)

}

initialize()