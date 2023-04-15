import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import { prisma } from "../../server/db/client";
import "../../styles/globals.css";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  const details = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!details || details.role !== UserRole.ADMIN) {
    redirect("/");
  }

  return (
    <html>
      <head />
      <body>
        <main className="flex min-h-screen w-full bg-slate-700 p-4">
          <div className="container mx-auto rounded bg-white p-4">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
