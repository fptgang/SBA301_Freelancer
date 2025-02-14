import { LiveEvent, LiveProvider } from "@refinedev/core";
import { Client } from "@stomp/stompjs";

/**
 * Check out the Live Provider documentation for detailed information
 * https://refine.dev/docs/api-reference/core/providers/live-provider/
 **/
export const liveProvider = (client: Client): LiveProvider => ({
  subscribe: ({ callback, channel, types, params }) => {
    var id = channel;
    client.subscribe(
      channel,
      (message) => {
        console.log("message", message);
        const liveEvent: LiveEvent = {
          channel,
          type: message.headers["type"],
          payload: JSON.parse(message.body),
          date: new Date(),
        };
        callback(liveEvent);
      },
      {
        Authorization: `Bearer ${localStorage.getItem("refine-auth")}`,
        id,
      }
    );
    console.log("subscribe", {
      callback,
      channel,
      types,
      params,
    });
  },
  unsubscribe: ({ channel, types, params }) => {
    client.unsubscribe(channel);
    console.log("unsubscribe", {
      channel,
      types,
      params,
    });
  },
  publish: ({ channel, type, date, payload }) => {
    client.publish({
      destination: channel,
      body: JSON.stringify(payload),
      headers: {
        type,
      },
    });
    console.log("publish", {
      channel,
      type,
      date,
      payload,
    });
  },
});
