"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { PlayersRanking } from "@/components/players-ranking"
import { MatchesView } from "@/components/matches-view"
import { TournamentsView } from "@/components/tournaments-view"
import { PlayerProfiles } from "@/components/player-profiles"

export default function TennisLeagueDashboard() {
  const [activeView, setActiveView] = useState("overview")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const renderActiveView = () => {
    switch (activeView) {
      case "overview":
        return <DashboardOverview setActiveView={setActiveView} />
      case "ranking":
        return <PlayersRanking />
      case "matches":
        return <MatchesView />
      case "tournaments":
        return <TournamentsView />
      case "players":
        return <PlayerProfiles />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar activeView={activeView} setActiveView={setActiveView} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2" suppressHydrationWarning>
            <div className="h-6 w-6 rounded-full overflow-hidden">
              {isMounted ? (
                <img src="/logo.png" alt="Tennis Open Club" className="h-6 w-6 object-cover" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-green-500" />
              )}
            </div>
            <h1 className="text-xl font-semibold">Tennis Open Club - Admin</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{renderActiveView()}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
