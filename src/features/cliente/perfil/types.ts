export interface UserProfile {
  fullName: string;
  phone: string;
  countryCode: string;
  email: string;
  avatarUrl: string | null;
}

export interface UpdateProfileInput {
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
}
