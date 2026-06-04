"use client";

import { useParams } from "next/navigation";
import { StorageBrowser } from "@/features/storage";

export default function WorkspaceStoragePage() {
  const { id } = useParams<{ id: string }>();
  return <StorageBrowser workspaceId={id} />;
}
