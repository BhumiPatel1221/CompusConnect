import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { GraduationCap, Calendar, Briefcase, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-hidden relative">
      {/* Background Texture/Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#06b6d41a,transparent)] pointer-events-none" />

      <header className="relative z-10 flex h-20 items-center justify-between px-6 md:px-12 border-b border-border/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">CampusConnect</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="font-medium">
              Login
            </Button>
          </Link>
          <Link to="/signup/student">
            <Button className="font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--primary)]">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-md mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
          Next Gen Campus Management
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50"
        >
          Campus <span className="text-primary">Connect</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Smart Campus Event & Placement Management
          <br />
          A centralized web platform that enables students to register for events and placement drives, while administrators efficiently manage, monitor, and organize campus activities in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link to="/login">
            <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-zinc-200 border-0 rounded-full">
              Launch Portal <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/signup/admin">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full border-zinc-700 hover:bg-zinc-800">
              Admin Access
            </Button>
          </Link>
        </motion.div>

        <div className="mt-32 grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3 text-left">
          <FeatureCard 
            icon={<Calendar className="h-8 w-8 text-primary" />}
            title="Event Management"
            description="Create, manage, and track campus events with real-time analytics and registration handling."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Briefcase className="h-8 w-8 text-purple-500" />}
            title="Placement Drives"
            description="Seamlessly coordinate company visits, eligibility checks, and student applications."
            delay={0.5}
          />
          <FeatureCard 
            icon={<ShieldCheck className="h-8 w-8 text-emerald-500" />}
            title="Secure Access"
            description="Role-based authenticated environment ensuring data privacy and integrity."
            delay={0.6}
          />
        </div>
      </main>

      <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 CampusConnect Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-colors hover:bg-card/80 hover:border-primary/50"
    >
      <div className="mb-4 inline-flex rounded-lg bg-background p-3 ring-1 ring-border group-hover:ring-primary/50 transition-all">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold tracking-tight">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
