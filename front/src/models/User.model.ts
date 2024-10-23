export interface UserModel {
    _id: string;
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
  }
  