import Link from "next/link";

import { prisma } from "../../server/db/client";

export default async function AdminPage() {
  const imageCount = await prisma.image.aggregate({
    _count: true,
  });
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          images: true,
        },
      },
    },
    orderBy: {
      images: {
        _count: "desc",
      },
    },
  });

  const totalImages = users.reduce(
    (total, user) => total + user._count.images,
    0,
  );

  return (
    <>
      <h1 className="text-lg font-bold">Admin Page</h1>
      <p className="mt-2">
        There are {imageCount._count} images in the database.
      </p>
      <table className="table w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Images</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">
                <Link className="hover:underline" href={`/profile/${user.id}`}>
                  {user.name}
                </Link>
              </td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user._count.images}</td>
            </tr>
          ))}
          <tr>
            <td className="border px-4 py-2 font-bold" colSpan={2}>
              Total Users
            </td>
            <td className="border px-4 py-2 font-bold">{users.length}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold" colSpan={2}>
              Total Images
            </td>
            <td className="border px-4 py-2 font-bold">{totalImages}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
