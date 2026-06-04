"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchCollaborators,
  addCollaborator,
  removeCollaborator,
  type Collaborator,
} from "@/data/api/endpoints/collaborators.api";
import { ApiError } from "@/data/api/api.types";

interface Props {
  workspaceId: string;
}

export function PeoplePanel({ workspaceId }: Props) {
  const [people, setPeople] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchCollaborators(workspaceId)
      .then(setPeople)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load people"))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleInvite = async () => {
    const value = email.trim();
    if (!value || busy) return;
    setBusy(true);
    setError(null);
    try {
      await addCollaborator(workspaceId, { email: value });
      setEmail("");
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to add collaborator");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (userId: string) => {
    setError(null);
    try {
      await removeCollaborator(workspaceId, userId);
      setPeople((prev) => prev.filter((p) => p.user_id !== userId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to remove collaborator");
    }
  };

  return (
    <div className="hub-view">
      <div className="hub-eyebrow">// CREW_ACCESS</div>
      <div className="hub-section-head">
        <h2 className="hub-section-title">People</h2>
      </div>

      <div className="hub-label">Invite by email</div>
      <div className="hub-input-row">
        <input
          className="hub-input"
          type="email"
          placeholder="teammate@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
        />
        <button type="button" className="hub-btn" onClick={handleInvite} disabled={busy || !email.trim()}>
          {busy ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <div className="hub-error">{error}</div>}

      <div className="hub-label">Members</div>
      {loading ? (
        <div className="hub-empty">Loading…</div>
      ) : (
        <ul className="hub-rows">
          {people.map((p, i) => (
            <li key={p.user_id} className="hub-row" style={{ animationDelay: `${i * 0.04}s` }}>
              <span className="people-avatar" aria-hidden>{(p.email ?? "?").slice(0, 1).toUpperCase()}</span>
              <span className="people-email">{p.email ?? p.user_id}</span>
              {p.is_owner ? (
                <span className="people-badge">Owner</span>
              ) : (
                <button type="button" className="people-remove" onClick={() => handleRemove(p.user_id)}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
