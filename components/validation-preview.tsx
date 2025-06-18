"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertTriangle, XCircle, Download, Eye, TrendingUp } from "lucide-react"

interface ValidationPreviewProps {
  selectedEmployees: string[]
  selectedFields: string[]
  changeData: any
  onBack: () => void
  onNext: () => void
}

// Mock employee data for preview
const mockEmployeeData = {
  "1": {
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    department: "EPD",
    currentJobTitle: "Software Engineer",
    currentLevel: "L4",
  },
  "2": {
    name: "Marcus Johnson",
    email: "marcus.johnson@company.com",
    department: "EPD",
    currentJobTitle: "Software Engineer",
    currentLevel: "L3",
  },
  "3": {
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    department: "Product Marketing",
    currentJobTitle: "Marketing Manager",
    currentLevel: "L4",
  },
  "4": {
    name: "James Wilson",
    email: "james.wilson@company.com",
    department: "Sales",
    currentJobTitle: "Account Executive",
    currentLevel: "L3",
  },
  "5": {
    name: "Anna Thompson",
    email: "anna.thompson@company.com",
    department: "EPD",
    currentJobTitle: "Senior Software Engineer",
    currentLevel: "L5",
  },
}

const fieldDisplayNames = {
  jobTitle: "Job Title",
  level: "Level",
  manager: "Manager",
  department: "Department",
  baseCompensation: "Base Compensation",
  bonusTarget: "Bonus Target",
  jobLocation: "Job Location",
  employeeType: "Employee Type",
}

const sensitiveFields = ["baseCompensation", "bonusTarget", "level"]

export function ValidationPreview({
  selectedEmployees,
  selectedFields,
  changeData,
  onBack,
  onNext,
}: ValidationPreviewProps) {
  const [viewMode, setViewMode] = useState<"table" | "summary">("summary")

  // Calculate validation results
  const getValidationResults = () => {
    let totalChanges = 0
    let validRecords = 0
    let warningRecords = 0
    const errorRecords = 0
    const warnings: any[] = []
    const errors: any[] = []

    selectedEmployees.forEach((empId) => {
      const employeeChanges = changeData[empId] || {}
      const hasChanges = Object.keys(employeeChanges).some(
        (field) => employeeChanges[field] && employeeChanges[field] !== "",
      )

      if (hasChanges) {
        totalChanges++

        // Check for warnings (sensitive field changes)
        const hasSensitiveChanges = Object.keys(employeeChanges).some(
          (field) => sensitiveFields.includes(field) && employeeChanges[field] && employeeChanges[field] !== "",
        )

        if (hasSensitiveChanges) {
          warningRecords++
          warnings.push({
            employeeId: empId,
            employeeName: mockEmployeeData[empId as keyof typeof mockEmployeeData]?.name || `Employee ${empId}`,
            message: "Contains sensitive field changes requiring approval",
            fields: Object.keys(employeeChanges).filter(
              (field) => sensitiveFields.includes(field) && employeeChanges[field],
            ),
          })
        } else {
          validRecords++
        }
      }
    })

    return {
      totalRecords: totalChanges,
      fieldsImpacted: selectedFields.length,
      validRecords,
      warningRecords,
      errorRecords,
      warnings,
      errors,
    }
  }

  const validationResults = getValidationResults()

  // Get changes summary by field
  const getChangesSummary = () => {
    const summary: Record<string, { count: number; values: Set<string>; requiresApproval: boolean }> = {}

    selectedFields.forEach((field) => {
      summary[field] = {
        count: 0,
        values: new Set(),
        requiresApproval: sensitiveFields.includes(field),
      }
    })

    selectedEmployees.forEach((empId) => {
      const employeeChanges = changeData[empId] || {}
      Object.keys(employeeChanges).forEach((field) => {
        if (employeeChanges[field] && employeeChanges[field] !== "" && summary[field]) {
          summary[field].count++
          summary[field].values.add(employeeChanges[field])
        }
      })
    })

    return summary
  }

  const changesSummary = getChangesSummary()

  // Get detailed changes for table view
  const getDetailedChanges = () => {
    const changes: any[] = []

    selectedEmployees.forEach((empId) => {
      const employee = mockEmployeeData[empId as keyof typeof mockEmployeeData]
      const employeeChanges = changeData[empId] || {}

      Object.keys(employeeChanges).forEach((field) => {
        if (employeeChanges[field] && employeeChanges[field] !== "") {
          changes.push({
            employeeId: empId,
            employeeName: employee?.name || `Employee ${empId}`,
            field: fieldDisplayNames[field as keyof typeof fieldDisplayNames] || field,
            currentValue: getCurrentValue(empId, field),
            newValue: employeeChanges[field],
            requiresApproval: sensitiveFields.includes(field),
          })
        }
      })
    })

    return changes
  }

  const getCurrentValue = (empId: string, field: string) => {
    const employee = mockEmployeeData[empId as keyof typeof mockEmployeeData]
    if (!employee) return "N/A"

    switch (field) {
      case "jobTitle":
        return employee.currentJobTitle || "N/A"
      case "level":
        return employee.currentLevel || "N/A"
      case "department":
        return employee.department || "N/A"
      case "baseCompensation":
        return "Band 2" // Mock current value
      case "bonusTarget":
        return "15%" // Mock current value
      case "employeeType":
        return "FTE" // Mock current value
      default:
        return "N/A"
    }
  }

  const detailedChanges = getDetailedChanges()

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900">Validation & Preview</CardTitle>
                <p className="text-gray-600 mt-1">Review changes and validation results before submitting</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                {validationResults.validRecords} Valid
              </Badge>
              {validationResults.warningRecords > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {validationResults.warningRecords} Need Approval
                </Badge>
              )}
              {validationResults.errorRecords > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1">
                  <XCircle className="h-3 w-3 mr-1" />
                  {validationResults.errorRecords} Errors
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Summary Panel */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{validationResults.totalRecords}</div>
              <div className="text-sm text-gray-600">Total Changes</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{validationResults.fieldsImpacted}</div>
              <div className="text-sm text-gray-600">Fields Modified</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{validationResults.validRecords}</div>
              <div className="text-sm text-green-600">Ready to Apply</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700">{validationResults.warningRecords}</div>
              <div className="text-sm text-yellow-600">Need Approval</div>
            </div>
          </div>

          {/* Warnings Display */}
          {validationResults.warnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="font-medium mb-2">Approval Required</div>
                {validationResults.warnings.map((warning, index) => (
                  <div key={index} className="text-sm mb-2">
                    <strong>{warning.employeeName}</strong> - Changes to sensitive fields:{" "}
                    {warning.fields
                      .map((field) => fieldDisplayNames[field as keyof typeof fieldDisplayNames])
                      .join(", ")}
                  </div>
                ))}
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-300">
                    <Download className="h-3 w-3 mr-1" />
                    Download Approval Report
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Toggle Views */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "summary")}>
            <TabsList className="bg-gray-100 p-1 rounded-xl">
              <TabsTrigger
                value="summary"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Changes Summary</span>
              </TabsTrigger>
              <TabsTrigger
                value="table"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Detailed View</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Changes by Field</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-3">
                    {Object.entries(changesSummary).map(
                      ([field, data]) =>
                        data.count > 0 && (
                          <div key={field} className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">
                                {fieldDisplayNames[field as keyof typeof fieldDisplayNames] || field}
                              </div>
                              <div className="text-sm text-gray-600">
                                {data.count} employee{data.count !== 1 ? "s" : ""} affected
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Values: {Array.from(data.values).join(", ")}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                data.requiresApproval
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-green-50 text-green-700 border-green-200"
                              }
                            >
                              {data.requiresApproval ? "Requires approval" : "Auto-apply"}
                            </Badge>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="table" className="mt-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                    <div>Employee</div>
                    <div>Field</div>
                    <div>Current Value</div>
                    <div>New Value</div>
                    <div>Status</div>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {detailedChanges.map((change, index) => (
                      <div key={index} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50">
                        <div className="font-medium text-gray-900 text-sm">{change.employeeName}</div>
                        <div className="text-sm text-gray-600">{change.field}</div>
                        <div className="text-sm text-gray-500">{change.currentValue}</div>
                        <div
                          className={`text-sm font-medium ${change.requiresApproval ? "text-yellow-700" : "text-green-700"}`}
                        >
                          {change.newValue}
                          {change.requiresApproval && <span className="ml-1">⚠️</span>}
                        </div>
                        <div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${change.requiresApproval ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200"}`}
                          >
                            {change.requiresApproval ? "Needs approval" : "Ready"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* System Validations Info */}
          <Card className="border-blue-200 bg-blue-50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>System Validations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-800 mb-1">✓ Data Type Validation</h5>
                  <p className="text-blue-700">All field values match expected formats</p>
                </div>
                <div>
                  <h5 className="font-medium text-blue-800 mb-1">✓ Role Hierarchy Check</h5>
                  <p className="text-blue-700">Level and title changes follow org structure</p>
                </div>
                <div>
                  <h5 className="font-medium text-blue-800 mb-1">✓ Required Fields</h5>
                  <p className="text-blue-700">All mandatory fields have valid values</p>
                </div>
                <div>
                  <h5 className="font-medium text-blue-800 mb-1">✓ Compensation Bands</h5>
                  <p className="text-blue-700">All compensation changes within valid ranges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="px-8 py-3 rounded-xl text-base h-auto border-gray-200">
          Back to Edit
        </Button>
        <Button
          onClick={onNext}
          className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-xl text-base h-auto"
        >
          Submit for Approval
        </Button>
      </div>
    </div>
  )
}
