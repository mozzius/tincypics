/* eslint-disable @next/next/no-img-element */
import { useEffect } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

import { ProfileHeader } from "../../../components/profile-header";
import { trpc } from "../../../utils/trpc";

const ProfilePage: NextPage = () => {
  const { query, replace } = useRouter();
  const profile = trpc.user.profile.useQuery(query.id as string, {
    enabled: !!query.id,
  });
  const session = useSession({
    required: true,
    onUnauthenticated() {
      replace("/");
    },
  });

  const isMe = session.data?.user?.id === query.id;

  useEffect(() => {
    if (session.status === "authenticated" && !isMe) {
      replace("/");
    }
  }, [isMe, replace, session.status]);

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
                className="inline-block w-full cursor-pointer rounded px-2 py-1 transition-colors hover:bg-slate-50"
              >
                Pics
              </Link>
            </li>
            <li className="mt-1 w-full">
              <Link
                href={{ pathname: "/profile/[id]/settings", query }}
                className="inline-block w-full cursor-pointer rounded bg-blue-200 px-2 py-1"
              >
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        <section>
          {isMe && (
            <button
              onClick={() => signOut()}
              className="rounded bg-blue-400 px-4 py-1 text-white"
            >
              Log out
            </button>
          )}
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
