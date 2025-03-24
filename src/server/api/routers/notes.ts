import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { db } from "@/lib/prisma";

export const notesRouter = createTRPCRouter({
  getRecentNotes: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;

    const recentNotes = await db.note.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [{ lastOpenedAt: "desc" }, { updatedAt: "desc" }],
      take: 3,
      select: {
        id: true,
        title: true,
        content: true,
        lastOpenedAt: true,
        updatedAt: true,
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
          },
        },
        children: {
          include: {
            notes: {
              select: {
                id: true,
                title: true,
                content: true,
              },
            },
            children: {
              include: {
                notes: {
                  select: {
                    id: true,
                    title: true,
                    content: true,
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

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
