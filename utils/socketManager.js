import io from 'socket.io-client';
import SocketUrl from '../Service/SocketUrl';

// Shared socket instance
let socket = null;

// Socket event listeners cache
const eventListeners = new Map();

const getSocket = () => {
  if (!socket) {
    socket = io(SocketUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Add connection event handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
};

// Helper function to add event listeners with cleanup
const addSocketListener = (event, callback) => {
  const socketInstance = getSocket();
  socketInstance.on(event, callback);
  
  // Store the listener for cleanup
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }
  eventListeners.get(event).add(callback);
  
  return () => {
    socketInstance.off(event, callback);
    const listeners = eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  };
};

// Helper function to remove all listeners for an event
const removeSocketListeners = (event) => {
  const socketInstance = getSocket();
  const listeners = eventListeners.get(event);
  if (listeners) {
    listeners.forEach(callback => {
      socketInstance.off(event, callback);
    });
    listeners.clear();
  }
};

// Cleanup function
const cleanupSocket = () => {
  if (socket) {
    // Remove all event listeners
    eventListeners.forEach((listeners, event) => {
      listeners.forEach(callback => {
        socket.off(event, callback);
      });
    });
    eventListeners.clear();
    
    socket.disconnect();
    socket = null;
  }
};

export {
  getSocket,
  addSocketListener,
  removeSocketListeners,
  cleanupSocket
}; 