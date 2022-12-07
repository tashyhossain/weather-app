import { format, fromUnixTime } from 'date-fns'
import moment from 'moment'
import Event from './event'
import Weather from './weather'
import { getCurrentWeather, getForecast, updateTime } from './app'

const View = function(root) {
  root.innerHTML = `
    <div class="container">
      <div class="date-time-display">
        <div class="location"></div>
        <div class="date-time">
          <div class="time-display"></div>
          <div class="date-display"></div>
        </div>
      </div>
      <div class="weather-display">
        <nav>
          <button class="nav-btn" id="weather-btn"><i class="bi bi-cloud"></i></button>
          <button class="nav-btn" id="forecast-btn"><i class="bi bi-cloud-plus"></i></button>
          <button class="nav-btn" id="search-btn"><i class="bi bi-search"></i></button>
        </nav>
        <main>
        </main>
      </div>
    </div>
  `

  Event.subscribe('DISPLAY-LANDING', displayLanding)
  Event.subscribe('DISPLAY-WEATHER', displayCurrentWeather)
  Event.subscribe('DISPLAY-FORECAST', displayForecast)
  Event.subscribe('REFRESH', refresh)
}

const formatInput = function(input) {
  let formatted = input.trim()

  if (input.includes(',')) {
    formatted = input.split(',').map(i => i.trim())
  }

  return formatted
}

const displayLanding = function(root) {
  root.classList.add('evening', 'cloudy')

  let main = root.querySelector('main')
  let btns = root.querySelectorAll('.nav-btn')

  btns.forEach(btn => {
    if (btn.id == 'search-btn') btn.classList.add('active')
    else btn.disabled = true
  })

  main.classList.add('main-search-display')
  main.innerHTML = `
    <form autocomplete="off">
      <div class="input-wrapper">
        <input type="text" name="location" placeholder="City or City, Country">
        <div class="message hidden"></div>
      </div>
      <button type="submit" id="submit-btn">
        <span class="hidden"><i class="bi bi-arrow-right-circle"></i></span>
      </button>
    </form>
  `

  let form = root.querySelector('form')
  let input = root.querySelector('input')

  form.onsubmit = event => {
    event.preventDefault()

    let input = formatInput(event.target.querySelector('input').value)

    getCurrentWeather(input)
      .then(response => {
        Event.publish('DISPLAY-WEATHER', root, response)
      })
      .catch(() => {
        msg.classList.remove('hidden')
        msg.innerHTML = 'Please enter a valid City and/or Country'
      })
  }

  let msg = root.querySelector('.message')
  let submit = root.querySelector('#submit-btn span')

  input.onkeyup = () => {
    if (!input.value) {
      msg.classList.add('hidden') 
      submit.classList.remove('show')
      submit.classList.add('hidden')
    }
    else {
      submit.classList.remove('hidden')
      submit.classList.add('show')
    }
  }
}

const displayCurrentWeather = function(root, weather) {
  let description = weather.getWeather()
  let time = weather.getTime()

  let background = weather.getBackground(description)
  let timeOfDay = weather.getTimeOfDay(time)

  root.classList.remove('evening', 'cloudy')
  root.classList.add(timeOfDay, background)

  let main = root.querySelector('main')
  let btns = root.querySelectorAll('.nav-btn')

  main.classList.remove('main-search-display')
  main.classList.add('main-weather-display')

  btns.forEach(btn => {
    btn.disabled = false
    if (btn.id == 'weather-btn') btn.classList.add('active')
    else btn.classList.remove('active')
  })

  let temperature = weather.getTemp()
  let windspeed = weather.getWind()
  let visibility = weather.getVisibility()
  let airQuality = weather.getAQI()
  let location = root.querySelector('.location')

  weather.getTimeOfDay(weather.getTime())
  location.textContent = weather.getLocation()

  main.innerHTML = `
    <div class="current-weather-display">
      <div class="current-temp-display">
        <div class="degree">${
          weather.celsius ? temperature.metric
                          : temperature.imperial
        }</div>
        <div class="unit-icon-wrapper">
          <div class="unit">
            <button class="measure" id="celsius-btn">°C</button>
            <div></div>
            <button class="measure" id="fahrenheit-btn">°F</button>
          </div>
          <div class="current-weather-icon">
            <i class="bi bi-${weather.getWeatherIcon(description)}"></i>
          </div>
        </div>
      </div>  
      <div class="weather-desc">${description}</div>
    </div>
    <div class="current-data-display">
      <div class="current-data wind-data">
        <div class="data-icon"><i class="bi bi-wind"></i></div>
        <div class="data-point">
          ${weather.celsius ? windspeed.metric 
                            : windspeed.imperial} 
          ${weather.celsius ? '<span>km/h</span>'
                            : '<span>mph</span>'}
        </div>
        <div class="data-desc">Wind Speed</div>
      </div>
      <div class="current-data humidity-data">
        <div class="data-icon"><i class="bi bi-moisture"></i></div>
        <div class="data-point">${weather.getHumidity()}<span>%</span></div>
        <div class="data-desc">Humidity</div>
      </div>
      <div class="current-data visibility-data">
        <div class="data-icon"><i class="bi bi-eye"></i></div>
        <div class="data-point">
          ${weather.celsius ? visibility.metric 
                            : visibility.imperial}
          ${weather.celsius ? '<span>km</span>'
                            : '<span>mi</span>'}
        </div>
        <div class="data-desc">Visibility</div>
      </div>
      <div class="current-data air-data">
        <div class="data-icon">${airQuality}</div>
        <div class="data-point">${weather.getAQIDescription(airQuality)}</div>
        <div class="data-desc">Air Quality</div>
      </div>
      <div class="current-data snow-data">
        <div class="data-icon"><i class="bi bi-snow"></i></div>
        <div class="data-point">${weather.getSnow()}</div>
        <div class="data-desc">Snow</div>
      </div>
      <div class="current-data rain-data">
        <div class="data-icon"><i class="bi bi-umbrella"></i></div>
        <div class="data-point">${weather.getRain()}</div>
        <div class="data-desc">Rain</div>
      </div>
    </div>  
  `

  setInterval(() => updateTime(root, weather.getTime(), weather.getDate()), 1000)

  if (weather.celsius) {
    root.querySelector('#celsius-btn').classList.add('active')
  } else {
    root.querySelector('#fahrenheit-btn').classList.add('active')
  }

  let units = root.querySelectorAll('.measure')
  units.forEach(unit => {
    unit.onclick = event => {
      event.preventDefault()

      if (event.target.id == 'celsius-btn') {
        weather.celsius = true
      } else {
        weather.celsius = false
      }

      Event.publish('DISPLAY-WEATHER', root, weather)
      event.target.classList.add('active')
    }
  })

  let forecast = root.querySelector('#forecast-btn')
  let search = root.querySelector('#search-btn')

  forecast.onclick = event => {
    event.preventDefault()
    
    if (weather.forecast.length === 0) {
      getForecast(weather.current.coord)
        .then(response => {
          weather.forecast = response.list.filter(day => day['dt_txt'].includes('09:00:00'))
          return weather
        })
        .then(response => {
          Event.publish('DISPLAY-FORECAST', root, response)
        })
        .catch(() => {
          main.innerHTML = 'Something went wrong. Please try again.'
        })
    } else {
      Event.publish('DISPLAY-FORECAST', root, weather)
    }

  }

  search.onclick = () => {
    Event.publish('REFRESH', null)
  }
}

const displayForecast = function(root, weather) {
  let main = root.querySelector('main')
  let btns = root.querySelectorAll('.nav-btn')

  main.classList.remove('main-weather-display')
  main.classList.add('main-forecast-display')

  btns.forEach(btn => {
    if (btn.id == 'forecast-btn') {
      btn.classList.add('active')
    } else {
      btn.classList.remove('active')
    }
  })

  main.innerHTML = `
    <div class="forecast-weather-display">
    <div class="daily-forecast-title">
      <h5>5 Day Forecast in ${weather.getLocation()}</h5>
    </div>
    <div class="daily-forecast-display">
    </div>
    </div>    
  `

  let container = root.querySelector('.daily-forecast-display')
  let days = weather.forecast

  days.forEach(day => {
    let date = fromUnixTime(day.dt)
    let description = day.weather[0].description

    container.insertAdjacentHTML('beforeend', `
      <div class="daily-data">
        <div class="data-icon"><i class="bi bi-${weather.getWeatherIcon(description)}"></i></div>
        <div class="data-degree">
          ${weather.celsius ? Weather.celsius(day.main.temp)
                            : Weather.fahrenheit(day.main.temp)}
          ${weather.celsius ? '<span>°C</span>'
                            : '<span>°F</span>'}
        </div>
        <div class="data-date">
          <span>${format(date, 'E')}</span> ${format(date, 'MM/dd')}
        </div>
        <div class="data-desc">${description}</div>
      </div>
    `)
  })

  let current = root.querySelector('#weather-btn')
  let search = root.querySelector('#search-btn') 

  current.onclick = event => {
    event.preventDefault()

    Event.publish('DISPLAY-WEATHER', root, weather)
  }

  search.onclick = () => {
    Event.publish('REFRESH', null)
  }

}

const refresh = function(_) {
  location.reload()
}

export default View