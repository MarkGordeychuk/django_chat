class App {
  constructor() {}
  close() {}
}

class RoomsSettingsApp extends App {
  constructor(container, getRoomsPromise, changeCallback) {
    super()
    container.innerHTML = `
      <div class="room-settings">
        <div>
          <div>Мои комнаты:</div>
          <div class="myrooms"></div>
        </div>
        <div>
          <div>Все комнаты:</div>
          <div class="allrooms"></div>
        </div>
        <form class="addroom">
          <input name="roomname" type="text">
          <button type="submit">Создать комнату</button>
        </form>
      </div>
    `
    this.myRoomsNode = document.querySelector(".myrooms")
    this.allRoomsNode = document.querySelector(".allrooms")
    this.addRoomForm = document.querySelector(".addroom")

    getRoomsPromise.then(rooms => {
      rooms.forEach(room => {
        const roomNode = document.createElement("div")
        roomNode.className = "room"

        const roomNameNode = document.createElement("div")
        roomNameNode.textContent = room.name
        roomNode.appendChild(roomNameNode)

        if (room.owner === userInfo.id) {
          const roomDeleteBtn = document.createElement("button")
          roomDeleteBtn.textContent = "Удалить"
          roomDeleteBtn.onclick = async () => {
            const response = await deleteRoom(room.id)
            if (response.status === 200 || response.status === 204) {
              changeCallback()
            }
          }
          roomNode.appendChild(roomDeleteBtn)
        } else {
          const roomLeaveBtn = document.createElement("button")
          roomLeaveBtn.textContent = "Выйти"
          roomLeaveBtn.onclick = async () => {
            const response = await leaveRoom(room.id)
            if (response.status === 200 || response.status === 204) {
              changeCallback()
            }
          }
          roomNode.appendChild(roomLeaveBtn)
        }
        this.myRoomsNode.appendChild(roomNode)
      })
    })

    getAllRooms().then(rooms => {
      rooms.forEach(room => {

        const roomNode = document.createElement("div")
        roomNode.className = "room"

        const roomNameNode = document.createElement("div")
        roomNameNode.textContent = room.name

        const roomLeaveBtn = document.createElement("button")
        roomLeaveBtn.textContent = "Присоединиться"
        roomLeaveBtn.onclick = async () => {
          const response = await joinRoom(room.id)
          if (response.status === 200 || response.status === 204) {
            changeCallback()
          }
        }

        roomNode.append(roomNameNode, roomLeaveBtn)

        this.allRoomsNode.appendChild(roomNode)
      })
    })

    this.addRoomForm.onsubmit = async e => {
      e.preventDefault()
      const roomName = e.target.elements.roomname.value
      const response = await createRoom(roomName)
      if (response.status === 201) {
        changeCallback()
      } else {
        const message = await response.json()
        if ("name" in message) alert(...message.name)
      }
    }

  }
}

class ChatApp extends App {
  constructor(container, chatRoomInfo, ws) {
    super()
    container.innerHTML = `
      <div class="user-list"></div>
      <div class="chat"></div>
      <form class="message-form">
        <textarea name="message"></textarea>
        <button type="submit" class="btn sendmessage">Отправить сообщение</button>
      </form>
    `

    this.userListNode = document.querySelector(".user-list")
    this.chatNode = document.querySelector(".chat")
    this.msgForm = document.querySelector(".message-form")

    this.info = chatRoomInfo
    this.ws = ws
    this.users = {}

    this.msgForm.onsubmit = e => {
      e.preventDefault()
      const messageText = e.target.elements.message.value

      if (!messageText) return

      this.ws.send(JSON.stringify({
        messageType: "chatMessage",
        message: {
          roomID: this.info.id,
          text: messageText
        }
      }))
      const message = {user: userInfo.name, avatar: userInfo.avatar, text: messageText, roomID: chatRoomInfo.id}
      messagesList.add(message)
      this.addMessage(message)
      e.target.reset()
    }

    this._addMessageFromWS = e => {
      const msg = JSON.parse(e.data)
      if (msg.messageType === "chatMessage") {
        if (msg.message.roomID === this.info.id) {
          this.addMessage(msg.message)
        }
      } else if (msg.messageType === "userConnected") {
        if (msg.message.rooms.includes(this.info.id)) {
          this.addUser(msg.message.user)
        }
      } else if (msg.messageType === "userDisconnected") {
        if (msg.message.user.id in this.users) {
          this.deleteUser(msg.message.user.id)
        }
      }
    }

    this.ws.addMessageEventListener(this._addMessageFromWS)

    if (chatRoomInfo.id in messagesList) {
      messagesList[chatRoomInfo.id].forEach(msg => this.addMessage(msg))
    }

    getUserList(this.info.id).then(users => {
      users.forEach(user => this.addUser(user))
    })
  }

  close() {
    this.ws.removeMessageEventListener(this._addMessageFromWS)
  }

  addMessage(message) {
    const newMessageNode = document.createElement("div")
    const avatarNode = document.createElement("img")
    const nameNode = document.createElement("div")
    const textNode = document.createElement("div")
    newMessageNode.className = "message"
    avatarNode.src = message.avatar || "static/images/noavatar.png"
    avatarNode.className = "avatar"
    nameNode.textContent = message.user + ":"
    nameNode.className = "message-name"
    textNode.textContent = message.text
    textNode.className = "message-text"
    newMessageNode.append(avatarNode, nameNode, textNode)
    this.chatNode.appendChild(newMessageNode)
  }

  addUser(user) {
    const newUserNode = document.createElement("button")
    newUserNode.onclick = () => {
      this.msgForm.elements.message.value = user.name + ", " + this.msgForm.elements.message.value
    }

    const avatarNode = document.createElement("img")
    avatarNode.src = user.avatar || "static/images/noavatar.png"
    avatarNode.className = "avatar"

    const nameNode = document.createElement("div")
    nameNode.textContent = user.name

    newUserNode.append(avatarNode, nameNode)
    this.userListNode.appendChild(newUserNode)

    this.users[user.id] = newUserNode
  }

  deleteUser(user_id) {
    this.users[user_id].remove()
    delete this.users[user_id]
  }
}