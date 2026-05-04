import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

interface DbConnection {
  connected: boolean;
}

export const db: DbConnection = {
  connected: false,
};

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    db.connected = true;
  } catch (error) {
    console.error("Database connection failed ❌", error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
  db.connected = false;
}