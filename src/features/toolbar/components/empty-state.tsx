"use client";

import { PlusIcon } from "@/shared/components/icons";

interface EmptyStateProps {
  onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <>
      <div className="empty-frame" />
      <div className="empty">
        <div className="pre">SYS · AWAITING_NODE</div>
        <div className="title">every system starts with a single node.</div>
        <button type="button" className="cta" onClick={onCreate}>
          <PlusIcon />
          Create First Node
        </button>
        <div className="hint">
          <span>
            <kbd>N</kbd> nodes
          </span>
          <span>
            <kbd>C</kbd> connect
          </span>
          <span>
            <kbd>V</kbd> select
          </span>
          <span>
            <kbd>Space</kbd>+drag pan
          </span>
        </div>
      </div>
    </>
  );
}
