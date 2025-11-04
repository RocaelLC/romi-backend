// src/users/types.ts (o donde prefieras)
export type RoleLike = string | { name?: string };
export type UserWithRoles = { id: string; email: string; roles?: RoleLike[] };
