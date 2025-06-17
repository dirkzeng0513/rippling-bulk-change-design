"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, DollarSign, MapPin, Users, Calendar } from "lucide-react"

interface BulkChangeFormProps {
  selectedEmployees: string[]
  changeData: any
  onChangeDataUpdate: (data: any) => void
  onBack: () => void
  onNext: () => void
}

export function BulkChangeForm({
  selectedEmployees,
  changeData,
  onChangeDataUpdate,
  onBack,
  onNext,
}: BulkChangeFormProps) {
  const [activeTab, setActiveTab] = useState("basic")

  const handleFieldChange = (category: string, field: string, value: string) => {
    onChangeDataUpdate({
      ...changeData,
      [category]: {
        ...changeData[category],
        [field]: value,
      },
    })
  }

  const getChangesCount = () => {
    let count = 0
    Object.values(changeData).forEach((category: any) => {
      if (category && typeof category === "object") {
        Object.values(category).forEach((value: any) => {
          if (value && value !== "") count++
        })
      }
    })
    return count
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Configure Changes</h2>
            <p className="text-sm text-gray-500">
              Changes will be applied to {selectedEmployees.length} selected employee
              {selectedEmployees.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Badge variant="outline">
            {getChangesCount()} change{getChangesCount() !== 1 ? "s" : ""} configured
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="compensation" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Compensation</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Organization</span>
            </TabsTrigger>
            <TabsTrigger value="employment" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Employment</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Senior Software Engineer"
                      value={changeData.basic?.jobTitle || ""}
                      onChange={(e) => handleFieldChange("basic", "jobTitle", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeType">Employee Type</Label>
                    <select
                      id="employeeType"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={changeData.basic?.employeeType || ""}
                      onChange={(e) => handleFieldChange("basic", "employeeType", e.target.value)}
                    >
                      <option value="">Select type...</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contractor">Contractor</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compensation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Compensation Changes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary">Annual Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      placeholder="e.g., 120000"
                      value={changeData.compensation?.salary || ""}
                      onChange={(e) => handleFieldChange("compensation", "salary", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="effectiveDate">Effective Date</Label>
                    <Input
                      id="effectiveDate"
                      type="date"
                      value={changeData.compensation?.effectiveDate || ""}
                      onChange={(e) => handleFieldChange("compensation", "effectiveDate", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reason">Reason for Change</Label>
                  <Textarea
                    id="reason"
                    placeholder="e.g., Annual review, promotion, market adjustment..."
                    value={changeData.compensation?.reason || ""}
                    onChange={(e) => handleFieldChange("compensation", "reason", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Location & Office</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="office">Office Location</Label>
                    <select
                      id="office"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={changeData.location?.office || ""}
                      onChange={(e) => handleFieldChange("location", "office", e.target.value)}
                    >
                      <option value="">Select office...</option>
                      <option value="san-francisco">San Francisco HQ</option>
                      <option value="new-york">New York Office</option>
                      <option value="chicago">Chicago Office</option>
                      <option value="austin">Austin Office</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="workArrangement">Work Arrangement</Label>
                    <select
                      id="workArrangement"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={changeData.location?.workArrangement || ""}
                      onChange={(e) => handleFieldChange("location", "workArrangement", e.target.value)}
                    >
                      <option value="">Select arrangement...</option>
                      <option value="in-office">In Office</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Fully Remote</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organization" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Organizational Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={changeData.organization?.department || ""}
                      onChange={(e) => handleFieldChange("organization", "department", e.target.value)}
                    >
                      <option value="">Select department...</option>
                      <option value="engineering">Engineering</option>
                      <option value="product">Product</option>
                      <option value="design">Design</option>
                      <option value="marketing">Marketing</option>
                      <option value="sales">Sales</option>
                      <option value="operations">Operations</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="manager">Manager</Label>
                    <Input
                      id="manager"
                      placeholder="Search for manager..."
                      value={changeData.organization?.manager || ""}
                      onChange={(e) => handleFieldChange("organization", "manager", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employment" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={changeData.employment?.startDate || ""}
                      onChange={(e) => handleFieldChange("employment", "startDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="employmentStatus">Employment Status</Label>
                    <select
                      id="employmentStatus"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={changeData.employment?.status || ""}
                      onChange={(e) => handleFieldChange("employment", "status", e.target.value)}
                    >
                      <option value="">Select status...</option>
                      <option value="active">Active</option>
                      <option value="leave">On Leave</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={getChangesCount() === 0} className="bg-blue-600 hover:bg-blue-700">
          Review Changes
        </Button>
      </div>
    </div>
  )
}
