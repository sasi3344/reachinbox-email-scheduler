import { User, Prisma } from '@prisma/client';
import { prisma, isDbAvailable } from '../config/db.config';

const memoryUsers = new Map<string, User>();

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    if (isDbAvailable) {
      try {
        return await prisma.user.findUnique({ where: { id } });
      } catch {}
    }
    return memoryUsers.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    if (isDbAvailable) {
      try {
        return await prisma.user.findUnique({ where: { email } });
      } catch {}
    }
    for (const u of memoryUsers.values()) {
      if (u.email === email) return u;
    }
    return null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    if (isDbAvailable) {
      try {
        return await prisma.user.findUnique({ where: { googleId } });
      } catch {}
    }
    for (const u of memoryUsers.values()) {
      if (u.googleId === googleId) return u;
    }
    return null;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    if (isDbAvailable) {
      try {
        return await prisma.user.create({ data });
      } catch {}
    }
    const user: User = {
      id: (data.id as string) || `user-${Date.now()}`,
      googleId: data.googleId,
      name: data.name,
      email: data.email,
      avatar: data.avatar || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryUsers.set(user.id, user);
    return user;
  }

  async upsertGoogleUser(data: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string | null;
  }): Promise<User> {
    if (isDbAvailable) {
      try {
        return await prisma.user.upsert({
          where: { googleId: data.googleId },
          update: { name: data.name, email: data.email, avatar: data.avatar },
          create: data,
        });
      } catch {}
    }
    const existing = await this.findByGoogleId(data.googleId);
    if (existing) {
      existing.name = data.name;
      existing.email = data.email;
      existing.avatar = data.avatar || null;
      return existing;
    }
    return this.create(data);
  }
}

export const userRepository = new UserRepository();
