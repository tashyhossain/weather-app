import moment from 'moment'

export default class Weather {
  constructor(location, current, air) {
    this.location = location
    this.current = current
    this.air = air
    this.forecast = []
    this.celsius = true
  }
  
  static celsius(temp) {
    return Math.round(temp - 273.15)
  }

  static fahrenheit(temp) {
    return Math.round(1.8*(temp - 273) + 32)
  }

  getLocation() {
    if (Array.isArray(this.location)) {
      return this.location[0] + ', ' + this.location[1]
    } else {
      return this.location + ', ' + this.current.sys.country
    }
  }

  getTime() {
    return moment().utcOffset(this.current.timezone / 60)
  }

  getTemp() {
    return {
      metric: Weather.celsius(this.current.main.temp),
      imperial: Weather.fahrenheit(this.current.main.temp)
    }
  }

  getWeatherDescription() {
    return this.current.weather[0].description
  }

  getWeatherIcon(weather) {
    if (weather.includes('rain')) {
      return 'cloud-rain'
    } else if (weather.includes('snow')) {
      return 'cloud-snow'
    } else if (weather.includes('cloud')) {
      return 'clouds'
    } else if (weather.includes('lightning') || weather.includes('thunder')) {
      return 'lightning'
    } else if (weather.includes('mist')) {
      return 'cloud-haze'
    } else if (weather.includes('fog')) {
      return 'cloud-fog'
    } else if (weather.includes('sun')) {
      return 'cloud-sun'
    } else if (weather.includes('clear')) {
      return 'sun'
    } else {
      return 'cloud'
    }
  }

  getWeatherType() {
    let weather = this.getWeatherDescription()

    if (weather.includes('rain')) {
      return 'rain'
    } else if (weather.includes('snow')) {
      return 'snow'
    } else if (weather.includes('cloud')) {
      return 'cloudy'
    } else if (weather.includes('lightning') || weather.includes('thunder')) {
      return 'lightning'
    } else if (weather.includes('sun')) {
      return 'sunny'
    } else if (weather.includes('clear')) {
      return 'clear'
    } else {
      return 'cloudy'
    }
  }

  getTimeOfDay() {
    let time = this.getTime()
    let hour = time.format('hh')
    let current = time.format('a')

    if (current == 'am' && hour > 5) {
      return 'day'
    } else if (current == 'am' && hour <= 5) {
      return 'night'
    } else if (current == 'pm' && hour < 5) {
      return 'day'
    } else if (current == 'pm' && hour <= 7) {
      return 'evening'
    } else if (current == 'pm' && hour > 7) {
      return 'night'
    } else {
      return 'evening'
    }
  }

  getWind() {
    let speed = (this.current.wind.speed / 1000) / (1 / 3600)

    return {
      metric: `${speed.toFixed(2)} <span>km/h</span>`,
      imperial: `${(speed / 1.609344).toFixed(2)} <span>mph</span>`
    }
  }

  getHumidity() {
    return this.current.main.humidity + '<span>%</span>'
  }

  getVisibility() {
    let visibility = this.current.visibility / 1000

    return {
      metric: `${Math.round(visibility)} <span>km</span>`,
      imperial: `${Math.round(visibility * 0.6214)} <span>mi</span>`
    }
  }

  getAQI() {
    return this.air.list[0].main.aqi
  }

  getAQIDescription() {
    let aqi = this.getAQI()

    if (aqi === 1) return 'good'
    else if (aqi === 2) return 'fair'
    else if (aqi === 3) return 'moderate'
    else if (aqi === 4) return 'poor'
    else if (aqi === 5) return 'very poor'
    else return 'N/A'
  }

  getSnow() {
    if (this.current.snow) {
      let snow = this.current.snow['1h']

      if (this.celsius) {
        return `${snow.toFixed(2)} <span>cm</span>`
      } else {
        return `${(snow * 0.39370).toFixed(2)} <span>in</span>`
      }
    } else {
      return '-'
    }
  }

  getRain() {
    if (this.current.rain) {
      let rain = this.current.rain['1h']

      if (this.celsius) {
        return `${rain.toFixed(2)} <span>cm</span>`
      } else {
        return `${(rain * 0.39370).toFixed(2)} <span>in</span>`
      }
    } else {
      return '-'
    }
  }
}