import moment from 'moment'
import Weather from "./weather"

const KEY = process.env.API_KEY

const getCountryCode = async function(country) {
  let response = await fetch(`https://restcountries.com/v3.1/name/${country}`)
  let data = await response.json()

  return data[0]['cca2']
}

const getAirQuality = async function(lon, lat) {
  let response = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${KEY}`)
  let data = await response.json()

  return data
}

export const getCurrentWeather = async function(input) {
  let location = input

  if (Array.isArray(input)) {
    let country = await getCountryCode(input[1])
    location = input[0] + ',' + country
  }

  let weather = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${KEY}`)
  let weatherData = await weather.json()

  let { lon, lat } = weatherData.coord
  let airData = await getAirQuality(lon, lat)

  return new Weather(input, weatherData, airData)
}

export const getForecast = async function(coordinates) {
  let { lon, lat } = coordinates

  let forecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${KEY}`)
  let data = await forecast.json()

  return data
}

export const updateTime = function(root, current) {
  let time = root.querySelector('.time-display')
  let date = root.querySelector('.date-display')

  time.textContent = current.format('hh:mm A')
  date.textContent = current.format('dddd MMMM do, YYYY')
}

