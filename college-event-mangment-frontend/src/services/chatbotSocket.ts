import { io, Socket } from "socket.io-client";

type ServerToClientEvents = {
  botReply: (payload: { text: string; data?: any; ts: string }) => void;
};

type ClientToServerEvents = {
  message: (payload: { text: string; ts: string }) => void;
};

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

function getToken(): string | null {
  return localStorage.getItem("campus_connect_token");
}

function getSocketUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_SOCKET_URL as string | undefined;
  if (envUrl) return envUrl;

  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  if (apiBase) {
    return apiBase.replace(/\/api\/?$/, "");
  }

  return "http://localhost:5000";
}

export function getChatbotSocket() {
  if (socket) return socket;

  const token = getToken();
  socket = io(getSocketUrl(), {
    transports: ["websocket"],
    auth: token ? { token } : undefined,
  });

  return socket;
}

export function disconnectChatbotSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
