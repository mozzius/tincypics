/* eslint-disable @next/next/no-img-element */
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

import { ProfileHeader } from "../../components/profile-header";
import { trpc } from "../../utils/trpc";

const ProfilePage: NextPage = () => {
  const { query } = useRouter();
  const profile = trpc.user.profile.useQuery(query.id as string, {
    enabled: !!query.id,
  });
  const session = useSession();

  const isMe = session.data?.user?.id === query.id;

  if (profile.data === null) {
    return <div>Not found</div>;
  }

  return (
    <main className="flex h-screen flex-col px-4">
      <ProfileHeader user={profile.data} />
      <div className="container mx-auto flex w-full max-w-4xl flex-grow flex-col gap-4 px-4 md:flex-row">
        <nav className="w-48 flex-shrink-0">
          <ul className="mr-4 flex list-none flex-row gap-1 md:flex-col">
            <li className="w-full">
              <Link
                href={{ pathname: "/profile/[id]", query }}
                className="inline-block w-full cursor-pointer rounded bg-blue-200 px-2 py-1"
              >
                Pics
              </Link>
            </li>
            {isMe && (
              <li className="w-full">
                <Link
                  href={{ pathname: "/profile/[id]/settings", query }}
                  className="inline-block w-full cursor-pointer rounded px-2 py-1 transition-colors hover:bg-slate-50"
                >
                  Settings
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <section className="grid h-max flex-grow grid-cols-2 gap-4 pb-12 sm:grid-cols-3">
          {!profile.data ? (
            Array.from({ length: 6 }, (_, i) => (
              <div
                className="aspect-square animate-pulse rounded bg-slate-200"
                key={i}
              />
            ))
          ) : profile.data.images.length === 0 ? (
            <p className="col-span-3 mt-4 text-center">No pics yet!</p>
          ) : (
            profile.data.images.map((image) => (
              <Link
                key={image.id}
                href={`/image/${image.slug}`}
                className="aspect-square cursor-pointer overflow-hidden rounded shadow"
              >
                <img
                  src={`https://i.tincy.pics/${image.slug}`}
                  alt=""
                  className="h-full w-full bg-slate-100 object-cover transition-transform hover:scale-105"
                />
              </Link>
            ))
          )}
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;

// copy/delete buttons

/*
  <div className="mt-4 flex justify-end ">
    <div
      className="flex h-12 w-12 cursor-pointer items-center rounded p-4 text-slate-700 shadow"
      onClick={() =>
        navigator.clipboard.writeText(
          `https://i.tincy.pics/${image.id}`
        )
      }
    >
      <CopyIcon />
    </div>
    <div
      className="ml-4 flex h-12 w-12 cursor-pointer items-center rounded p-4 text-slate-700 shadow"
      onClick={() => deleteImg.mutate({ id: image.id })}
    >
      <DeleteIcon />
    </div>
  </div>
*/
