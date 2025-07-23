// Shared authentication types
export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthSession {
  user: User;
  token: string;
}
