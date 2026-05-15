import Pusher from "pusher-js";

// Guard against server-side evaluation — node build of pusher-js has no .default constructor
export const pusherClient =
  typeof window !== "undefined"
    ? new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: "/api/pusher/auth",
      })
    : (null as unknown as Pusher);