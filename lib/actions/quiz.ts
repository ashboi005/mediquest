"use server";

import { db } from "@/lib/db";
import { quizLog, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function logQuiz(
  mode: string,
  topic: string,
  quizData: object | null,
  userAnswers: number[] | null,
  score: number,
  xpEarned: number
) {
  try {
    // Get user from session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = session.user.id;

    // Log the quiz
    await db.insert(quizLog).values({
      id: crypto.randomUUID(),
      userId,
      mode,
      topic,
      quizData,
      userAnswers,
      score,
      xpEarned,
      completedAt: new Date(),
    });

    // Update user XP
    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (userData) {
      const newXp = userData.xp + xpEarned;
      const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

      await db
        .update(user)
        .set({
          xp: newXp,
          level: newLevel,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return { success: true, xp: newXp, level: newLevel };
    }

    return { success: true };
  } catch (error) {
    console.error("Error logging quiz:", error);
    return { success: false, error: "Failed to log quiz" };
  }
}
