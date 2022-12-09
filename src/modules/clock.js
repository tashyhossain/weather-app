import moment from 'moment'

class Clock {
  constructor(root) {
    this.root = root 
    this.interval = false
  }

  start() {
    this.stop()
    this.interval = setInterval(updateTime(this.root, moment()), 1000)
  }

  stop() {
    clearInterval(this.interval)
    this.interval = false
  }

  offset(time) {
    this.stop()
    this.interval = setInterval(updateTime(this.root, time))
  }
}

const updateTime = function(root, current) {
  let time = root.querySelector('.time-display')
  let date = root.querySelector('.date-display')

  time.textContent = current.format('hh:mm A')
  date.textContent = current.format('dddd, MMMM Do, YYYY')
}

export default Clock