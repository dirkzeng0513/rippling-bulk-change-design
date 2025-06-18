import { Check } from "lucide-react"

interface Step {
  id: number
  name: string
  status: "complete" | "current" | "upcoming"
}

interface ProgressTrackerProps {
  steps: Step[]
}

export function ProgressTracker({ steps }: ProgressTrackerProps) {
  return (
    <nav aria-label="Progress" className="mb-12">
      <ol className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="relative flex flex-col items-center">
            <div className="flex items-center">
              {stepIdx !== 0 && (
                <div className="absolute right-full w-24 sm:w-32 h-0.5 bg-gray-200 -translate-x-5">
                  {step.status === "complete" && <div className="h-full bg-amber-400" />}
                </div>
              )}

              {step.status === "complete" ? (
                <div className="relative w-10 h-10 flex items-center justify-center bg-amber-400 rounded-full z-10">
                  <Check className="w-5 h-5 text-gray-900" aria-hidden="true" />
                  <span className="sr-only">{step.name}</span>
                </div>
              ) : step.status === "current" ? (
                <div
                  className="relative w-10 h-10 flex items-center justify-center bg-white border-2 border-amber-400 rounded-full z-10"
                  aria-current="step"
                >
                  <span className="h-3 w-3 bg-amber-400 rounded-full" aria-hidden="true" />
                  <span className="sr-only">{step.name}</span>
                </div>
              ) : (
                <div className="group relative w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full hover:border-gray-400 z-10">
                  <span className="h-3 w-3 bg-transparent rounded-full group-hover:bg-gray-300" aria-hidden="true" />
                  <span className="sr-only">{step.name}</span>
                </div>
              )}
            </div>

            <span className="mt-4 text-sm font-medium text-gray-700 text-center max-w-24">{step.name}</span>
          </li>
        ))}
      </ol>
    </nav>
  )
}
