"use client";

import { Users } from "lucide-react";

interface Collaborator {
  id: string;
  name: string | null;
  color: string;
  position: { from: number; to: number } | null;
}

interface CollaboratorsListProps {
  collaborators: Collaborator[];
}

export function CollaboratorsList({ collaborators }: CollaboratorsListProps) {
  if (!collaborators?.length) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span className="text-sm">No active collaborators</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <div className="flex -space-x-2">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background"
            style={{ backgroundColor: collaborator.color }}
            title={collaborator.name || "Anonymous"}
          >
            {collaborator.name?.[0]?.toUpperCase() || "A"}
          </div>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {collaborators.length} active
      </span>
    </div>
  );
}
