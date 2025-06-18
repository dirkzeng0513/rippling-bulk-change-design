"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Users, Clock } from "lucide-react"

interface ChangePreviewProps {
  selectedEmployees: string[]
  changeData: any
  onBack: () => void
  onConfirm: () => void
}

const mockEmployees = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    department: "Engineering",
    role: "Senior Software Engineer",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.johnson@company.com",
    department: "Engineering",
    role: "Software Engineer",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    department: "Marketing",
    role: "Marketing Manager",
  },
]

export function ChangePreview({ selectedEmployees, changeData, onBack, onConfirm }: ChangePreviewProps) {
  const getSelectedEmployeeDetails = () => {
    return mockEmployees.filter((emp) => selectedEmployees.includes(emp.id))
  }

  const getChangesSummary = () => {
    const changes: Array<{ category: string; field: string; value: string }> = []

    Object.entries(changeData).forEach(([category, fields]: [string, any]) => {
      if (fields && typeof fields === "object") {
        Object.entries(fields).forEach(([field, value]: [string, any]) => {
          if (value && value !== "") {
            changes.push({ category, field, value: value.toString() })
          }
        })
      }
    })

    return changes
  }

  const changes = getChangesSummary()
  const employees = getSelectedEmployeeDetails()

  const formatFieldName = (field: string) => {
    return field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  }

  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Review & confirm changes</h2>
                <p className="text-gray-600">
                  Please review all changes before applying them to the selected employees
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge
                variant="outline"
                className="flex items-center space-x-2 bg-gray-50 text-gray-700 border-gray-200 px-4 py-2"
              >
                <Users className="h-4 w-4" />
                <span>{selectedEmployees.length} employees</span>
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center space-x-2 bg-amber-50 text-amber-700 border-amber-200 px-4 py-2"
              >
                <Clock className="h-4 w-4" />
                <span>{changes.length} changes</span>
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Alert className="border-amber-200 bg-amber-50 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> These changes will be applied immediately and may trigger updates across
              integrated systems (Payroll, Benefits, Slack, etc.). Some changes cannot be undone.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-100 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Affected Employees</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{employee.name}</p>
                        <p className="text-xs text-gray-500">
                          {employee.role} • {employee.department}
                        </p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  ))}
                  {selectedEmployees.length > 3 && (
                    <div className="text-center py-2">
                      <span className="text-sm text-gray-500">+{selectedEmployees.length - 3} more employees</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle>Changes to Apply</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(changeData).map(([category, fields]: [string, any]) => {
                    if (!fields || typeof fields !== "object") return null

                    const categoryChanges = Object.entries(fields).filter(
                      ([_, value]: [string, any]) => value && value !== "",
                    )
                    if (categoryChanges.length === 0) return null

                    return (
                      <div key={category} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium text-sm text-gray-900 mb-2">{formatCategoryName(category)}</h4>
                        <div className="space-y-1">
                          {categoryChanges.map(([field, value]: [string, any]) => (
                            <div key={field} className="flex justify-between text-sm">
                              <span className="text-gray-600">{formatFieldName(field)}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-amber-200 bg-amber-50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>System Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-orange-800 mb-1">Payroll</h5>
                  <p className="text-orange-700">Salary changes will be reflected in next payroll cycle</p>
                </div>
                <div>
                  <h5 className="font-medium text-orange-800 mb-1">Benefits</h5>
                  <p className="text-orange-700">Location changes may affect benefit eligibility</p>
                </div>
                <div>
                  <h5 className="font-medium text-orange-800 mb-1">Integrations</h5>
                  <p className="text-orange-700">Updates will sync to Slack, GSuite, and other connected apps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} className="px-8 py-3 rounded-xl text-base h-auto border-gray-200">
          Back to Edit
        </Button>
        <Button
          onClick={onConfirm}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-xl text-base h-auto"
        >
          Apply Changes to {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  )
}
