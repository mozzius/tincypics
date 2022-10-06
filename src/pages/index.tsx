/* eslint-disable @next/next/no-img-element */
import cuid from "cuid";
import produce from "immer";
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { FiCopy as CopyIcon, FiXCircle as CloseIcon } from "react-icons/fi";
import { trpc } from "../utils/trpc";

type Preview = {
  id: string;
  src: string;
  done: boolean;
};

const Home: NextPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const upload = trpc.useMutation(["images.upload"]);

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrogFile = async (evt: React.DragEvent) => {
    preventDefaults(evt);

    const files = [...evt.dataTransfer.files].filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length) {
      uploadFiles(files);
    } else {
      setIsDragging(false);
    }
  };

  const onSelectFiles = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault()
    
    const files = [...(evt.target.files ?? [])].filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length) {
      uploadFiles(files);
    }
  };

  const uploadFiles = async (files: File[]) => {
    setIsDragging(true);
    const slugs = Array.from({ length: files.length }, () => cuid());
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setPreviews(
          produce((draft) => {
            draft.push({ id: slugs[i], src, done: false });
          })
        );
      };
      reader.readAsDataURL(file);
    }
    const uploadUrls = await upload.mutateAsync({
      slugs,
    });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const upload = uploadUrls[i];
      const res = await fetch(upload.url, {
        method: "PUT",
        body: file,
      });
      if (!res.ok) throw Error("Failed to upload");
      setPreviews(
        produce((draft) => {
          const index = draft.findIndex((p) => p.id === slugs[i]);
          if (index > -1) draft[index].done = true;
        })
      );
    }
  };

  return (
    <>
      <Head>
        <title>Tincy Pics</title>
        <meta name="description" content="A tincy wincy image host" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <main
        className={`flex h-screen transition-colors duration-500 ${
          isDragging ? "bg-blue-500" : "bg-gray-50"
        }`}
        onDrop={onDrogFile}
        onDragOver={preventDefaults}
        onDrag={preventDefaults}
        onDragLeave={preventDefaults}
      >
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
                  evt.dataTransfer.items && evt.dataTransfer.items.length > 0
                );
              }}
              onDragLeave={(evt) => {
                preventDefaults(evt);
                setIsDragging(false);
              }}
            >
              <p className="text-center text-slate-700">
                Drag and drop your images here
                <label className="block mt-4 bg-blue-500 px-2 py-2 rounded text-white cursor-pointer">
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
        </div>
        {previews.length > 0 && (
          <div className="absolute top-0 left-0 h-screen w-full animate-fade overflow-y-auto overflow-x-hidden px-16 backdrop-blur-sm backdrop-brightness-90 transition-all">
            <CloseIcon
              className="fixed top-4 right-4 cursor-pointer text-4xl text-white"
              onClick={() => {
                setPreviews([]);
                setIsDragging(false);
              }}
            />
            {previews.map((preview, i) => (
              <div
                key={preview.id}
                className=" mx-auto flex h-screen w-full max-w-3xl flex-col items-center justify-center"
              >
                <img className="rounded shadow-xl" src={preview.src} alt="" />
                <div
                  className={`mt-12 flex cursor-pointer items-center rounded p-4 text-slate-700 shadow-xl transition-colors ${
                    preview.done ? "bg-white" : "bg-gray-300"
                  }`}
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `https://i.tincy.pics/${preview.id}`
                    )
                  }
                >
                  https://i.tincy.pics/{preview.id}
                  <CopyIcon className="ml-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default Home;
