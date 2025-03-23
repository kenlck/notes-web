"use server";

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerUser(formData: { name: string; email: string; password: string }) {
  try {
    const validatedData = registerSchema.parse(formData);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        error: "User with this email already exists",
      };
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return { success: true, user: userWithoutPassword };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
      };
    }

    return {
      error: "Something went wrong",
    };
  }
}
