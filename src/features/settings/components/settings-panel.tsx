"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchSecrets,
  createSecret,
  revealSecret,
  deleteSecret,
  type SecretMeta,
} from "@/data/api/endpoints/secrets.api";
import { ApiError } from "@/data/api/api.types";
import { uploadMedia } from "@/data/api/endpoints/storage.api";
import { useWorkspacesStore } from "@/features/workspaces/store/workspaces.store";
import { ACCENT_SWATCHES } from "@/config/theme.config";

interface Props {
  workspaceId: string;
}

export function SettingsPanel({ workspaceId }: Props) {
  const workspace = useWorkspacesStore((s) => s.workspaces.find((w) => w.id === workspaceId));
  const updateMeta = useWorkspacesStore((s) => s.updateMeta);

  const [secrets, setSecrets] = useState<SecretMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const handleAvatar = async (file: File) => {
    setAvatarBusy(true);
    setError(null);
    try {
      const url = await uploadMedia(workspaceId, file, "_avatar");
      await updateMeta(workspaceId, { avatar: url });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to upload avatar");
    } finally {
      setAvatarBusy(false);
    }
  };

  const load = useCallback(() => {
    setLoading(true);
    fetchSecrets(workspaceId)
      .then(setSecrets)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load secrets"))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    const key = newKey.trim();
    if (!key || !newValue || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createSecret(workspaceId, { key, value: newValue });
      setNewKey("");
      setNewValue("");
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to create secret");
    } finally {
      setBusy(false);
    }
  };

  const handleReveal = async (id: string) => {
    if (revealed[id] !== undefined) {
      setRevealed((r) => {
        const next = { ...r };
        delete next[id];
        return next;
      });
      return;
    }
    try {
      const data = await revealSecret(workspaceId, id);
      setRevealed((r) => ({ ...r, [id]: data.value }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to reveal secret");
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteSecret(workspaceId, id);
      setSecrets((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete secret");
    }
  };

  return (
    <div className="hub-view">
      <div className="hub-eyebrow">// CONFIG_CONSOLE</div>
      <div className="hub-section-head">
        <h2 className="hub-section-title">Settings</h2>
      </div>

      {/* Workspace meta */}
      <div className="hub-label">Workspace</div>
      <div className="settings-meta">
          <label>Avatar</label>
          <div className="settings-avatar">
            <span className="settings-avatar-preview" aria-hidden>
              {workspace?.avatar ? (
                <img src={workspace.avatar} alt="" />
              ) : (
                <span className="settings-avatar-fallback">
                  {(workspace?.name ?? "W").slice(0, 1).toUpperCase()}
                </span>
              )}
            </span>
            <label className="hub-btn settings-avatar-btn">
              {avatarBusy ? "Uploading…" : workspace?.avatar ? "Change" : "Upload"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={avatarBusy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAvatar(f);
                  e.target.value = "";
                }}
              />
            </label>
            {workspace?.avatar && (
              <button
                type="button"
                className="secret-action danger"
                onClick={() => updateMeta(workspaceId, { avatar: undefined })}
              >
                Remove
              </button>
            )}
          </div>
          <label htmlFor="ws-name-edit">Name</label>
          <input
            id="ws-name-edit"
            type="text"
            value={workspace?.name ?? ""}
            onChange={(e) => updateMeta(workspaceId, { name: e.target.value })}
          />
          <label htmlFor="ws-desc-edit">Description</label>
          <textarea
            id="ws-desc-edit"
            value={workspace?.description ?? ""}
            onChange={(e) => updateMeta(workspaceId, { description: e.target.value })}
          />
          <label>Accent color</label>
          <div className="ws-modal-colors">
            {ACCENT_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                className="ws-modal-swatch"
                data-active={workspace?.accentColor === c ? "1" : "0"}
                style={{ background: c }}
                onClick={() => updateMeta(workspaceId, { accentColor: c })}
                aria-label={c}
              />
            ))}
          </div>
        </div>

      {/* Secrets */}
      <div className="hub-label">Secrets &amp; environment variables</div>
      <p className="hub-hero-desc is-empty" style={{ margin: "0 0 14px" }}>
        Encrypted at rest · revealed only to the workspace owner.
      </p>

      <div className="secrets-add">
        <input
          className="hub-input is-key"
          type="text"
          placeholder="KEY"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
        />
        <input
          className="hub-input"
          type="text"
          placeholder="value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
        />
        <button type="button" className="hub-btn" onClick={handleAdd} disabled={busy || !newKey.trim() || !newValue}>
          {busy ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <div className="hub-error">{error}</div>}

      <div style={{ height: 12 }} />
      {loading ? (
        <div className="hub-empty">Loading…</div>
      ) : secrets.length === 0 ? (
        <div className="hub-empty">No secrets yet.</div>
      ) : (
        <ul className="hub-rows">
          {secrets.map((s, i) => (
            <li key={s.id} className="secret-row" style={{ animationDelay: `${i * 0.04}s` }}>
              <span className="secret-key">{s.key}</span>
              <span className="secret-value">{revealed[s.id] ?? "••••••••••••"}</span>
              <button type="button" className="secret-action" onClick={() => handleReveal(s.id)}>
                {revealed[s.id] !== undefined ? "Hide" : "Reveal"}
              </button>
              <button type="button" className="secret-action danger" onClick={() => handleDelete(s.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
