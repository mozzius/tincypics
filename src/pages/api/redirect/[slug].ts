import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "../../../server/db/client";

export default async function redirectRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const slug = req.query.slug as string;

  if (!slug) {
    res.status(404).end();
    return;
  }

  const link = await prisma.image.findUnique({
    where: { slug },
  });

  if (!link) {
    res.status(404).end();
    return;
  }

  // cache for as long as possible
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  res.redirect(`https://i.tincy.pics${link.slug}`);
}
