/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useSession } from "next-auth/react";

export const ProfilePic = () => {
  const { data, status } = useSession();

  if (status !== "authenticated" || !data.user) return null;

  const image = data.user?.image ?? "";
  const name = data.user?.name ?? "";

  return (
    <Link
      href={{
        pathname: "/profile/[id]",
        query: { id: data.user.id },
      }}
      className="fixed right-6 top-6"
    >
      <img src={image} alt={name} className="h-8 w-8 rounded-full" />
    </Link>
  );
};
