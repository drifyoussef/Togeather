// User Model (Informations de l'utilisateur)
export interface UserModel {
  mutualMatches: any;
  _id: string;
  imageUrl: string;
  firstname: string;
  name: string;
  age: number;
  email: string;
  password: string;
  job: string;
  passions: string;
  userGender: string;
  preferredGender: string;
  favoriteCategory: string;
  image?: string;
  isMutual?: boolean;
  isEmailConfirmed: boolean;
  isBanned: boolean;
  banReason: string;
  banEnd: Date;
}
