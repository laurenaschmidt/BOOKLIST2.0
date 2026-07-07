"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateBioAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const bio = (formData.get("bio") as string)?.trim().slice(0, 500) || null;

  await prisma.user.update({ where: { id: session.user.id }, data: { bio } });
  revalidatePath("/profile");
}
