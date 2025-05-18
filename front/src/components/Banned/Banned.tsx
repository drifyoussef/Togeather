import { UserModel } from '../../models/User.model';

interface BannedProps {
  user: UserModel | null;
}

const Banned: React.FC<BannedProps> = ({ user }) => {
  return (
    <div>
      <h1>{user ? `User ${user.name} is banned` : "You are banned"}</h1>
    </div>
  );
};

export default Banned;