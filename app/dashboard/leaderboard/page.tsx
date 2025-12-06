import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLeaderboard, getUserRank, getTotalUsers } from "@/lib/actions/leaderboard";
import { getSession, getUserStats } from "@/lib/actions/user";
import { redirect } from "next/navigation";

export default async function LeaderboardPage() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  const [leaderboardData, userRank, totalUsers, userStats] = await Promise.all([
    getLeaderboard(10),
    getUserRank(session.user.id),
    getTotalUsers(),
    getUserStats(session.user.id),
  ]);

  const currentUserId = session.user.id;
  const currentUser = {
    rank: userRank || 0,
    name: session.user.name || "You",
    xp: userStats?.xp || 0,
    level: userStats?.level || 1,
  };

  const leaderboardList = leaderboardData.map((entry) => ({
    ...entry,
    isCurrent: entry.id === currentUserId,
  }));

  const otherUsers = leaderboardList.filter((entry) => !entry.isCurrent);
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-amber-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadge = (level: number) => {
    if (level >= 15) return { label: "Chief Resident", variant: "gold" as const };
    if (level >= 10) return { label: "Senior Resident", variant: "purple" as const };
    if (level >= 5) return { label: "Resident", variant: "default" as const };
    return { label: "Intern", variant: "secondary" as const };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            <p className="text-slate-400">Top residents this season</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Your Rank</p>
                <p className="text-2xl font-bold text-white">#{currentUser.rank}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Your XP</p>
                <p className="text-2xl font-bold text-white">{currentUser.xp.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Players</p>
                <p className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Podium - only show if we have at least 3 players */}
      {leaderboardData.length >= 3 && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* 2nd Place */}
          <Card className="md:mt-8 border-slate-600">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarFallback className="text-xl bg-gradient-to-br from-slate-400 to-slate-500">
                    {getInitials(leaderboardData[1].name || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-800 font-bold">
                  2
                </div>
              </div>
              <h3 className="font-semibold text-white">{leaderboardData[1].name}</h3>
              <p className="text-slate-400 text-sm">{leaderboardData[1].xp.toLocaleString()} XP</p>
              <Badge variant="purple" className="mt-2">
                {getRankBadge(leaderboardData[1].level).label}
              </Badge>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent">
            <CardContent className="p-6 text-center">
              <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24 mx-auto ring-4 ring-amber-500/50">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-amber-400 to-amber-600">
                    {getInitials(leaderboardData[0].name || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-amber-900 font-bold text-lg">
                  1
                </div>
              </div>
              <h3 className="font-semibold text-white text-lg">{leaderboardData[0].name}</h3>
              <p className="text-amber-400 font-medium">{leaderboardData[0].xp.toLocaleString()} XP</p>
              <Badge variant="gold" className="mt-2">
                {getRankBadge(leaderboardData[0].level).label}
              </Badge>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="md:mt-12 border-amber-700/50">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-18 h-18 mx-auto">
                  <AvatarFallback className="text-lg bg-gradient-to-br from-amber-600 to-amber-700">
                    {getInitials(leaderboardData[2].name || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
                  3
                </div>
              </div>
              <h3 className="font-semibold text-white">{leaderboardData[2].name}</h3>
              <p className="text-slate-400 text-sm">{leaderboardData[2].xp.toLocaleString()} XP</p>
              <Badge variant="purple" className="mt-2">
                {getRankBadge(leaderboardData[2].level).label}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboardList.map((user, index) => (
              <div
                key={user.id ?? index}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl transition-all",
                  user.isCurrent
                    ? "bg-emerald-500/10 border border-emerald-500/30"
                    : user.rank <= 3
                      ? "bg-gradient-to-r from-slate-800/80 to-slate-800/40"
                      : "bg-slate-800/30 hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center">
                    {getRankIcon(user.rank) || (
                      <span className={cn(
                        "font-medium",
                        user.isCurrent ? "text-emerald-400" : "text-slate-400"
                      )}>
                        #{user.rank}
                      </span>
                    )}
                  </div>
                  <Avatar>
                    <AvatarFallback
                      className={cn(
                        user.rank === 1 && "bg-gradient-to-br from-amber-400 to-amber-600",
                        user.rank === 2 && "bg-gradient-to-br from-slate-400 to-slate-500",
                        user.rank === 3 && "bg-gradient-to-br from-amber-600 to-amber-700",
                        user.rank > 3 && "bg-gradient-to-br from-emerald-500 to-teal-600"
                      )}
                    >
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">
                      {user.name} {user.isCurrent && <span className="text-emerald-400">(You)</span>}
                    </p>
                    <p className="text-sm text-slate-400">Level {user.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-semibold",
                        user.isCurrent ? "text-emerald-400" : "text-white"
                      )}
                    >
                      {user.xp.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">XP</p>
                  </div>
                  <Badge variant={getRankBadge(user.level).variant}>
                    {getRankBadge(user.level).label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
