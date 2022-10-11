/* eslint-disable @next/next/no-img-element */
import { User } from "@prisma/client";

interface Props {
  user?: User;
}

export const ProfileHeader = ({ user }: Props) => {
  return (
    <header className="m-auto flex w-full max-w-screen-lg items-end mt-32 mb-4 pb-6 border-b-4 border-blue-400">
      {user && (
        <>
          <img
            src={user.image ?? ""}
            alt={user.name ?? ""}
            className="mr-6 h-32 w-32 rounded-full"
          />
          <h1 className="text-5xl">{user.name}</h1>
        </>
      )}
    </header>
  );
};
