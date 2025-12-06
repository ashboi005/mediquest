import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Target,
  Stethoscope,
  Brain,
  Star,
} from "lucide-react";
import { getSession, getUserStats } from "@/lib/actions/user";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankTitle = (level: number) => {
    if (level >= 15) return "Chief Resident";
    if (level >= 10) return "Senior Resident";
    if (level >= 5) return "Resident";
    return "Intern";
  };

  const xpForNextLevel = (level: number) => level * level * 100;
  const currentLevelXpCalc = (level: number) => (level - 1) * (level - 1) * 100;
  const nextLevelXp = xpForNextLevel(userLevel);
  const xpProgress = nextLevelXp > currentLevelXpCalc(userLevel) 
    ? ((userXp - currentLevelXpCalc(userLevel)) / (nextLevelXp - currentLevelXpCalc(userLevel))) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-slate-400">Your learning journey</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              {session?.user?.image ? (
                <AvatarImage src={session.user.image} alt={session.user.name || ""} />
              ) : null}
              <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
                {session?.user?.name ? getInitials(session.user.name) : "PL"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-white mb-1">
              {session?.user?.name || "Player"}
            </h2>
            <p className="text-slate-400 text-sm mb-4">{session?.user?.email}</p>
            <Badge variant="default" className="mb-6">
              {getRankTitle(userLevel)}
            </Badge>

            {/* Level Progress */}
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

        {/* Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{totalCases}</p>
                    <p className="text-xs text-slate-400">Cases Completed</p>
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

          {/* Total XP Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Star className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{userXp.toLocaleString()} XP</p>
                  <p className="text-slate-400">Total Experience Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
