/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { NextPage } from "next";
import cuid from "cuid";
import { produce } from "immer";
import { Check, Copy, Github, Loader2, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import QRCode from "react-qr-code";

import { ProfilePic } from "../components/profile-pic";
import { cx } from "../utils/cx";
import { trpc } from "../utils/trpc";

type Preview = {
  id: string;
  src: string;
  done: boolean;
};

const Home: NextPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const upload = trpc.images.upload.useMutation();
  const deleteImage = trpc.images.deleteBySlug.useMutation();
  const session = useSession();

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrogFile = async (evt: React.DragEvent) => {
    preventDefaults(evt);

    const files = [...evt.dataTransfer.files].filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length) {
      uploadFiles(files);
    } else {
      setIsDragging(false);
    }
  };

  const onSelectFiles = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();

    const files = [...(evt.target.files ?? [])].filter((file) =>
      file.type.startsWith("image/"),
    );
    if (files.length) {
      uploadFiles(files);
    }
  };

  const uploadFiles = async (files: File[]) => {
    setIsDragging(true);
    // 1. generate id
    // 2. read file and set preview
    // 3. find width and height
    const images = await Promise.all(
      Array.from({ length: files.length }, async (_, i) => {
        const id = cuid();
        const file = files[i];
        const { width, height } = await new Promise<{
          width: number;
          height: number;
        }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const src = e.target?.result as string;
            setPreviews(
              produce((draft) => {
                draft.push({ id, src, done: false });
              }),
            );
            const img = new Image();
            img.onload = () =>
              resolve({ width: img.width, height: img.height });
            img.src = src;
          };
          reader.readAsDataURL(file);
        });
        return { slug: id, width, height };
      }),
    );
    for (let i = 0; i < files.length; i++) {}
    const uploadUrls = await upload.mutateAsync(images);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const upload = uploadUrls[i];
      try {
        const res = await fetch(upload.url, {
          method: "PUT",
          body: file,
        });
        if (!res.ok) throw Error(res.statusText);
        setPreviews(
          produce((draft) => {
            const index = draft.findIndex((p) => p.id === images[i].slug);
            if (index > -1) draft[index].done = true;
          }),
        );
      } catch (err) {
        console.error(err);
        deleteImage.mutate(upload.slug);
        setPreviews(
          produce((draft) => {
            const index = draft.findIndex((p) => p.id === images[i].slug);
            if (index > -1) draft.splice(index, 1);
          }),
        );
        alert("Upload failed");
        break;
      }
    }
  };

  return (
    <main
      className={`flex h-screen transition-colors duration-500 ${
        isDragging ? "bg-blue-200" : "bg-gray-50"
      }`}
      onDrop={onDrogFile}
      onDragOver={preventDefaults}
      onDrag={preventDefaults}
      onDragLeave={preventDefaults}
    >
      <ProfilePic />
      <div className="m-auto flex w-full max-w-sm flex-col">
        <h1
          className={`text-center text-xl font-semibold transition-colors duration-500 ${
            isDragging ? "text-white" : "text-slate-700"
          }`}
        >
          tincy.pics
        </h1>
        <div className="mt-2 flex w-full flex-col rounded bg-white p-2 shadow-lg">
          <div
            className={`flex h-32 w-full flex-col items-center justify-center border-4 border-dashed transition-colors duration-200 ${
              isDragging ? "border-blue-500" : "border-slate-200"
            }`}
            onDragOver={(evt) => {
              preventDefaults(evt);
              setIsDragging(
                evt.dataTransfer.items && evt.dataTransfer.items.length > 0,
              );
            }}
            onDragLeave={(evt) => {
              preventDefaults(evt);
              setIsDragging(false);
            }}
          >
            <p className="text-center text-slate-700">
              Drag and drop your images here
              <label className="mt-4 block cursor-pointer rounded bg-blue-200 px-2 py-2">
                or select images
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={onSelectFiles}
                />
              </label>
            </p>
          </div>
        </div>

        <button
          className={cx(
            "mt-4 flex w-full cursor-pointer items-center justify-center rounded border border-stone-900 py-2 text-center text-stone-900 transition",
            session.status !== "unauthenticated" &&
              "pointer-events-none opacity-0",
          )}
          onClick={() => signIn("github")}
        >
          <Github className="mr-2" />
          Sign in with Github
        </button>
      </div>
      {previews.length > 0 && (
        <div className="absolute left-0 top-0 h-screen w-full animate-fade overflow-y-auto overflow-x-hidden px-16 backdrop-blur-sm backdrop-brightness-90 transition-all">
          <X
            className="fixed right-4 top-4 cursor-pointer text-4xl text-white"
            onClick={() => {
              setPreviews([]);
              setIsDragging(false);
            }}
          />
          {previews.map((preview) => (
            <Preview key={preview.id} {...preview} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Home;

const Preview = ({ id, src, done }: Preview) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mx-auto flex h-screen w-full max-w-3xl flex-col items-center justify-center">
      <img className="rounded shadow-xl" src={src} alt="" />
      <div className="mt-12 flex items-center gap-2">
        <div className="h-14 w-14 rounded bg-white p-2">
          <QRCode
            value={`https://tincy.pics/image/${id}`}
            size={64}
            className="h-full w-full"
          />
        </div>
        <div
          className="flex w-[450px] cursor-pointer items-center justify-between rounded bg-white p-4 text-slate-700 shadow-xl"
          onClick={() => {
            setCopied(true);
            navigator.clipboard.writeText(`https://i.tincy.pics/${id}`);
          }}
        >
          <span className="mr-4">https://i.tincy.pics/{id}</span>
          {copied ? (
            <Check className="h-4 w-4" />
          ) : done ? (
            <Copy className="h-4 w-4" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
      </div>
    </div>
  );
};
