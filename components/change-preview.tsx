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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Review & Confirm Changes</h2>
              <p className="text-sm text-gray-500">
                Please review all changes before applying them to the selected employees
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{selectedEmployees.length} employees</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{changes.length} changes</span>
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> These changes will be applied immediately and may trigger updates across
              integrated systems (Payroll, Benefits, Slack, etc.). Some changes cannot be undone.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
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

            <Card>
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

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">System Impact</CardTitle>
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Edit
        </Button>
        <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">
          Apply Changes to {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  )
}
