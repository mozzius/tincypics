/* eslint-disable @next/next/no-img-element */
import { FiChevronLeft as BackIcon } from "react-icons/fi";
import { Image, User } from "@prisma/client";
import Link from "next/link";

interface Props {
  user?: User & { images: Image[] };
}

export const ProfileHeader = ({ user }: Props) => {
  return (
    <header className="m-auto mt-32 mb-4 flex w-full max-w-screen-lg items-end border-b-4 border-blue-400 pb-6 ">
      <Link href="/">
        <a className="absolute top-4 cursor-pointer rounded-full p-2 transition-colors hover:bg-slate-100">
          <BackIcon className="h-6 w-6" />
        </a>
      </Link>
      {user ? (
        <>
          <img
            src={user.image ?? ""}
            alt={user.name ?? ""}
            className="mr-6 h-32 w-32 rounded-full"
          />
          <div>
            <p className="mb-1 inline-block rounded bg-blue-200 px-1 py-0.5 text-xs">
              {user.images.length} pics uploaded
            </p>
            <h1 className="text-5xl">{user.name}</h1>
          </div>
        </>
      ) : (
        <>
          <div className="mr-6 h-32 w-32 animate-pulse rounded-full bg-slate-200" />
          <div>
            <div className="mb-1 h-6 w-32 animate-pulse rounded bg-slate-200" />
            <div className="rouneded h-10 w-64 animate-pulse bg-slate-200" />
          </div>
        </>
      )}
    </header>
  );
};
