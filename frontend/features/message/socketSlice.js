import { io } from "socket.io-client";

export const socket = io("https://api.blogboi.fun", {
  withCredentials: true,
  autoConnect: true,
});
