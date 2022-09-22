const headers = {
  "Content-type": "application/json; charset=UTF-8",
  "X-CSRFToken": csrfToken
}

function getUserList(roomID) {
  return fetch(`${location.origin}/api/chat/${roomID}/users/`)
    .then(data => data.json())
    .catch(() => console.error("Cannot fetch users"))
}

function getMyRooms() {
  return fetch(`${location.origin}/api/chat/?my`)
    .then(data => data.json())
    .catch(() => console.error("Cannot fetch rooms"))
}

function getAllRooms() {
  return fetch(`${location.origin}/api/chat/`)
    .then(data => data.json())
    .catch(() => console.error("Cannot fetch rooms"))
}

function createRoom(name) {
  return fetch(
    `${location.origin}/api/chat/`,
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify({name: name})
    }
  )
    .catch(() => console.error("Cannot fetch rooms"))
}

function joinRoom(roomID) {
  return fetch(
    `${location.origin}/api/chat/${roomID}/join/`,
    {
      method: "POST",
      headers: headers
    }
  )
    .catch(() => console.error("Cannot join room"))
}

function leaveRoom(roomID) {
  return fetch(
    `${location.origin}/api/chat/${roomID}/leave/`,
    {
      method: "POST",
      headers: headers
    }
  )
    .catch(() => console.error("Cannot leave room"))
}

function updateRoom(roomID) {
  return fetch(
    `${location.origin}/api/chat/${roomID}/`,
    {
      method: "PUT",
      headers: headers
    }
  )
    .catch(() => console.error("Cannot update room"))

}

function deleteRoom(roomID) {
  return fetch(
    `${location.origin}/api/chat/${roomID}/`,
    {
      method: "DELETE",
      headers: headers
    }
  )
    .catch(() => console.error("Cannot delete room"))
}

