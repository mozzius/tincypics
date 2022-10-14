/* eslint-disable @next/next/no-img-element */
import { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ProfileHeader } from "../../../components/ProfileHeader";
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
      <div className="m-auto flex w-full max-w-screen-lg flex-grow">
        <nav className="w-64 flex-shrink-0">
          <ul className="mr-4 list-none">
            <li className="w-full">
              <Link href={{ pathname: "/profile/[id]", query }}>
                <a className="inline-block w-full cursor-pointer rounded px-2 py-1 transition-colors hover:bg-slate-50">
                  Pics
                </a>
              </Link>
            </li>
            <li className="mt-1 w-full">
              <Link href={{ pathname: "/profile/[id]/settings", query }}>
                <a className="inline-block w-full cursor-pointer rounded bg-blue-200 px-2 py-1">
                  Settings
                </a>
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
