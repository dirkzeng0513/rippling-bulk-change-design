"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Settings,
  Upload,
  Download,
  Edit3,
  FileSpreadsheet,
  ChevronDown,
  CheckCircle,
  Sparkles,
  Code,
  Eye,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react"
import { processNaturalLanguageChanges } from "@/app/actions/natural-language-changes"

interface FieldSelectionProps {
  selectedEmployees: string[]
  selectedFields: string[]
  onFieldsChange: (fields: string[]) => void
  changeData: any
  onChangeDataUpdate: (data: any) => void
  editMode: "manual" | "csv"
  onEditModeChange: (mode: "manual" | "csv") => void
  onBack: () => void
  onNext: () => void
}

interface ChangeConfiguration {
  changes: Array<{
    field: string
    value: string
    condition?: string
  }>
  sqlQuery: string
  explanation: string
  affectedEmployees: number
  requiresApproval: boolean
}

const availableFields = [
  {
    id: "jobTitle",
    name: "Job Title",
    category: "Basic",
    sensitive: false,
    type: "dropdown",
    options: ["Individual Contributor", "Manager", "Sr.Manager", "Director", "VP", "Executives"],
  },
  {
    id: "level",
    name: "Level",
    category: "Basic",
    sensitive: false,
    type: "dropdown",
    options: ["L3", "L4", "L5", "L6", "L7", "M1", "M2", "M3"],
  },
  { id: "manager", name: "Manager", category: "Organizational", sensitive: false, type: "text" },
  { id: "department", name: "Department", category: "Organizational", sensitive: false, type: "text" },
  {
    id: "baseCompensation",
    name: "Base Compensation",
    category: "Compensation",
    sensitive: true,
    type: "dropdown",
    options: ["Band 1", "Band 2", "Band 3"],
  },
  {
    id: "bonusTarget",
    name: "Bonus Target",
    category: "Compensation",
    sensitive: true,
    type: "dropdown",
    options: ["15%", "20%", "25%", "30%"],
  },
  { id: "jobLocation", name: "Job Location", category: "Location", sensitive: false, type: "text" },
  {
    id: "employeeType",
    name: "Employee Type",
    category: "Employment",
    sensitive: false,
    type: "dropdown",
    options: ["FTE", "Contractor"],
  },
]

// Mock employee data for preview
const mockEmployeeData = {
  "1": { name: "Sarah Chen", currentJobTitle: "Software Engineer", currentLevel: "L4", currentDepartment: "EPD" },
  "2": { name: "Marcus Johnson", currentJobTitle: "Software Engineer", currentLevel: "L3", currentDepartment: "EPD" },
  "3": {
    name: "Emily Rodriguez",
    currentJobTitle: "Marketing Manager",
    currentLevel: "L4",
    currentDepartment: "Product Marketing",
  },
  "4": { name: "James Wilson", currentJobTitle: "Account Executive", currentLevel: "L3", currentDepartment: "Sales" },
  "5": {
    name: "Anna Thompson",
    currentJobTitle: "Senior Software Engineer",
    currentLevel: "L5",
    currentDepartment: "EPD",
  },
}

// Add this function to randomly select fields for demo
const getRandomlySelectedFields = () => {
  const fieldsToSelect = ["jobTitle", "level", "bonusTarget", "baseCompensation"]
  return fieldsToSelect.filter(() => Math.random() > 0.3) // Randomly include ~70% of demo fields
}

export function FieldSelection({
  selectedEmployees,
  selectedFields,
  onFieldsChange,
  changeData,
  onChangeDataUpdate,
  editMode,
  onEditModeChange,
  onBack,
  onNext,
}: FieldSelectionProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({})
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("")
  const [nlConfiguration, setNlConfiguration] = useState<ChangeConfiguration | null>(null)
  const [nlLoading, setNlLoading] = useState(false)
  const [nlError, setNlError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [showQueryPreview, setShowQueryPreview] = useState(false)
  const [activeTab, setActiveTab] = useState("manual")

  // Initialize with randomly selected fields for demo
  useEffect(() => {
    const randomFields = getRandomlySelectedFields()
    onFieldsChange(randomFields)
  }, [onFieldsChange])

  const handleFieldToggle = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      onFieldsChange(selectedFields.filter((id) => id !== fieldId))
    } else {
      onFieldsChange([...selectedFields, fieldId])
    }
  }

  const handleCellEdit = (employeeId: string, field: string, value: string) => {
    onChangeDataUpdate({
      ...changeData,
      [employeeId]: {
        ...changeData[employeeId],
        [field]: value,
      },
    })
  }

  const handleFillDown = (field: string, value: string) => {
    const updates = { ...changeData }
    selectedEmployees.forEach((empId) => {
      updates[empId] = {
        ...updates[empId],
        [field]: value,
      }
    })
    onChangeDataUpdate(updates)
  }

  const toggleDropdown = (fieldId: string) => {
    setDropdownStates((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }))
  }

  const handleDropdownSelect = (fieldId: string, value: string) => {
    handleFillDown(fieldId, value)
    setDropdownStates((prev) => ({
      ...prev,
      [fieldId]: false,
    }))
  }

  const handleNaturalLanguageChanges = async () => {
    if (!naturalLanguageQuery.trim()) return

    setNlLoading(true)
    setNlError(null)
    setUsingFallback(false)
    setShowQueryPreview(false)

    try {
      const result = await processNaturalLanguageChanges(naturalLanguageQuery, selectedEmployees.length)

      if (result.success && result.configuration) {
        setNlConfiguration(result.configuration)
        setUsingFallback(result.usingFallback || false)
        setShowQueryPreview(true)

        // Auto-apply the changes to the form
        applyNaturalLanguageChanges(result.configuration)
      } else {
        setNlError("Failed to process your change request")
      }
    } catch (error) {
      setNlError("An error occurred while processing your request")
    } finally {
      setNlLoading(false)
    }
  }

  const applyNaturalLanguageChanges = (config: ChangeConfiguration) => {
    // Extract unique fields from the changes
    const fieldsToSelect = [...new Set(config.changes.map((change) => change.field))]
    onFieldsChange(fieldsToSelect)

    // Apply the changes to all selected employees
    const updates = { ...changeData }
    selectedEmployees.forEach((empId) => {
      config.changes.forEach((change) => {
        updates[empId] = {
          ...updates[empId],
          [change.field]: change.value,
        }
      })
    })
    onChangeDataUpdate(updates)
  }

  const clearNaturalLanguageChanges = () => {
    setNlConfiguration(null)
    setNaturalLanguageQuery("")
    setNlError(null)
    setUsingFallback(false)
    setShowQueryPreview(false)
  }

  const getPreviewChanges = () => {
    if (!nlConfiguration) return []

    return selectedEmployees.slice(0, 5).map((empId) => {
      const employee = mockEmployeeData[empId as keyof typeof mockEmployeeData]
      const changes = nlConfiguration.changes.map((change) => ({
        field: change.field,
        currentValue: getCurrentValue(empId, change.field),
        newValue: change.value,
      }))

      return {
        employeeId: empId,
        employeeName: employee?.name || `Employee ${empId}`,
        changes,
      }
    })
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
        return employee.currentDepartment || "N/A"
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

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Settings className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Configure changes for selected employees
                </CardTitle>
                <p className="text-gray-600 mt-1">Choose fields to modify and specify new values</p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-amber-50 text-amber-700 border-amber-200 px-4 py-2 text-sm font-medium"
            >
              {selectedEmployees.length} employees • {selectedFields.length} fields
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-gray-50 rounded-none border-b border-gray-100 p-0 h-auto">
              <TabsTrigger
                value="manual"
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-amber-400 rounded-none px-6 py-4 font-medium flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Manual Field Editor</span>
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-amber-400 rounded-none px-6 py-4 font-medium flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Advanced Configuration</span>
              </TabsTrigger>
              <TabsTrigger
                value="csv"
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-amber-400 rounded-none px-6 py-4 font-medium flex items-center space-x-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>CSV Upload</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Fields to Modify</h3>
                <div className="grid grid-cols-2 gap-4">
                  {availableFields.map((field) => (
                    <div
                      key={field.id}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedFields.includes(field.id)
                          ? "border-amber-400 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleFieldToggle(field.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedFields.includes(field.id)}
                            className="data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400"
                          />
                          <div>
                            <div className="font-medium text-gray-900 flex items-center space-x-2">
                              <span>{field.name}</span>
                              {selectedFields.includes(field.id) && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>
                            <div className="text-sm text-gray-500">{field.category}</div>
                          </div>
                        </div>
                        {field.sensitive && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            Requires Approval
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedFields.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Employee Data</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                      <div
                        className="grid gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700"
                        style={{ gridTemplateColumns: `200px repeat(${selectedFields.length}, 1fr)` }}
                      >
                        <div>Employee</div>
                        {selectedFields.map((fieldId) => {
                          const field = availableFields.find((f) => f.id === fieldId)
                          return (
                            <div key={fieldId} className="flex items-center justify-between">
                              <span>{field?.name}</span>
                              {field?.type === "dropdown" && field.options && (
                                <div className="relative">
                                  <button
                                    onClick={() => toggleDropdown(fieldId)}
                                    className="text-xs bg-white border border-gray-200 rounded px-3 py-1 hover:bg-gray-50 flex items-center space-x-1"
                                  >
                                    <span>Fill all</span>
                                    <ChevronDown className="h-3 w-3" />
                                  </button>
                                  {dropdownStates[fieldId] && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                      {field.options.map((option) => (
                                        <button
                                          key={option}
                                          onClick={() => handleDropdownSelect(fieldId, option)}
                                          className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                                        >
                                          {option}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {selectedEmployees.slice(0, 5).map((empId) => (
                          <div
                            key={empId}
                            className="grid gap-4 p-4 items-center"
                            style={{ gridTemplateColumns: `200px repeat(${selectedFields.length}, 1fr)` }}
                          >
                            <div className="font-medium text-gray-900">Employee {empId}</div>
                            {selectedFields.map((fieldId) => {
                              const field = availableFields.find((f) => f.id === fieldId)
                              return (
                                <div key={fieldId} className="relative">
                                  {field?.type === "dropdown" && field.options ? (
                                    <select
                                      value={changeData[empId]?.[fieldId] || ""}
                                      onChange={(e) => handleCellEdit(empId, fieldId, e.target.value)}
                                      className="h-8 text-sm w-full border border-gray-200 rounded px-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    >
                                      <option value="">Select {field.name}</option>
                                      {field.options.map((option) => {
                                        const currentValue = getCurrentValue(empId, field.id)
                                        const isCurrentValue = currentValue === option
                                        return (
                                          <option
                                            key={option}
                                            value={option}
                                            className={isCurrentValue ? "bg-gray-100 font-medium" : ""}
                                            style={isCurrentValue ? { backgroundColor: "#f3f4f6" } : {}}
                                          >
                                            {option}
                                            {isCurrentValue ? " (current)" : ""}
                                          </option>
                                        )
                                      })}
                                    </select>
                                  ) : (
                                    <Input
                                      placeholder={`Enter ${field?.name}`}
                                      value={changeData[empId]?.[fieldId] || ""}
                                      onChange={(e) => handleCellEdit(empId, fieldId, e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ))}
                        {selectedEmployees.length > 5 && (
                          <div className="p-4 text-center text-sm text-gray-500">
                            +{selectedEmployees.length - 5} more employees
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="p-6 space-y-6">
              <div className="space-y-6">
                {/* Natural Language Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe the changes you want to make
                  </label>
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
                      <Input
                        placeholder="Promote all engineers to senior level and increase their bonus to 20%"
                        value={naturalLanguageQuery}
                        onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                        className="pl-12 h-12 border-gray-200 rounded-xl text-base"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleNaturalLanguageChanges()
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={handleNaturalLanguageChanges}
                      disabled={nlLoading || !naturalLanguageQuery.trim()}
                      className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 rounded-xl h-12"
                    >
                      {nlLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Generate Changes"
                      )}
                    </Button>
                    {nlConfiguration && (
                      <Button onClick={clearNaturalLanguageChanges} variant="outline" className="px-6 rounded-xl h-12">
                        Clear
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Examples: "Promote all L4 engineers to L5", "Move everyone to remote work", "Increase bonus target
                    to 25% for top performers"
                  </p>
                </div>

                {/* Error Display */}
                {nlError && (
                  <Alert className="border-red-200 bg-red-50 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{nlError}</AlertDescription>
                  </Alert>
                )}

                {/* Fallback Notice */}
                {usingFallback && nlConfiguration && (
                  <Alert className="border-blue-200 bg-blue-50 rounded-xl">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <div className="font-medium mb-1">Using Basic Parser</div>
                      <p className="text-sm">
                        OpenAI integration is not available, but we've interpreted your request using basic parsing.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Configuration Results */}
                {nlConfiguration && (
                  <Alert className="border-green-200 bg-green-50 rounded-xl">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <div className="font-medium mb-2">Configuration Applied</div>
                      <p className="text-sm mb-3">{nlConfiguration.explanation}</p>
                      <div className="flex flex-wrap gap-2">
                        {nlConfiguration.changes.map((change, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className={`text-xs ${
                              change.field === "baseCompensation" || change.field === "bonusTarget"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {change.field}: {change.value}
                          </Badge>
                        ))}
                      </div>
                      {nlConfiguration.requiresApproval && (
                        <div className="mt-2 text-sm font-medium text-amber-700">⚠️ These changes require approval</div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* SQL Query Preview */}
                {showQueryPreview && nlConfiguration && (
                  <Card className="border-gray-200 bg-gray-50 rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <Code className="h-5 w-5 text-gray-600" />
                        <span>Generated SQL Query</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <code className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                          {nlConfiguration.sqlQuery}
                        </code>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        This query will be executed to apply changes to {selectedEmployees.length} selected employees.
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Outcome Preview */}
                {nlConfiguration && (
                  <Card className="border-gray-200 rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-5 w-5 text-gray-600" />
                          <span>Change Preview</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {selectedEmployees.length} employees affected
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-700">
                          <div>Employee</div>
                          <div>Field</div>
                          <div>Current Value</div>
                          <div>New Value</div>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                          {getPreviewChanges().map((employee) =>
                            employee.changes.map((change, changeIndex) => (
                              <div
                                key={`${employee.employeeId}-${changeIndex}`}
                                className="grid grid-cols-4 gap-4 p-3 hover:bg-gray-50 items-center"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-700">
                                      {employee.employeeName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                  <span className="font-medium text-gray-900 text-sm truncate">
                                    {employee.employeeName}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 capitalize">
                                  {change.field.replace(/([A-Z])/g, " $1").trim()}
                                </div>
                                <div className="text-sm text-gray-500">{change.currentValue}</div>
                                <div className="text-sm font-medium text-green-700 flex items-center space-x-1">
                                  <span>{change.newValue}</span>
                                  {(change.field === "baseCompensation" || change.field === "bonusTarget") && (
                                    <span className="text-amber-600">⚠️</span>
                                  )}
                                </div>
                              </div>
                            )),
                          )}
                          {selectedEmployees.length > 5 && (
                            <div className="p-3 text-center text-sm text-gray-500 bg-gray-50">
                              +{selectedEmployees.length - 5} more employees will receive the same changes
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="csv" className="p-6 space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">CSV Upload</h3>
                <p className="text-gray-600 mb-6">Download, edit offline, and re-upload your employee data</p>

                <div className="flex justify-center space-x-4">
                  <Button variant="outline" className="px-6 py-3 rounded-xl text-base h-auto border-gray-200">
                    <Download className="h-4 w-4 mr-2" />
                    Download Filtered CSV
                  </Button>
                  <Button className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-xl text-base h-auto">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Updated CSV
                  </Button>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                  <p>CSV will include: Employee ID, Email, and current values for selected fields</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="px-8 py-3 rounded-xl text-base h-auto border-gray-200">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={selectedFields.length === 0}
          className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-xl text-base h-auto"
        >
          Continue to Preview
        </Button>
      </div>
    </div>
  )
}
