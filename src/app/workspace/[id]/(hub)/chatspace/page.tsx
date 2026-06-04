"use client";

import { useParams } from "next/navigation";
import { ChatspaceView } from "@/features/assistant";

export default function ChatspacePage() {
  const { id } = useParams<{ id: string }>();
  return <ChatspaceView workspaceId={id} />;
}
