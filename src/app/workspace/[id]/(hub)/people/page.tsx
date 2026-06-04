"use client";

import { useParams } from "next/navigation";
import { PeoplePanel } from "@/features/people";

export default function PeoplePage() {
  const { id } = useParams<{ id: string }>();
  return <PeoplePanel workspaceId={id} />;
}
