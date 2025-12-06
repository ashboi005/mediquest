import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Stethoscope,
  Brain,
  Trophy,
  Target,
  TrendingUp,
  Zap,
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
  const accuracy = stats?.accuracy ?? 0;
  const quizzesTaken = stats?.quizzesTaken ?? 0;
  
  // Calculate XP progress
  const currentLevelXp = Math.pow(userLevel - 1, 2) * 100;
  const nextLevelXp = Math.pow(userLevel, 2) * 100;
  const xpProgress = nextLevelXp > currentLevelXp ? ((userXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Track your progress and continue learning</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/clinic">
            <Button>
              <Stethoscope className="w-4 h-4 mr-2" />
              Start Clinic
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Cases Completed</p>
                <p className="text-2xl font-bold text-white">{totalCases}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Diagnosis Accuracy</p>
                <p className="text-2xl font-bold text-white">{accuracy}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Quizzes Taken</p>
                <p className="text-2xl font-bold text-white">{quizzesTaken}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
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
                      <p className="text-sm text-slate-400">Learn with AI tutor</p>
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
                      <p className="text-sm text-slate-400">View rankings</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/profile">
                <div className="group p-4 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Progress</h3>
                      <p className="text-sm text-slate-400">View your stats</p>
                    </div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

        </div>

        {/* Progress Sidebar */}
        <div className="space-y-6">
          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{userLevel}</span>
                </div>
                <p className="text-slate-400 text-sm">Current Level</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Progress to Level {userLevel + 1}</span>
                  <span className="text-emerald-400">{userXp} / {nextLevelXp} XP</span>
                </div>
                <Progress value={xpProgress} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
