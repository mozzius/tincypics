/* eslint-disable @next/next/no-img-element */
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiCopy as CopyIcon, FiTrash2 as DeleteIcon } from "react-icons/fi";

import { ProfileHeader } from "../../components/ProfileHeader";
import { trpc } from "../../utils/trpc";

const ProfilePage: NextPage = () => {
  const { query } = useRouter();
  const profile = trpc.useQuery(["user.profile", { id: query.id as string }]);
  const deleteImg = trpc.useMutation(["images.delete"], {
    onSuccess() {
      profile.refetch();
    },
  });
  const session = useSession();

  const isMe = session.data?.user?.id === query.id;

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
                <a className="inline-block w-full cursor-pointer rounded bg-blue-200 px-2 py-1">
                  Pics
                </a>
              </Link>
            </li>
            {isMe && (
              <li className="mt-1 w-full">
                <Link href={{ pathname: "/profile/[id]/settings", query }}>
                  <a className="inline-block w-full cursor-pointer rounded px-2 py-1 transition-colors hover:bg-slate-50">
                    Settings
                  </a>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <section className="flex flex-grow flex-col pb-12">
          {profile.data &&
            (profile.data.images.length === 0 ? (
              <p className="mt-4 text-center">No pics yet!</p>
            ) : (
              profile.data.images.map((image) => (
                <div key={image.id} className="w-fill flex flex-col">
                  <img
                    src={`https://i.tincy.pics/${image.slug}`}
                    alt=""
                    className="w-fill rounded shadow"
                  />
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
                </div>
              ))
            ))}
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
