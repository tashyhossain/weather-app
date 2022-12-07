const Event = function() {
  let cache = {}

  return {
    publish: function(event, ...data) {
      if (cache[event]) {
        cache[event].forEach(handler => {
          handler(...data)
        })
      }
    },
    
    subscribe: function(event, handler) {
      cache[event] = cache[event] || []
      cache[event].push(handler)
    }
  }
}

export default Event()