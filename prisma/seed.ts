import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@booklist.app" },
    update: {},
    create: {
      name: "Demo Reader",
      email: "demo@booklist.app",
      passwordHash,
      bio: "Cozy fantasy and character-driven sci-fi. Always reading with a playlist on.",
    },
  });

  const books = [
    {
      googleBooksId: "seed-the-hobbit",
      title: "The Hobbit",
      authors: ["J.R.R. Tolkien"],
      description:
        "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling further than the pantry of his hobbit-hole. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep to whisk him away on an unexpected journey.",
      coverUrl: null,
      genres: ["Fantasy", "Classics", "Adventure"],
      pageCount: 310,
      publishedDate: "1937",
      status: "FINISHED" as const,
      playlist: {
        title: "Rainy Afternoons in the Shire",
        description: "Cozy, pastoral, and a little wistful — for the long walk to Erebor.",
        songs: [
          { title: "The Shire", artist: "Howard Shore" },
          { title: "Misty Mountains", artist: "Howard Shore" },
          { title: "Concerning Hobbits", artist: "Howard Shore" },
        ],
      },
    },
    {
      googleBooksId: "seed-pride-and-prejudice",
      title: "Pride and Prejudice",
      authors: ["Jane Austen"],
      description:
        "It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife. So begins this witty comedy of manners about the headstrong Elizabeth Bennet and the proud Mr. Darcy.",
      coverUrl: null,
      genres: ["Classics", "Romance"],
      pageCount: 279,
      publishedDate: "1813",
      status: "CURRENTLY_READING" as const,
      playlist: {
        title: "Assembly Ball",
        description: "Candlelit rooms, quiet wit, and a slow-burn romance.",
        songs: [
          { title: "Dawn", artist: "Dario Marianelli" },
          { title: "The Secret Life of Daydreams", artist: "Dario Marianelli" },
        ],
      },
    },
    {
      googleBooksId: "seed-dune",
      title: "Dune",
      authors: ["Frank Herbert"],
      description:
        "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange, a drug capable of extending life and enhancing consciousness.",
      coverUrl: null,
      genres: ["Science Fiction", "Adventure"],
      pageCount: 412,
      publishedDate: "1965",
      status: "WANT_TO_READ" as const,
      playlist: null,
    },
  ];

  for (const { status, playlist, ...bookData } of books) {
    const book = await prisma.book.upsert({
      where: { googleBooksId: bookData.googleBooksId },
      update: {},
      create: bookData,
    });

    await prisma.userBook.upsert({
      where: { userId_bookId: { userId: user.id, bookId: book.id } },
      update: {},
      create: { userId: user.id, bookId: book.id, status },
    });

    if (playlist) {
      const existing = await prisma.playlist.findFirst({
        where: { userId: user.id, bookId: book.id, title: playlist.title },
      });
      if (!existing) {
        await prisma.playlist.create({
          data: {
            title: playlist.title,
            description: playlist.description,
            userId: user.id,
            bookId: book.id,
            songs: {
              create: playlist.songs.map((song, index) => ({ ...song, order: index })),
            },
          },
        });
      }
    }
  }

  console.log("Seeded demo account: demo@booklist.app / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
