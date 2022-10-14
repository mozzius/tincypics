/* eslint-disable @next/next/no-img-element */
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiCopy as CopyIcon,
  FiTrash2 as DeleteIcon,
  FiChevronLeft as BackIcon,
} from "react-icons/fi";

import { trpc } from "../../utils/trpc";

const ImagePage: NextPage = () => {
  const { query, back } = useRouter();
  const image = trpc.images.get.useQuery(query.slug as string, {
    enabled: !!query.slug,
  });
  const deleteImg = trpc.images.delete.useMutation({
    onSuccess: back,
  });
  const session = useSession();

  const isMe = session.data?.user?.id === image.data?.userId;

  if (image.data === null) {
    return <div>Not found</div>;
  }
  console.log(image.data);

  if (!image.data) return null;

  return (
    <main className="flex h-screen flex-col px-4">
      <div className="m-auto flex w-full max-w-screen-lg flex-grow flex-col p-16">
        <Link href="/">
          <a className="absolute top-4 cursor-pointer rounded-full p-2 transition-colors hover:bg-slate-100">
            <BackIcon className="h-6 w-6" />
          </a>
        </Link>
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
                    className="mr-4 h-6 w-6 rounded-full"
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
          {isMe && (
            <div
              className="ml-4 flex h-12 w-12 cursor-pointer items-center rounded p-4 text-slate-700 shadow"
              onClick={() => deleteImg.mutate(image.data.id)}
            >
              <DeleteIcon />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ImagePage;
