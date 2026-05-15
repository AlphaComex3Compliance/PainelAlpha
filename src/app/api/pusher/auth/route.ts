import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { pusherServer } from "@/lib/pusher-server.ts";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const formData = await req.formData();
    const socketId = formData.get("socket_id") as string;
    const channelName = formData.get("channel_name") as string;

    const presenceData = {
      user_id: session.user.id.toString(),
      user_info: {
        name: (session.user as any).nome || session.user.nome,
      },
    };

    const authResponse = pusherServer.authorizeChannel(socketId, channelName, presenceData);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Erro no Pusher Auth:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}