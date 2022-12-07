import './style.css'
import View from './modules/view'
import Event from './modules/event'

const initialize = function() {
  let app = document.querySelector('#app')

  View(app)
  Event.publish('DISPLAY-LANDING', app)
}

initialize()