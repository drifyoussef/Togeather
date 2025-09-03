// User Model (Informations de l'utilisateur)
export interface UserModel {
  _id: string;
  email: string;
  password: string;
  firstname?: string;
  name?: string;
  age?: number;
  job?: string;
  passions?: string[];
  userGender?: string;
  preferredGender?: string;
  favoriteCategory?: string;
  imageUrl?: string;
  isPremium?: boolean;
  isEmailConfirmed?: boolean;
  isBanned?: boolean;
  banReason?: string;
  banEnd?: Date;
  likedBy?: string[];
  mutualMatches?: string[];
  isMutual?: boolean;
}
