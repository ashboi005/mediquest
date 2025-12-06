"use server";

import { db } from "@/lib/db";
import { user, clinicLog, quizLog } from "@/lib/db/schema";
import { eq, count, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getUserStats(userId: string) {
  try {
    // Get user data
    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userData) {
      return null;
    }

    // Get clinic stats
    const clinicStats = await db
      .select({
        total: count(),
        correct: sql<number>`count(case when ${clinicLog.isCorrect} = true then 1 end)`,
      })
      .from(clinicLog)
      .where(eq(clinicLog.userId, userId));

    // Get quiz stats
    const quizStats = await db
      .select({
        total: count(),
      })
      .from(quizLog)
      .where(eq(quizLog.userId, userId));

    const totalCases = clinicStats[0]?.total || 0;
    const correctCases = clinicStats[0]?.correct || 0;
    const quizzesTaken = quizStats[0]?.total || 0;

    return {
      xp: userData.xp,
      level: userData.level,
      streak: userData.streak,
      totalCases,
      correctCases,
      accuracy: totalCases > 0 ? Math.round((correctCases / totalCases) * 100) : 0,
      quizzesTaken,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
}

export async function updateUserXP(userId: string, xpToAdd: number) {
  try {
    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userData) return null;

    const newXp = userData.xp + xpToAdd;
    // Level formula: level = floor(sqrt(xp / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    await db
      .update(user)
      .set({
        xp: newXp,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    return { xp: newXp, level: newLevel };
  } catch (error) {
    console.error("Error updating user XP:", error);
    return null;
  }
}

export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    return null;
  }
}
