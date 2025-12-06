import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Stethoscope,
  Brain,
  Trophy,
  Target,
  Zap,
  User,
  Star,
} from "lucide-react";
import { getSession, getUserStats } from "@/lib/actions/user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  const stats = await getUserStats(session.user.id);
  
  const userXp = stats?.xp ?? 0;
  const userLevel = stats?.level ?? 1;
  const totalCases = stats?.totalCases ?? 0;
  const correctCases = stats?.correctCases ?? 0;
  const accuracy = stats?.accuracy ?? 0;
  const quizzesTaken = stats?.quizzesTaken ?? 0;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getRankTitle = (level: number) => {
    if (level >= 15) return "Chief Resident";
    if (level >= 10) return "Senior Resident";
    if (level >= 5) return "Resident";
    return "Intern";
  };

  const xpForNextLevel = (level: number) => level * level * 100;
  const currentLevelXpCalc = (level: number) => (level - 1) * (level - 1) * 100;
  const nextLevelXp = xpForNextLevel(userLevel);
  const xpProgress =
    nextLevelXp > currentLevelXpCalc(userLevel)
      ? ((userXp - currentLevelXpCalc(userLevel)) /
          (nextLevelXp - currentLevelXpCalc(userLevel))) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {session.user.name || "Player"}
            </h1>
            <p className="text-slate-400">Here's your latest progress snapshot</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center space-y-4">
            <Avatar className="w-24 h-24 mx-auto">
              {session.user.image ? (
                <AvatarImage src={session.user.image} alt={session.user.name || ""} />
              ) : null}
              <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                {session.user.name ? getInitials(session.user.name) : "PL"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {session.user.name || "Player"}
              </h2>
              <p className="text-slate-400 text-sm">{session.user.email}</p>
            </div>
            <Badge variant="default">{getRankTitle(userLevel)}</Badge>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Level {userLevel}</span>
                <span className="text-emerald-400">
                  {userXp} / {nextLevelXp} XP
                </span>
              </div>
              <Progress value={xpProgress} />
            </div>
          </CardContent>
        </Card>

        {/* Key Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{correctCases}/{totalCases}</p>
                    <p className="text-xs text-slate-400">Cases Solved / Attempted</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{accuracy}%</p>
                    <p className="text-xs text-slate-400">Accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{quizzesTaken}</p>
                    <p className="text-xs text-slate-400">Quizzes Taken</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Jump back in
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Link href="/dashboard/clinic">
            <div className="group p-4 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">The Clinic</h3>
                  <p className="text-sm text-slate-400">Diagnose a new patient</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/tutor">
            <div className="group p-4 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Tutor Lab</h3>
                  <p className="text-sm text-slate-400">Learn with the AI tutor</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/leaderboard">
            <div className="group p-4 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Leaderboard</h3>
                  <p className="text-sm text-slate-400">Check the rankings</p>
                </div>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
