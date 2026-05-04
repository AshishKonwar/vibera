import { prisma } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/env";

export const authService = {
  register: async (name: string, email: string, password: string) => {
    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
     
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
  },

  login: async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },                                                                                                                         
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

        if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not defined");
        }

        const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
        );

    return {       
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  },
};
