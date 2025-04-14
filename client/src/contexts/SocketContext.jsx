import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";

const SocketContext = createContext();
const baseURL = import.meta.env.VITE_API_URL;

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      const socketInstance = io(baseURL, {
        withCredentials: true,
        autoConnect: true,
      });

      setSocket(socketInstance);

      // Join section room
      if (user.section) {
        socketInstance.emit("join-section", user.section);
      }

      // Join admin room if admin
      if (user.isAdmin) {
        socketInstance.emit("join-admin");
      }

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
