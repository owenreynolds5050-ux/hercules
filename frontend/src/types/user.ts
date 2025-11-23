export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertUserProfilePayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
