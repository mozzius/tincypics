/* eslint-disable @next/next/no-img-element */
import { useSession } from "next-auth/react";
import Link from "next/link";

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
    >
      <a className="fixed top-10 right-10">
        <img src={image} alt={name} className="h-16 w-16 rounded-full" />
      </a>
    </Link>
  );
};
