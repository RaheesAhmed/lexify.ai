export interface Workspace {
  id: string;
  name: string;
  members: WorkspaceMember[];
  documents: Document[];
  settings: WorkspaceSettings;
}

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  permissions: Permission[];
}

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export type Permission =
  | "create_document"
  | "edit_document"
  | "delete_document"
  | "share_document"
  | "manage_members";
