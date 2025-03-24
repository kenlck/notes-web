import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean the database first
  await prisma.note.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      name: "Ken",
      email: "ken@ken.com",
      password: hashSync("pppppppp", 10),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Test User 2",
      email: "user@user.com",
      password: hashSync("pppppppp", 10),
    },
  });

  // Create root folders for user 1
  const workFolder = await prisma.folder.create({
    data: {
      name: "Work",
      userId: user1.id,
      notes: {
        create: [
          {
            title: "Meeting Notes",
            content: "- Discuss Q2 goals\n- Review project timeline\n- Team updates",
            userId: user1.id,
            path: "/Work",
          },
        ],
      },
    },
  });

  // Create nested folders under Work
  await prisma.folder.create({
    data: {
      name: "Projects",
      userId: user1.id,
      parentId: workFolder.id,
      notes: {
        create: [
          {
            title: "Project Ideas",
            content: "1. Mobile app redesign\n2. API optimization\n3. New dashboard features",
            userId: user1.id,
            path: "/Work/Projects",
          },
        ],
      },
    },
  });

  await prisma.folder.create({
    data: {
      name: "Documents",
      userId: user1.id,
      parentId: workFolder.id,
      notes: {
        create: [
          {
            title: "Team Guidelines",
            content: "1. Code review process\n2. Meeting schedules\n3. Communication channels",
            userId: user1.id,
            path: "/Work/Documents",
          },
        ],
      },
    },
  });

  // Create root personal folder
  const personalFolder = await prisma.folder.create({
    data: {
      name: "Personal",
      userId: user1.id,
    },
  });

  // Create nested folders under Personal
  await prisma.folder.create({
    data: {
      name: "Shopping",
      userId: user1.id,
      parentId: personalFolder.id,
      notes: {
        create: [
          {
            title: "Shopping List",
            content: "- Groceries\n- New laptop\n- Office supplies",
            userId: user1.id,
            path: "/Personal/Shopping",
          },
        ],
      },
    },
  });

  await prisma.folder.create({
    data: {
      name: "Goals",
      userId: user1.id,
      parentId: personalFolder.id,
      notes: {
        create: [
          {
            title: "2025 Goals",
            content: "- Learn TypeScript\n- Exercise 3x per week\n- Read more books",
            userId: user1.id,
            path: "/Personal/Goals",
          },
        ],
      },
    },
  });

  // Create root study folder for user 2
  const studyFolder = await prisma.folder.create({
    data: {
      name: "Study",
      userId: user2.id,
    },
  });

  // Create nested folders under Study
  await prisma.folder.create({
    data: {
      name: "Mathematics",
      userId: user2.id,
      parentId: studyFolder.id,
      notes: {
        create: [
          {
            title: "Calculus Notes",
            content: "Calculus:\n- Derivatives\n- Integrals\n- Limits",
            userId: user2.id,
            path: "/Study/Mathematics",
          },
        ],
      },
    },
  });

  await prisma.folder.create({
    data: {
      name: "History",
      userId: user2.id,
      parentId: studyFolder.id,
      notes: {
        create: [
          {
            title: "World War II",
            content: "Timeline:\n1939 - War begins\n1941 - Pearl Harbor\n1945 - War ends",
            userId: user2.id,
            path: "/Study/History",
          },
        ],
      },
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
