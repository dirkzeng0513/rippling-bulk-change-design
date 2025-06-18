"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Clock, MessageSquare, User, Users } from "lucide-react"

interface ApprovalFlowProps {
  selectedEmployees: string[]
  selectedFields: string[]
  changeData: any
  onBack: () => void
  onSelectMoreEmployees: () => void
}

export function ApprovalFlow({
  selectedEmployees,
  selectedFields,
  changeData,
  onBack,
  onSelectMoreEmployees,
}: ApprovalFlowProps) {
  const [submissionStatus, setSubmissionStatus] = useState<"pending" | "submitted">("pending")

  const sensitiveFields = ["baseCompensation", "bonusTarget", "level"]
  const hasSensitiveChanges = selectedFields.some((field) => sensitiveFields.includes(field))

  const handleSubmit = () => {
    setSubmissionStatus("submitted")
  }

  if (submissionStatus === "submitted") {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-semibold text-green-900">Changes Submitted Successfully</CardTitle>
            <p className="text-green-700 mt-2">
              {hasSensitiveChanges
                ? "Your changes have been submitted for approval and will be reviewed shortly."
                : "Your changes have been applied immediately to all selected employees."}
            </p>
          </CardHeader>
        </Card>

        {hasSensitiveChanges && (
          <Card className="border-gray-100 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Changes Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedEmployees.slice(0, 3).map((empId, index) => (
                  <div key={empId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">{String.fromCharCode(65 + index)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Employee {empId}</div>
                        <div className="text-sm text-gray-600">Base Compensation Change</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exit buttons for the success/submitted page */}
        <div className="flex justify-between pt-6">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="px-8 py-3 rounded-xl text-base h-auto border-gray-200 flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <span>Exit</span>
            </Button>
            <Button
              variant="outline"
              onClick={onSelectMoreEmployees}
              className="px-8 py-3 rounded-xl text-base h-auto border-gray-200 flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Select More Employees to Edit</span>
            </Button>
          </div>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl text-base h-auto"
          >
            Done
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold text-gray-900">Approval & Submit</CardTitle>
              <p className="text-gray-600 mt-1">
                {hasSensitiveChanges
                  ? "Some changes require approval before being applied"
                  : "Ready to apply changes to selected employees"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {hasSensitiveChanges ? (
            <>
              <Alert className="border-amber-200 bg-amber-50 rounded-xl">
                <User className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="font-medium mb-2">Approval Required</div>
                  <p>Changes to compensation and level require approval from your manager or HR admin.</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4" />
                      <span>Approver: Sarah Johnson (HR Director)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MessageSquare className="h-4 w-4" />
                      <span>Slack notification will be sent automatically</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <Card className="border-gray-100 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Approval Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Initiated by:</span>
                        <div className="text-gray-900">John Doe (HR Admin)</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Submission date:</span>
                        <div className="text-gray-900">{new Date().toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Employees affected:</span>
                        <div className="text-gray-900">{selectedEmployees.length}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Fields modified:</span>
                        <div className="text-gray-900">{selectedFields.length}</div>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700 block mb-2">Changes requiring approval:</span>
                      <div className="space-y-2">
                        {selectedFields
                          .filter((field) => sensitiveFields.includes(field))
                          .map((field) => (
                            <Badge key={field} variant="outline" className="mr-2 bg-red-50 text-red-700 border-red-200">
                              {field === "baseCompensation"
                                ? "Base Compensation"
                                : field === "bonusTarget"
                                  ? "Bonus Target"
                                  : field === "level"
                                    ? "Level"
                                    : field}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Alert className="border-green-200 bg-green-50 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="font-medium mb-2">Ready to Apply</div>
                <p>All selected changes can be applied immediately without additional approval.</p>
              </AlertDescription>
            </Alert>
          )}

          <Card className="border-blue-200 bg-blue-50 rounded-xl">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Notifications & Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-blue-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Slack notifications will be sent to approvers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Audit trail will be recorded for all changes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Employee records will be updated automatically upon approval</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="px-8 py-3 rounded-xl text-base h-auto border-gray-200 flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <span>Exit</span>
          </Button>
          <Button
            variant="outline"
            onClick={onSelectMoreEmployees}
            className="px-8 py-3 rounded-xl text-base h-auto border-gray-200 flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Select More Employees to Edit</span>
          </Button>
          <Button variant="outline" onClick={onBack} className="px-8 py-3 rounded-xl text-base h-auto border-gray-200">
            Back to Preview
          </Button>
        </div>
        <Button
          onClick={handleSubmit}
          className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-xl text-base h-auto"
        >
          {hasSensitiveChanges ? "Submit for Approval" : "Apply Changes Now"}
        </Button>
      </div>
    </div>
  )
}
