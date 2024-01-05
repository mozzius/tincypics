/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { Check, ChevronLeft, Copy, Trash } from "lucide-react";
import { useSession } from "next-auth/react";

import { trpc } from "../../utils/trpc";

const ImagePage: NextPage = () => {
  const { query, push } = useRouter();
  const [copied, setCopied] = useState(false);
  const image = trpc.images.get.useQuery(query.slug as string, {
    enabled: !!query.slug,
  });
  const deleteImg = trpc.images.delete.useMutation({
    onSuccess: ({ userId }) => {
      if (userId) {
        push(`/profile/${userId}`);
      } else {
        push(`/`);
      }
    },
  });
  const session = useSession();

  const isMe = session.data?.user?.id === image.data?.userId;

  if (image.data === null) {
    return <div>Not found</div>;
  }

  if (!image.data) return null;

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto flex w-full max-w-4xl flex-grow flex-col p-4">
        <Link
          href={`/profile/${image.data.userId}`}
          className="absolute top-4 cursor-pointer rounded-full p-2 transition-colors hover:bg-slate-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="mt-12 w-full">
          <img
            className="mx-auto h-auto w-auto max-w-full rounded"
            src={`https://i.tincy.pics/${image.data.slug}`}
            alt={image.data?.caption ?? ""}
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-between gap-4">
          {image.data.user && (
            <Link
              href={`/profile/${image.data.user.id}`}
              className="flex h-12 cursor-pointer items-center rounded border p-4 text-slate-700"
            >
              {image.data.user.image && (
                <img
                  className="mr-4 h-6 w-6 rounded-full"
                  src={image.data.user.image}
                  alt={image.data.user.name ?? ""}
                />
              )}
              <p>{image.data.user.name}</p>
            </Link>
          )}
          <div className="flex gap-4">
            <button
              className="flex h-12 w-12 cursor-pointer items-center rounded border p-4 text-slate-700"
              onClick={() => {
                setCopied(true);
                navigator.clipboard.writeText(
                  `https://i.tincy.pics/${image.data.slug}`,
                );
              }}
            >
              {copied ? <Check /> : <Copy />}
            </button>
            {isMe && (
              <button
                className="flex h-12 w-12 cursor-pointer items-center rounded border p-4 text-slate-700 disabled:bg-slate-100"
                onClick={() => deleteImg.mutate(image.data.id)}
                disabled={deleteImg.isLoading}
              >
                <Trash />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ImagePage;
