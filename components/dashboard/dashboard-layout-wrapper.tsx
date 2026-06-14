"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { TrialBanner } from "./trial-banner"
import { SubscriptionGate } from "./subscription-gate"
import { cn } from "@/lib/utils"

interface Subscription {
  status: string
  trialDaysLeft: number
  businessName?: string
}

export function DashboardLayoutWrapper({
  children,
  profile,
  subscription,
}: {
  children: React.ReactNode
  profile: any
  subscription: Subscription | null
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  const handleToggle = () => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    localStorage.setItem("sidebarCollapsed", JSON.stringify(nextState))
  }

  const isExpired =
    subscription?.status === "canceled" ||
    (subscription?.status === "trialing" && subscription.trialDaysLeft === 0)

  const showBanner =
    subscription &&
    !isExpired &&
    (subscription.status === "trialing" || subscription.status === "past_due")

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="hidden md:block">
          <Sidebar profile={profile} isCollapsed={false} onToggle={() => {}} />
        </div>
        <main className="md:pl-60 transition-all duration-300">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {isExpired && (
        <SubscriptionGate businessName={subscription?.businessName} />
      )}

      <div className="hidden md:block">
        <Sidebar profile={profile} isCollapsed={isCollapsed} onToggle={handleToggle} />
      </div>

      <main className={cn("transition-all duration-300", isCollapsed ? "md:pl-[80px]" : "md:pl-60")}>
        {showBanner && subscription && (
          <TrialBanner
            subscriptionStatus={subscription.status}
            trialDaysLeft={subscription.trialDaysLeft}
          />
        )}
        {children}
      </main>
    </div>
  )
}
