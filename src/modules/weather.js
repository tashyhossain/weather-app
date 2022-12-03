import moment from 'moment'

export default class Weather {
  constructor(location, current, air) {
    this.location = location
    this.current = current
    this.air = air
    this.forecast = []
    this.celsius = true
  }

  getTemp() {
    return {
      celsius: Weather.celsius(this.current.main.temp),
      fahrenheit: Weather.fahrenheit(this.current.main.temp)
    }
  }

  getWeather() {
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
    } else if (weather.includes('sun')) {
      return 'cloud-sun'
    } else if (weather.includes('clear')) {
      return 'sun'
    } else {
      return 'cloud'
    }
  }

  getWind() {
    return ((this.current.wind.speed / 1000) / (1 / 3600)).toFixed(2)
  }

  getHumidity() {
    return this.current.main.humidity
  }

  getVisibility() {
    return Math.round(this.current.visibility / 1000)
  }

  getAirQuality() {
    return this.air.list[0].main.aqi
  }

  getSnow() {
    if (this.current.snow) {
      return `${this.current.snow['1h']} <span>cm</span>`
    } else {
      return '-'
    }
  }

  getRain() {
    if (this.current.rain) {
      return `${this.current.rain['1h']} <span>cm</span>`
    } else {
      return '-'
    }
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

  static celsius(temp) {
    return Math.round(temp - 273.15)
  }

  static fahrenheit(temp) {
    return Math.round(1.8*(temp - 273) + 32)
  }
}