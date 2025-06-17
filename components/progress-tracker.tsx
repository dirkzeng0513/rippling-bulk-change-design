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
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`${stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""} relative`}>
            {step.status === "complete" ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-blue-600" />
                </div>
                <div className="relative w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-900">
                  <Check className="w-5 h-5 text-white" aria-hidden="true" />
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            ) : step.status === "current" ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div
                  className="relative w-8 h-8 flex items-center justify-center bg-white border-2 border-blue-600 rounded-full"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 bg-blue-600 rounded-full" aria-hidden="true" />
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="group relative w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full hover:border-gray-400">
                  <span
                    className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{step.name}</span>
                </div>
              </>
            )}
            <span className="absolute top-10 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-500 whitespace-nowrap">
              {step.name}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}
