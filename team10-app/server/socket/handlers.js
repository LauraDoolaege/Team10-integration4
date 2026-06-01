export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`✓ Client connected: ${socket.id}`);

    socket.on('identify', (data) => {
      console.log(`Client identified:`, data);
      // TODO: Track client identity, emit to other clients
    });

    socket.on('disconnect', () => {
      console.log(`✗ Client disconnected: ${socket.id}`);
      // TODO: Clean up client data
    });
  });
};
