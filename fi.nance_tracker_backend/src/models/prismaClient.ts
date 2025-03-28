import { PrismaClient } from "@prisma/client";

// Init prisma client to interact with postgres
const prisma = new PrismaClient();

export default prisma;