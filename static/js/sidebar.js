const container = document.querySelector("main")

let currentApp = new App()

class Sidebar {
  constructor() {
    this.roomsNode = document.querySelector("#siderooms")
    this.roomsSettingsBtn = document.querySelector("#roomssetings")

    this.refresh()

    this.roomsSettingsBtn.onclick = () => {
      currentApp.close()
      currentApp = new RoomsSettingsApp(container, this.getRoomsPromise, () => this.refresh())
    }
  }

  refresh () {
    this.getRoomsPromise = getMyRooms().then(rooms => {
      this.roomsNode.innerHTML = ""
      rooms.forEach(room => {
        const aNode = document.createElement("a")
        aNode.textContent = room.name
        aNode.onclick = () => {
          currentApp.close()
          currentApp = new ChatApp(container, room, ws)
        }

        const liNode = document.createElement('li')
        liNode.appendChild(aNode)

        this.roomsNode.appendChild(liNode)
      })
      return rooms
    })

    currentApp.close()
    currentApp = new RoomsSettingsApp(container, this.getRoomsPromise, () => this.refresh())
  }
}

const sidebar = new Sidebar()
