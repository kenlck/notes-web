import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { db } from "@/lib/prisma";

// Utility function to get the full path for a folder
async function getFolderPath(folderId: string | null): Promise<string> {
  if (!folderId) return "/";

  const path: string[] = [];
  let currentFolder = await db.folder.findUnique({
    where: { id: folderId },
    select: { id: true, name: true, parentId: true },
  });

  while (currentFolder) {
    if (currentFolder.name) {
      path.unshift(currentFolder.name);
    }
    if (!currentFolder.parentId) break;
    currentFolder = await db.folder.findUnique({
      where: { id: currentFolder.parentId },
      select: { id: true, name: true, parentId: true },
    });
  }

  return path.length ? `/${path.join("/")}` : "/";
}

export const notesRouter = createTRPCRouter({
  getRecentNotes: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;

    const recentNotes = await db.note.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        {
          lastOpenedAt: {
            sort: "desc",
            nulls: "last",
          },
        },
        { updatedAt: "desc" },
      ],
      take: 3,
      select: {
        id: true,
        title: true,
        content: true,
        lastOpenedAt: true,
        updatedAt: true,
        path: true,
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return recentNotes;
  }),

  updateLastOpened: protectedProcedure.input(z.object({ noteId: z.string() })).mutation(async ({ ctx, input }) => {
    const user = ctx.session.user;

    const note = await db.note.update({
      where: {
        id: input.noteId,
        userId: user.id,
      },
      data: {
        lastOpenedAt: new Date(),
      },
    });

    return note;
  }),

  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`,
    };
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
        folderId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const path = await getFolderPath(input.folderId ?? null);

      const note = await db.note.update({
        where: {
          id: input.id,
          userId: user.id,
        },
        data: {
          content: input.content,
          updatedAt: new Date(),
          path,
          ...(input.folderId && { folderId: input.folderId }),
        },
        include: {
          folder: true,
        },
      });

      return note;
    }),

  getDirectory: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;

    const folders = await db.folder.findMany({
      where: {
        userId: user.id,
        parentId: null, // Only get root folders
      },
      include: {
        notes: {
          select: {
            id: true,
            title: true,
            content: true,
            path: true,
          },
        },
        children: {
          include: {
            notes: {
              select: {
                id: true,
                title: true,
                content: true,
                path: true,
              },
            },
            children: {
              include: {
                notes: {
                  select: {
                    id: true,
                    title: true,
                    content: true,
                    path: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      folders,
    };
  }),

  getNotePath: protectedProcedure.input(z.object({ noteId: z.string() })).query(async ({ ctx, input }) => {
    const user = ctx.session.user;

    const note = await db.note.findUnique({
      where: {
        id: input.noteId,
        userId: user.id,
      },
      select: {
        title: true,
        path: true,
      },
    });

    if (!note) {
      throw new Error("Note not found");
    }

    return note;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
