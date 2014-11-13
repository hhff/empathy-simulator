class MessageQueue {
  constructor() {
    this.messages = {
                      system: []
                    };
  }

  pushNotification(message, type, timer) {
    this.messages[type].push({message: message, timeRemaining: timer});
  }

  update() {
    for (var queueName in this.messages) {
      this.buildDOM(queueName, this.messages[queueName]);
    }
  }

  buildDOM(queueName, queue) {
    var container = document.getElementById(queueName+"-messages");

    while (container.hasChildNodes()){
      container.removeChild(container.lastChild);
    }

    for (var index in queue) {
      var messageData = queue[index];
      var text = messageData['message'];
      var message = document.createElement("div");
      message.textContent = text
      container.appendChild(message);
      messageData['timeRemaining']--

      if (messageData['timeRemaining'] <= 0){
        queue.splice(index, 1);
      }
    }
  }
};

module.exports = MessageQueue;