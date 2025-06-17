"use client"

import { useState } from "react"
import { EmployeeSelection } from "@/components/employee-selection"
import { BulkChangeForm } from "@/components/bulk-change-form"
import { ChangePreview } from "@/components/change-preview"
import { ProgressTracker } from "@/components/progress-tracker"

export default function BulkChangePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [changeData, setChangeData] = useState<any>({})

  const steps = [
    {
      id: 1,
      name: "Select Employees",
      status: currentStep > 1 ? "complete" : currentStep === 1 ? "current" : "upcoming",
    },
    {
      id: 2,
      name: "Configure Changes",
      status: currentStep > 2 ? "complete" : currentStep === 2 ? "current" : "upcoming",
    },
    {
      id: 3,
      name: "Review & Confirm",
      status: currentStep > 3 ? "complete" : currentStep === 3 ? "current" : "upcoming",
    },
    { id: 4, name: "Execute Changes", status: currentStep === 4 ? "current" : "upcoming" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-semibold text-gray-900">Bulk Employee Changes</h1>
            <p className="mt-1 text-sm text-gray-500">Make changes to multiple employees at once</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressTracker steps={steps} />

        <div className="mt-8">
          {currentStep === 1 && (
            <EmployeeSelection
              selectedEmployees={selectedEmployees}
              onSelectionChange={setSelectedEmployees}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <BulkChangeForm
              selectedEmployees={selectedEmployees}
              changeData={changeData}
              onChangeDataUpdate={setChangeData}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <ChangePreview
              selectedEmployees={selectedEmployees}
              changeData={changeData}
              onBack={() => setCurrentStep(2)}
              onConfirm={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 4 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-lg font-medium text-gray-900">Processing bulk changes...</p>
              <p className="text-sm text-gray-500">This may take a few minutes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
