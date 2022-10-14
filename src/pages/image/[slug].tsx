/* eslint-disable @next/next/no-img-element */
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiCopy as CopyIcon, FiTrash2 as DeleteIcon } from "react-icons/fi";

import { ProfileHeader } from "../../components/ProfileHeader";
import { trpc } from "../../utils/trpc";

const ImagePage: NextPage = () => {
  const { query } = useRouter();
  const image = trpc.images.get.useQuery(query.slug as string, {
    enabled: !!query.slug,
  });
  const deleteImg = trpc.images.delete.useMutation();
  const session = useSession();

  const isMe = session.data?.user?.id === query.slug;

  if (image.data === null) {
    return <div>Not found</div>;
  }
  console.log(image.data);

  if (!image.data) return null;

  return (
    <main className="flex h-screen flex-col px-4">
      <div className="m-auto flex w-full max-w-screen-lg flex-grow flex-col p-16">
        <img
          className="rounded shadow"
          src={`https://i.tincy.pics/${image.data.slug}`}
          alt={image.data?.caption ?? ""}
        />
        <div className="mt-4 flex">
          {image.data.user && (
            <Link href={`/profile/${image.data.user.id}`}>
              <a
                className="flex h-12 cursor-pointer items-center rounded p-4 text-slate-700 shadow"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `https://i.tincy.pics/${image.data.id}`
                  )
                }
              >
                {image.data.user.image && (
                  <img
                    className="rounded-full w-6 h-6 mr-4"
                    src={image.data.user.image}
                    alt={image.data.user.name ?? ""}
                  />
                )}
                <p>{image.data.user.name}</p>
              </a>
            </Link>
          )}
          <div className="grow" />
          <div
            className="flex h-12 w-12 cursor-pointer items-center rounded p-4 text-slate-700 shadow"
            onClick={() =>
              navigator.clipboard.writeText(
                `https://i.tincy.pics/${image.data.slug}`
              )
            }
          >
            <CopyIcon />
          </div>
          <div
            className="ml-4 flex h-12 w-12 cursor-pointer items-center rounded p-4 text-slate-700 shadow"
            onClick={() => deleteImg.mutate(image.data.id)}
          >
            <DeleteIcon />
          </div>
        </div>
      </div>
    </main>
  );
};

export default ImagePage;
