import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { Toaster } from "../ui/sonner";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { ChatbotWidget } from "../chat/ChatbotWidget";

export function AppLayout() {
  const { isAuthenticated, isStudent } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <Outlet />
        <Toaster theme="dark" position="bottom-right" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="mr-4 hidden h-4 w-[1px] bg-border md:block" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              CampusConnect System
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 w-full max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </SidebarInset>
      {isStudent && <ChatbotWidget />}
      <Toaster theme="dark" position="bottom-right" />
    </SidebarProvider>
  );
}
