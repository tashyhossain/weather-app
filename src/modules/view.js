import * as data from '../assets/credits.json'
import { format, fromUnixTime } from 'date-fns'
import { getCurrentWeather, getForecast } from './app'
import Event from './event'
import Weather from './weather'

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
    <footer>
      <span>
        <a href="https://restcountries.com/">Rest Countries API</a>
      </span>
      <span>
        <a href="https://openweathermap.org/">OpenWeather API</a>
      </span>
      <span id="photo-source"></span>
    </footer>
  `

  Event.subscribe('DISPLAY-LANDING', displayLanding)
  Event.subscribe('DISPLAY-WEATHER', displayCurrentWeather)
  Event.subscribe('DISPLAY-FORECAST', displayForecast)
}

const formatInput = function(input) {
  let formatted = input.trim()

  if (input.includes(',')) {
    formatted = input.split(',').map(i => i.trim())
  }

  return formatted
}

const displayCredit = function(root) {
  let dom = root.querySelector('#photo-source')
  let name = root.classList.value.split(' ').join('-')
  let credit = data[name]

  dom.innerHTML = `
    <a id="photo-source" href="${credit.url}">${credit.name}</a>
  `
}

const displayLanding = function(root, clock) {
  let main = root.querySelector('main')
  let location = root.querySelector('.location')
  let btns = root.querySelectorAll('.nav-btn')

  root.classList = 'app evening cloudy'
  location.textContent = ''

  btns.forEach(btn => {
    if (btn.id == 'search-btn') btn.classList.add('active')
    else btn.disabled = true
  })

  main.classList = 'main-search-display'
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
        Event.publish('DISPLAY-WEATHER', root, clock, response)
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

  clock.start()
  displayCredit(root)
}

const displayCurrentWeather = function(root, clock, weather) {
  let main = root.querySelector('main')
  let btns = root.querySelectorAll('.nav-btn')
  let location = root.querySelector('.location')

  root.classList = 'app'
  root.classList.add(weather.getTimeOfDay())
  root.classList.add(weather.getWeatherType())

  main.classList = 'main-weather-display'
  location.textContent = weather.getLocation()

  btns.forEach(btn => {
    btn.disabled = false
    if (btn.id == 'weather-btn') btn.classList.add('active')
    else btn.classList.remove('active')
  })

  let temperature = weather.getTemp()
  let windspeed = weather.getWind()
  let visibility = weather.getVisibility()
  let description = weather.getWeatherDescription()

  main.innerHTML = `
    <div class="current-weather-display">
      <div class="current-temp-display">
        <div class="degree">${
          weather.celsius ? temperature.metric : temperature.imperial
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
          ${weather.celsius ? windspeed.metric : windspeed.imperial} 
        </div>
        <div class="data-desc">Wind Speed</div>
      </div>
      <div class="current-data humidity-data">
        <div class="data-icon"><i class="bi bi-moisture"></i></div>
        <div class="data-point">${weather.getHumidity()}</div>
        <div class="data-desc">Humidity</div>
      </div>
      <div class="current-data visibility-data">
        <div class="data-icon"><i class="bi bi-eye"></i></div>
        <div class="data-point">
          ${weather.celsius ? visibility.metric : visibility.imperial}
        </div>
        <div class="data-desc">Visibility</div>
      </div>
      <div class="current-data air-data">
        <div class="data-icon">${weather.getAQI()}</div>
        <div class="data-point">${weather.getAQIDescription()}</div>
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

      Event.publish('DISPLAY-WEATHER', root, clock, weather)
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
          Event.publish('DISPLAY-FORECAST', root, clock, response)
        })
        .catch(() => {
          main.innerHTML = 'Something went wrong. Please try again.'
        })
    } else {
      Event.publish('DISPLAY-FORECAST', root, clock, weather)
    }

  }

  search.onclick = () => {
    Event.publish('DISPLAY-LANDING', root, clock)
  }

  clock.offset(weather.getTime())
  displayCredit(root)
}

const displayForecast = function(root, clock, weather) {
  let main = root.querySelector('main')
  let btns = root.querySelectorAll('.nav-btn')

  main.classList = 'main-forecast-display'

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
      <div class="daily-forecast-display"></div>
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

    Event.publish('DISPLAY-WEATHER', root, clock, weather)
  }

  search.onclick = () => {
    Event.publish('DISPLAY-LANDING', root, clock)
  }

}

export default View