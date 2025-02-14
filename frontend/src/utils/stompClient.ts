import { Client } from "@stomp/stompjs";

export const stompClient = new Client({
  //   brokerURL: `${WS_BACK_END}/hirable-ws`,
  brokerURL: `ws://localhost:8080/hirable-ws`,
  onConnect: () => {
    console.log("Connected ");
  },
  onDisconnect: () => {
    console.log("Disconnected ");
  },
  onWebSocketClose: (closeEvent) => {
    console.log("WebSocket closed: ", closeEvent);
  },
  onStompError: (error) => {
    console.error(
      "Could not connect to WebSocket server. Please refresh this page to try again!",
      error
    );
  },
  maxWebSocketChunkSize: 1024 * 1024 * 10,
});
stompClient.activate();
