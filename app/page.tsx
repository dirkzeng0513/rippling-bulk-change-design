"use client"

import { useState } from "react"
import { EmployeeSelection } from "@/components/employee-selection"
import { FieldSelection } from "@/components/field-selection"
import { ValidationPreview } from "@/components/validation-preview"
import { ApprovalFlow } from "@/components/approval-flow"
import { ProgressTracker } from "@/components/progress-tracker"
import { RipplingHeader } from "@/components/rippling-header"

export default function UpdateEmployeeInformationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [changeData, setChangeData] = useState<any>({})
  const [editMode, setEditMode] = useState<"manual" | "csv">("manual")

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
      name: "Validation & Preview",
      status: currentStep > 3 ? "complete" : currentStep === 3 ? "current" : "upcoming",
    },
    {
      id: 4,
      name: "Approval & Submit",
      status: currentStep === 4 ? "current" : "upcoming",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <RipplingHeader />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="py-8">
            <nav className="text-sm text-gray-500 mb-4">
              <span>People</span> <span className="mx-2">›</span>
              <span>Bulk Actions</span> <span className="mx-2">›</span>
              <span className="text-gray-900 font-medium">Update Employee Information</span>
            </nav>
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">Update employee information</h1>
              <p className="mt-4 text-xl text-gray-600 leading-relaxed">
                Update multiple employee records at once through manual editing or CSV upload. Advanced filtering and
                natural language queries supported.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <ProgressTracker steps={steps} />

        <div className="mt-12">
          {currentStep === 1 && (
            <EmployeeSelection
              selectedEmployees={selectedEmployees}
              onSelectionChange={setSelectedEmployees}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <FieldSelection
              selectedEmployees={selectedEmployees}
              selectedFields={selectedFields}
              onFieldsChange={setSelectedFields}
              changeData={changeData}
              onChangeDataUpdate={setChangeData}
              editMode={editMode}
              onEditModeChange={setEditMode}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <ValidationPreview
              selectedEmployees={selectedEmployees}
              selectedFields={selectedFields}
              changeData={changeData}
              onBack={() => setCurrentStep(2)}
              onNext={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 4 && (
            <ApprovalFlow
              selectedEmployees={selectedEmployees}
              selectedFields={selectedFields}
              changeData={changeData}
              onBack={() => setCurrentStep(3)}
              onSelectMoreEmployees={() => setCurrentStep(1)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
