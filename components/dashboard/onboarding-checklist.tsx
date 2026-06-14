import Link from "next/link"
import { CheckCircle2, Circle, ChevronRight, Zap } from "lucide-react"

interface OnboardingChecklistProps {
  steps: {
    id: string
    label: string
    description: string
    done: boolean
    href: string
  }[]
}

export function OnboardingChecklist({ steps }: OnboardingChecklistProps) {
  const completedCount = steps.filter((s) => s.done).length
  const total = steps.length

  if (completedCount === total) return null

  const progressPct = Math.round((completedCount / total) * 100)

  return (
    <div className="mx-6 mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Set up your workspace
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Complete these steps to get the most out of Receptionist OS
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-primary">
          {completedCount}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Steps */}
      <div className="mt-4 space-y-2">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.done ? "#" : step.href}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-primary/10"
          >
            {step.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${step.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {step.label}
              </p>
              {!step.done && (
                <p className="text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
            {!step.done && (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
