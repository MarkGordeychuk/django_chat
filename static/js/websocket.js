const chatText = document.querySelector('#chat')
const sendMsgBtn = document.querySelector('#sendmessage')
const msgInput = document.querySelector('#message')

let ws

const wsMessageEventListeners = new Set()

function connectWebSocket() {
  ws = new WebSocket(`ws://${location.host}/`)

  ws.onopen = () => console.log('ws opened')

  ws.onclose = () => {
    console.log('ws closed. Try to reconnect after 1 seconds.')
    setTimeout(connectWebSocket, 1000)
  }

  ws.onerror = () => console.log('ws error')

  ws.addMessageEventListener = function(listener) {
    wsMessageEventListeners.add(listener)
    this.addEventListener("message", listener)
  }

  ws.removeMessageEventListener = function(listener) {
    wsMessageEventListeners.delete(listener)
    this.removeEventListener("message", listener)
  }

  wsMessageEventListeners.forEach(listener => ws.addEventListener("message", listener))
}

connectWebSocket()

const messagesList = {
  add: function (message) {
    if (message.roomID in this) {
      this[message.roomID].push(message)
    } else {
      this[message.roomID] = [message]
    }
  }
}

ws.addMessageEventListener(e => {
  const msg = JSON.parse(e.data)
  // console.log(msg)

  if (msg.messageType !== "chatMessage") return

  messagesList.add(msg.message)
})
