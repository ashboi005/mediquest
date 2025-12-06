import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { getSession, getUserStats } from "@/lib/actions/user";

export async function Header() {
  const session = await getSession();
  const stats = session?.user ? await getUserStats(session.user.id) : null;

  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 1;
  
  // Calculate XP progress
  const currentLevelXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const xpProgress = nextLevelXp > currentLevelXp ? ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100 : 0;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankTitle = (lvl: number) => {
    if (lvl >= 15) return "Chief Resident";
    if (lvl >= 10) return "Senior Resident";
    if (lvl >= 5) return "Resident";
    return "Intern";
  };

  return (
    <header className="h-16 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-white">
          Welcome back, {session?.user?.name?.split(" ")[0] || "Resident"}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* XP & Level */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Star className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="w-32">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Level {level}</span>
              <span className="text-xs text-emerald-400">{xp} XP</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
          <Avatar>
            {session?.user?.image ? (
              <AvatarImage src={session.user.image} alt={session.user.name || ""} />
            ) : null}
            <AvatarFallback>
              {session?.user?.name ? getInitials(session.user.name) : "PL"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-white">
              {session?.user?.name || "Player"}
            </div>
            <Badge variant="default" className="text-xs">
              {getRankTitle(level)}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
