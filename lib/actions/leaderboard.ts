"use server";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function getLeaderboard(limit: number = 10) {
  try {
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        xp: user.xp,
        level: user.level,
        image: user.image,
      })
      .from(user)
      .orderBy(desc(user.xp))
      .limit(limit);

    return users.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      name: u.name,
      xp: u.xp,
      level: u.level,
      image: u.image,
    }));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}

export async function getUserRank(userId: string) {
  try {
    const users = await db
      .select({
        id: user.id,
        xp: user.xp,
      })
      .from(user)
      .orderBy(desc(user.xp));

    const rank = users.findIndex((u) => u.id === userId) + 1;
    return rank || null;
  } catch (error) {
    console.error("Error fetching user rank:", error);
    return null;
  }
}

export async function getTotalUsers() {
  try {
    const result = await db.select().from(user);
    return result.length;
  } catch (error) {
    console.error("Error fetching total users:", error);
    return 0;
  }
}
