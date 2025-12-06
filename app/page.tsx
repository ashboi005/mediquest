import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dna,
  Brain,
  Trophy,
  Stethoscope,
  BookOpen,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MediQuest</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Start Residency</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-8">
            <Zap className="w-4 h-4" />
            Powered by AI
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Master Clinical Genetics
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              through AI Simulation
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Step into a virtual genetics residency. Play as a pretend doctor diagnosing procedurally generated patients, chat
            with adaptive AI mentors, and climb the leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8">
                Start Residency
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Log In
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="text-slate-400">Patient Cases</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-slate-400">Genetic Disorders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">AI</div>
              <div className="text-slate-400">Powered Learning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Path to Mastery
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Three powerful tools designed to transform how you explore clinical
              genetics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* The Clinic */}
            <Card className="group hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  The Clinic
                </h3>
                <p className="text-slate-400 mb-4">
                  Infinite patient scenarios. No two cases are alike. Diagnose
                  AI-generated patients with realistic presentations.
                </p>
                <div className="flex items-center text-emerald-400 text-sm font-medium">
                  Practice Diagnosis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>

            {/* The Tutor */}
            <Card className="group hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  The Tutor Lab
                </h3>
                <p className="text-slate-400 mb-4">
                  Adaptive learning. Test your knowledge before or after you
                  study with an AI mentor that adapts to your play style.
                </p>
                <div className="flex items-center text-purple-400 text-sm font-medium">
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>

            {/* The Board */}
            <Card className="group hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  The Board
                </h3>
                <p className="text-slate-400 mb-4">
                  Compete with other players for the top rank. Track your
                  progress and earn achievements.
                </p>
                <div className="flex items-center text-amber-400 text-sm font-medium">
                  View Rankings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How MediQuest Works
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A gamified approach to mastering clinical genetics
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400 font-bold">
                1
              </div>
              <h3 className="font-semibold text-white mb-2">Sign Up</h3>
              <p className="text-slate-400 text-sm">
                Create your character profile and start your journey
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400 font-bold">
                2
              </div>
              <h3 className="font-semibold text-white mb-2">Learn</h3>
              <p className="text-slate-400 text-sm">
                Study with the AI tutor in your preferred mode
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400 font-bold">
                3
              </div>
              <h3 className="font-semibold text-white mb-2">Practice</h3>
              <p className="text-slate-400 text-sm">
                Diagnose patients in The Clinic simulation
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400 font-bold">
                4
              </div>
              <h3 className="font-semibold text-white mb-2">Compete</h3>
              <p className="text-slate-400 text-sm">
                Earn XP, level up, and climb the leaderboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12">
            <BookOpen className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Begin Your Residency?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Join thousands of players mastering clinical genetics through
              AI-powered simulation and adaptive learning.
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-10">
                Start Learning Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Dna className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">MediQuest</span>
            </div>
            <div className="flex items-center gap-6 text-slate-400 text-sm">
              Built for Teacher's Fest 2025-2026
            </div>  
              <div className="text-slate-500 text-sm">
               © {new Date().getFullYear()} MediQuest. All rights reserved.
              </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
