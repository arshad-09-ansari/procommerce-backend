export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);
    socket.on('join_order_room', (orderId) => {
      socket.join(orderId);
      console.log(`User joined room ${orderId}`);
    });
    socket.on('chat:message', (data) => {
      io.emit('chat:message', data);
    });
    socket.on('disconnect', () => console.log('Socket Disconnected'));
  });
};