"use client";

import { useParams } from "next/navigation";
import { SettingsPanel } from "@/features/settings";

export default function SettingsPage() {
  const { id } = useParams<{ id: string }>();
  return <SettingsPanel workspaceId={id} />;
}
