import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "./auth";
import prisma from "./prisma";

export interface GraphQLContext {
  user: JWTPayload | null;
  prisma: typeof prisma;
}

export async function createContext(request: NextRequest): Promise<GraphQLContext> {
  const authHeader = request.headers.get("authorization");
  let user: JWTPayload | null = null;

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    user = verifyToken(token);
  }

  return { user, prisma };
}
