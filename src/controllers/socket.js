const socketListen = io => {
  io.on('connection', socket => {
    console.log('socket connected')
    socket.emit('receiveMessage', { hello: 'world' })
    socket.on('newMessage', data => {
      console.log(data)
    })
  })
}

export default socketListen
