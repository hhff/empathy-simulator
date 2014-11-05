class EventBus {
  constructor(src, width, height) {
    this.stack = new Array();
  }

  trigger(eventName) {
    for(var i = 0; i < this.stack.length; i++) {
      var item = this.stack[i];
      if(item.eventName == eventName) {
        item.callback.apply(item.context);
      }
    }
  }

  on(eventName, context, callback) {
    this.stack.push({
      eventName: eventName,
      context: context,
      callback: callback
    })
  }

};

module.exports = EventBus;