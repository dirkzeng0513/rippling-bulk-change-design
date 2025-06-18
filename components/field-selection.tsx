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
  Plus,
  Clock,
  AlertTriangle,
  Users,
} from "lucide-react"
import { processNaturalLanguageChanges } from "@/app/actions/natural-language-changes"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

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

const mainFields = [
  {
    id: "jobTitle",
    name: "Job Title",
    category: "Basic",
    sensitive: false,
    type: "dropdown",
    options: ["IC", "Manager", "Sr.Manager", "Director", "Sr.Director", "VP", "Executive"],
    descriptions: {
      IC: "Individual Contributor - A non-managerial role focused on specific tasks.",
      Manager: "Responsible for leading a team and overseeing their work.",
      "Sr.Manager": "Senior Manager - Manages multiple teams or a larger department.",
      Director: "Director - Leads a significant function or division within the company.",
      "Sr.Director": "Senior Director - Oversees multiple departments or strategic initiatives.",
      VP: "Vice President - A high-level executive responsible for a major area of the company.",
      Executive: "Executive - Part of the top leadership, setting the company's overall direction.",
    },
  },
  {
    id: "level",
    name: "Level",
    category: "Basic",
    sensitive: false,
    type: "dropdown",
    options: ["L3", "L4", "L5", "L6", "L7", "M1", "M2", "M3"],
    descriptions: {
      L3: "Entry-level position requiring basic skills and knowledge.",
      L4: "Proficient level with growing expertise and independence.",
      L5: "Advanced level with specialized knowledge and leadership potential.",
      L6: "Expert level, contributing significantly to strategic initiatives.",
      L7: "Principal level, leading complex projects and mentoring others.",
      M1: "First-level management, leading small teams.",
      M2: "Mid-level management, managing multiple teams or projects.",
      M3: "Senior management, influencing organizational strategy.",
    },
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
    descriptions: {
      "Band 1": "Entry-level compensation band.",
      "Band 2": "Mid-level compensation band.",
      "Band 3": "Senior-level compensation band.",
    },
  },
  {
    id: "bonusTarget",
    name: "Bonus Target",
    category: "Compensation",
    sensitive: true,
    type: "dropdown",
    options: ["15%", "20%", "25%", "30%"],
    descriptions: {
      "15%": "Standard bonus target for entry-level positions.",
      "20%": "Increased bonus target for mid-level positions.",
      "25%": "High bonus target for senior-level positions.",
      "30%": "Maximum bonus target for top performers.",
    },
  },
  { id: "jobLocation", name: "Job Location", category: "Location", sensitive: false, type: "text" },
  {
    id: "employeeType",
    name: "Employee Type",
    category: "Employment",
    sensitive: false,
    type: "dropdown",
    options: ["FTE", "Contractor"],
    descriptions: {
      FTE: "Full-Time Employee - Benefits eligible.",
      Contractor: "Contractor - Not benefits eligible.",
    },
  },
]

const additionalFields = [
  {
    id: "integration",
    name: "Integration",
    category: "System",
    sensitive: false,
    type: "dropdown",
    options: ["Slack", "Zendesk", "Github", "Gong", "Vercel"],
    descriptions: {
      Slack: "Slack workspace integration for team communication.",
      Zendesk: "Customer support ticket system integration.",
      Github: "Code repository and development workflow integration.",
      Gong: "Sales conversation analytics and coaching platform.",
      Vercel: "Frontend deployment and hosting platform integration.",
    },
  },
]

// Update availableFields to use mainFields.concat(additionalFields)
const availableFields = mainFields.concat(additionalFields)

// Generate comprehensive mock employee data that matches the selection component
const generateMockEmployeeData = () => {
  const departments = ["EPD", "Product Marketing", "Sales", "Commercial", "Legal", "Customer Success"]
  const jobTitles = ["IC", "Manager", "Sr.Manager", "Director", "Sr.Director", "VP", "Executive"]
  const locations = ["San Francisco", "New York", "Chicago", "Austin", "Remote", "Seattle", "Boston", "Los Angeles"]
  const managers = [
    "David Kim",
    "Lisa Park",
    "Robert Lee",
    "Jennifer Davis",
    "Michael Chen",
    "Sarah Johnson",
    "Alex Rodriguez",
    "Emily Thompson",
  ]
  const integrations = ["Slack", "Zendesk", "Github", "Gong", "Vercel"]
  const compensationBands = ["Band 1", "Band 2", "Band 3"]
  const bonusTargets = ["10%", "15%", "20%", "25%", "30%"]
  const employeeTypes = ["FTE", "Contractor"]

  const firstNames = [
    "Sarah",
    "Marcus",
    "Emily",
    "James",
    "Anna",
    "Michael",
    "Jessica",
    "David",
    "Lisa",
    "Robert",
    "Jennifer",
    "Alex",
    "Chris",
    "Taylor",
    "Jordan",
    "Casey",
    "Morgan",
    "Riley",
    "Avery",
    "Quinn",
    "Sam",
    "Blake",
    "Drew",
    "Sage",
    "River",
    "Phoenix",
    "Skylar",
    "Rowan",
    "Finley",
    "Hayden",
    "Cameron",
    "Peyton",
    "Reese",
    "Dakota",
    "Emery",
    "Kendall",
    "Marlowe",
    "Remy",
    "Shiloh",
    "Tatum",
    "Bryce",
    "Kai",
    "Lane",
    "Nico",
    "Raven",
    "Sage",
    "Teal",
    "Vale",
    "Wren",
    "Zion",
    "Adrian",
    "Bailey",
    "Carmen",
    "Devin",
    "Eden",
    "Frankie",
    "Gray",
    "Harper",
    "Indigo",
    "Jules",
    "Kris",
    "Logan",
    "Max",
    "Nova",
    "Ocean",
    "Parker",
    "Quinn",
    "Robin",
    "Storm",
    "True",
    "Uma",
    "Val",
    "Winter",
    "Xen",
    "Yael",
    "Zen",
    "Ari",
    "Bay",
    "Cove",
    "Dune",
    "Echo",
    "Fern",
    "Grove",
    "Haven",
    "Iris",
    "Jade",
    "Knox",
    "Lux",
    "Moon",
    "North",
    "Onyx",
    "Pine",
    "Quest",
    "Rain",
    "Star",
    "Tide",
    "Unity",
    "Vega",
    "Wave",
    "Zara",
  ]

  const lastNames = [
    "Chen",
    "Johnson",
    "Rodriguez",
    "Wilson",
    "Thompson",
    "Brown",
    "Davis",
    "Miller",
    "Garcia",
    "Martinez",
    "Anderson",
    "Taylor",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Clark",
    "Lewis",
    "Walker",
    "Hall",
    "Allen",
    "Young",
    "King",
    "Wright",
    "Lopez",
    "Hill",
    "Scott",
    "Green",
    "Adams",
    "Baker",
    "Gonzalez",
    "Nelson",
    "Carter",
    "Mitchell",
    "Perez",
    "Roberts",
    "Turner",
    "Phillips",
    "Campbell",
    "Parker",
    "Evans",
    "Edwards",
    "Collins",
    "Stewart",
    "Sanchez",
    "Morris",
    "Rogers",
    "Reed",
    "Cook",
    "Morgan",
    "Bell",
    "Murphy",
    "Bailey",
    "Rivera",
    "Cooper",
    "Richardson",
    "Cox",
    "Howard",
    "Ward",
    "Torres",
    "Peterson",
    "Gray",
    "Ramirez",
    "James",
    "Watson",
    "Brooks",
    "Kelly",
    "Sanders",
    "Price",
    "Bennett",
    "Wood",
    "Barnes",
    "Ross",
    "Henderson",
    "Coleman",
    "Jenkins",
    "Perry",
    "Powell",
    "Long",
    "Patterson",
    "Hughes",
    "Flores",
    "Washington",
    "Butler",
    "Simmons",
    "Foster",
    "Gonzales",
    "Bryant",
    "Alexander",
    "Russell",
    "Griffin",
    "Diaz",
    "Hayes",
    "Myers",
    "Ford",
    "Hamilton",
    "Graham",
    "Sullivan",
    "Wallace",
  ]

  const employees: Record<string, any> = {}

  for (let i = 1; i <= 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${firstName} ${lastName}`
    const department = departments[Math.floor(Math.random() * departments.length)]
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    const manager = managers[Math.floor(Math.random() * managers.length)]
    const integration = integrations[Math.floor(Math.random() * integrations.length)]
    const baseCompensation = compensationBands[Math.floor(Math.random() * compensationBands.length)]
    const bonusTarget = bonusTargets[Math.floor(Math.random() * bonusTargets.length)]
    const employeeType = employeeTypes[Math.floor(Math.random() * employeeTypes.length)]

    // Generate level based on job title
    let level = "L4"
    if (jobTitle === "IC") level = ["L3", "L4", "L5"][Math.floor(Math.random() * 3)]
    else if (jobTitle === "Manager") level = "M1"
    else if (jobTitle === "Sr.Manager") level = "M2"
    else if (jobTitle === "Director") level = "M2"
    else if (jobTitle === "Sr.Director") level = "M3"
    else if (jobTitle === "VP") level = "M3"
    else if (jobTitle === "Executive") level = "M3"

    employees[i.toString()] = {
      name,
      currentJobTitle: jobTitle,
      currentLevel: level,
      currentDepartment: department,
      currentManager: manager,
      currentLocation: location,
      startDate: new Date(
        2020 + Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      )
        .toISOString()
        .split("T")[0],
      employeeId: `EMP${String(i).padStart(3, "0")}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      currentBaseCompensation: baseCompensation,
      currentBonusTarget: bonusTarget,
      currentEmployeeType: employeeType,
      currentIntegration: integration,
    }
  }

  return employees
}

const mockEmployeeData = generateMockEmployeeData()

// Add this function to randomly select fields for demo
const getRandomlySelectedFields = () => {
  const fieldsToSelect = ["jobTitle", "level", "bonusTarget", "baseCompensation"]
  return fieldsToSelect.filter(() => Math.random() > 0.3) // Randomly include ~70% of demo fields
}

const getPerformanceRating = (empId: string) => {
  // Generate a random performance rating between 1-5 for demo
  const ratings = ["1", "2", "3", "4", "5"]
  const seed = Number.parseInt(empId) || 1
  return ratings[seed % 5]
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
  const [showEditorConfig, setShowEditorConfig] = useState(false)
  const [editorColumns, setEditorColumns] = useState([
    { key: "currentDepartment", label: "Department", enabled: true },
    { key: "currentJobTitle", label: "Job Title", enabled: true },
    { key: "currentLevel", label: "Level", enabled: true },
    { key: "currentManager", label: "Manager", enabled: false },
    { key: "currentLocation", label: "Location", enabled: false },
    { key: "startDate", label: "Start Date", enabled: false },
    { key: "currentBaseCompensation", label: "Base Compensation", enabled: false },
    { key: "currentBonusTarget", label: "Bonus Target", enabled: false },
    { key: "currentEmployeeType", label: "Employee Type", enabled: false },
    { key: "currentIntegration", label: "Integration", enabled: false },
    { key: "performanceRating", label: "Performance Rating", enabled: false },
  ])

  // Add new state for additional fields dropdown
  const [showAdditionalFields, setShowAdditionalFields] = useState(false)

  const [showChangeHistory, setShowChangeHistory] = useState(false)
  const [changeHistory, setChangeHistory] = useState([
    {
      id: "CH001",
      date: "2024-01-15T10:30:00Z",
      initiatedBy: "John Doe",
      employeesAffected: 12,
      fieldsChanged: ["jobTitle", "level"],
      status: "completed",
      completedAt: "2024-01-15T11:45:00Z",
      description: "Promoted engineers to senior level",
    },
    {
      id: "CH002",
      date: "2024-01-14T14:20:00Z",
      initiatedBy: "Sarah Johnson",
      employeesAffected: 8,
      fieldsChanged: ["baseCompensation", "bonusTarget"],
      status: "pending",
      pendingSince: "2024-01-14T14:20:00Z",
      description: "Annual compensation review adjustments",
    },
    {
      id: "CH003",
      date: "2024-01-12T09:15:00Z",
      initiatedBy: "Mike Chen",
      employeesAffected: 25,
      fieldsChanged: ["department", "manager"],
      status: "completed",
      completedAt: "2024-01-12T16:30:00Z",
      description: "Organizational restructure - moved employees to new teams",
    },
  ])
  const [pendingEmployees] = useState(["2", "5", "8", "12", "15"]) // Mock pending employee IDs

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
        return employee.currentBaseCompensation || "N/A"
      case "bonusTarget":
        return employee.currentBonusTarget || "N/A"
      case "employeeType":
        return employee.currentEmployeeType || "N/A"
      case "manager":
        return employee.currentManager || "N/A"
      case "jobLocation":
        return employee.currentLocation || "N/A"
      default:
        return "N/A"
    }
  }

  const getEmployeeValue = (empId: string, columnKey: string) => {
    const employee = mockEmployeeData[empId as keyof typeof mockEmployeeData]
    if (!employee) return "N/A"

    switch (columnKey) {
      case "name":
        return employee.name
      case "employeeId":
        return employee.employeeId
      case "currentDepartment":
        return employee.currentDepartment
      case "currentManager":
        return employee.currentManager
      case "currentLocation":
        return employee.currentLocation
      case "startDate":
        return new Date(employee.startDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      case "currentJobTitle":
        return employee.currentJobTitle
      case "currentLevel":
        return employee.currentLevel
      case "currentBaseCompensation":
        return employee.currentBaseCompensation
      case "currentBonusTarget":
        return employee.currentBonusTarget
      case "currentEmployeeType":
        return employee.currentEmployeeType
      case "currentIntegration":
        return employee.currentIntegration
      case "performanceRating":
        return getPerformanceRating(empId)
      default:
        return "N/A"
    }
  }

  const getIntegrationBadgeColor = (integration: string) => {
    const colors: Record<string, string> = {
      Slack: "bg-purple-50 text-purple-700 border-purple-200",
      Zendesk: "bg-green-50 text-green-700 border-green-200",
      Github: "bg-gray-50 text-gray-700 border-gray-200",
      Gong: "bg-orange-50 text-orange-700 border-orange-200",
      Vercel: "bg-black text-white border-black",
    }
    return colors[integration] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  const enabledEditorColumns = editorColumns.filter((col) => col.enabled)
  const totalColumns = 2 + enabledEditorColumns.length + selectedFields.length // 2 for name and ID

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {status}
          </Badge>
        )
    }
  }

  const hasPendingEmployees = selectedEmployees.some((empId) => pendingEmployees.includes(empId))

  return (
    <div className="space-y-6">
      <TooltipProvider>
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
                {/* Header with buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">Choose Fields to Modify</h3>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdditionalFields(!showAdditionalFields)}
                        className="px-3 py-2 text-sm border-gray-200 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Additional Fields</span>
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${showAdditionalFields ? "rotate-180" : ""}`}
                        />
                      </Button>
                      {showAdditionalFields && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[300px]">
                          <div className="p-4 space-y-3">
                            <div className="text-sm font-medium text-gray-700 mb-2">Additional Fields</div>
                            {additionalFields.map((field) => (
                              <div
                                key={field.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-all ${
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
                                        {selectedFields.includes(field.id) && (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
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
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChangeHistory(true)}
                      className="px-3 py-2 text-sm border-gray-200 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Change History</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBack}
                      className="px-3 py-2 text-sm border-gray-200 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Users className="h-4 w-4" />
                      <span>Select Employees</span>
                    </Button>
                  </div>
                </div>

                {/* Warning for pending employees */}
                {hasPendingEmployees && (
                  <Alert className="border-amber-200 bg-amber-50 rounded-xl">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <div className="font-medium mb-1">Pending Changes Detected</div>
                      <p className="text-sm">
                        Some selected employees have pending changes that require approval. These employees cannot be
                        modified until their current changes are processed.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedEmployees
                          .filter((empId) => pendingEmployees.includes(empId))
                          .slice(0, 3)
                          .map((empId) => (
                            <Badge
                              key={empId}
                              variant="outline"
                              className="text-xs bg-red-50 text-red-700 border-red-200"
                            >
                              {getEmployeeValue(empId, "name")}
                            </Badge>
                          ))}
                        {selectedEmployees.filter((empId) => pendingEmployees.includes(empId)).length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                            +{selectedEmployees.filter((empId) => pendingEmployees.includes(empId)).length - 3} more
                          </Badge>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {mainFields.map((field) => (
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

                {selectedFields.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Edit Employee Data</h3>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowEditorConfig(true)}
                          className="px-3 py-2 text-sm border-gray-200 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Configure View</span>
                        </Button>
                        <div className="text-sm text-gray-500">
                          Showing Employee Name, ID + {enabledEditorColumns.length} display columns +{" "}
                          {selectedFields.length} edit fields
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                        <table className="w-full table-fixed">
                          {/* Header */}
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              {/* Always show Employee Name and ID */}
                              <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 w-48">
                                <div className="flex items-center space-x-1">
                                  <span>Employee Name</span>
                                </div>
                              </th>
                              <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 w-32">
                                <div className="flex items-center space-x-1">
                                  <span>Employee ID</span>
                                </div>
                              </th>
                              {/* Configurable display columns */}
                              {enabledEditorColumns.map((column) => (
                                <th
                                  key={column.key}
                                  className="px-3 py-3 text-left text-sm font-medium text-gray-700 w-32"
                                >
                                  <div className="flex items-center space-x-1">
                                    <span>{column.label}</span>
                                  </div>
                                </th>
                              ))}
                              {/* Edit fields */}
                              {selectedFields.map((fieldId) => {
                                const field = availableFields.find((f) => f.id === fieldId)
                                return (
                                  <th
                                    key={fieldId}
                                    className="px-3 py-3 text-left text-sm font-medium text-gray-700 w-40"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1">
                                        <span>{field?.name}</span>
                                      </div>
                                      {field?.type === "dropdown" && field.options && (
                                        <div className="relative">
                                          <button
                                            onClick={() => toggleDropdown(fieldId)}
                                            className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 flex items-center space-x-1"
                                          >
                                            <span>Fill all</span>
                                            <ChevronDown className="h-3 w-3" />
                                          </button>
                                          {dropdownStates[fieldId] && (
                                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                                              {field.options.map((option) => (
                                                <Tooltip key={option}>
                                                  <TooltipTrigger asChild>
                                                    <button
                                                      onClick={() => handleDropdownSelect(fieldId, option)}
                                                      className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg bg-white"
                                                    >
                                                      <div className="font-medium">{option}</div>
                                                      {field.descriptions?.[option] && (
                                                        <div className="text-gray-500 text-xs mt-1 truncate">
                                                          {field.descriptions[option].split(" - ")[0]}...
                                                        </div>
                                                      )}
                                                    </button>
                                                  </TooltipTrigger>
                                                  {field.descriptions?.[option] && (
                                                    <TooltipContent side="left" className="max-w-sm bg-white">
                                                      <div className="space-y-1">
                                                        <p className="font-medium text-sm">{option}</p>
                                                        <p className="text-xs text-gray-600">
                                                          {field.descriptions[option]}
                                                        </p>
                                                      </div>
                                                    </TooltipContent>
                                                  )}
                                                </Tooltip>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </th>
                                )
                              })}
                            </tr>
                          </thead>

                          {/* Body */}
                          <tbody className="bg-white divide-y divide-gray-100">
                            {selectedEmployees.slice(0, 5).map((empId) => (
                              <tr key={empId} className="hover:bg-gray-50">
                                {/* Always show Employee Name and ID */}
                                <td className="px-3 py-3 text-left">
                                  <div className="font-medium text-gray-900 text-sm">
                                    {getEmployeeValue(empId, "name")}
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-left">
                                  <div className="text-xs font-mono text-gray-900">
                                    {getEmployeeValue(empId, "employeeId")}
                                  </div>
                                </td>
                                {/* Configurable display columns */}
                                {enabledEditorColumns.map((column) => (
                                  <td key={column.key} className="px-3 py-3 text-left">
                                    {column.key === "startDate" ? (
                                      <div className="text-xs text-gray-600">{getEmployeeValue(empId, column.key)}</div>
                                    ) : column.key === "currentIntegration" ? (
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${getIntegrationBadgeColor(getEmployeeValue(empId, column.key))}`}
                                      >
                                        {getEmployeeValue(empId, column.key)}
                                      </Badge>
                                    ) : column.key === "performanceRating" ? (
                                      <div className="flex items-center space-x-1">
                                        <span className="text-sm font-medium text-gray-900">
                                          {getEmployeeValue(empId, column.key)}
                                        </span>
                                        <div className="flex space-x-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                              key={star}
                                              className={`text-xs ${
                                                star <= Number.parseInt(getEmployeeValue(empId, column.key))
                                                  ? "text-yellow-400"
                                                  : "text-gray-300"
                                              }`}
                                            >
                                              ★
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ) : column.key.includes("current") &&
                                      (column.key.includes("Compensation") || column.key.includes("Bonus")) ? (
                                      <div className="text-sm font-medium text-blue-600">
                                        {getEmployeeValue(empId, column.key)}
                                      </div>
                                    ) : (
                                      <div className="text-sm text-gray-600">{getEmployeeValue(empId, column.key)}</div>
                                    )}
                                  </td>
                                ))}
                                {/* Edit fields */}
                                {selectedFields.map((fieldId) => {
                                  const field = availableFields.find((f) => f.id === fieldId)
                                  return (
                                    <td key={fieldId} className="px-3 py-3 text-left">
                                      {field?.type === "dropdown" && field.options ? (
                                        <select
                                          value={changeData[empId]?.[fieldId] || ""}
                                          onChange={(e) => handleCellEdit(empId, fieldId, e.target.value)}
                                          className="w-full text-sm border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                        >
                                          <option value="" className="bg-white">
                                            Select {field.name}
                                          </option>
                                          {field.options.map((option) => {
                                            const currentValue = getCurrentValue(empId, field.id)
                                            const isCurrentValue = currentValue === option
                                            return (
                                              <option
                                                key={option}
                                                value={option}
                                                className={
                                                  isCurrentValue ? "bg-blue-50 font-medium text-blue-900" : "bg-white"
                                                }
                                                style={
                                                  isCurrentValue
                                                    ? { backgroundColor: "#eff6ff", color: "#1e3a8a" }
                                                    : { backgroundColor: "white" }
                                                }
                                                title={field.descriptions?.[option] || ""}
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
                                          className="w-full text-sm bg-white border-gray-200"
                                        />
                                      )}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                            {selectedEmployees.length > 5 && (
                              <tr>
                                <td
                                  colSpan={2 + enabledEditorColumns.length + selectedFields.length}
                                  className="px-3 py-4 text-center text-sm text-gray-500"
                                >
                                  +{selectedEmployees.length - 5} more employees
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
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
                        <Button
                          onClick={clearNaturalLanguageChanges}
                          variant="outline"
                          className="px-6 rounded-xl h-12"
                        >
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
                          <div className="mt-2 text-sm font-medium text-amber-700">
                            ⚠️ These changes require approval
                          </div>
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
      </TooltipProvider>

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

      {/* Editor Configuration Modal */}
      {showEditorConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Configure View</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowEditorConfig(false)} className="p-1">
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select which fields to display in the editor table. Employee Name and Employee ID are always shown.
                Fields with check marks are currently displayed.
              </p>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 text-sm">Fields</h4>
                {editorColumns.map((column) => (
                  <div
                    key={column.key}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={column.enabled}
                        onCheckedChange={(checked) => {
                          setEditorColumns((prev) =>
                            prev.map((col) => (col.key === column.key ? { ...col, enabled: checked as boolean } : col)),
                          )
                        }}
                        className="data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400"
                      />
                      <div className="flex items-center space-x-2">
                        {column.enabled && <CheckCircle className="h-4 w-4 text-green-500" />}
                        <div>
                          <div className="font-medium text-gray-900">{column.label}</div>
                          <div className="text-xs text-gray-500">
                            {column.key === "currentIntegration"
                              ? "Current integration (Slack, Zendesk, Github, Gong, Vercel)"
                              : column.key === "performanceRating"
                                ? "Performance rating (1-5 stars)"
                                : column.key === "currentDepartment"
                                  ? "Employee's current department"
                                  : column.key.includes("current")
                                    ? "Current value for reference"
                                    : "Employee information"}
                          </div>
                        </div>
                      </div>
                    </div>
                    {column.key === "currentIntegration" && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                        Integration
                      </Badge>
                    )}
                    {column.key === "performanceRating" && (
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-600 border-yellow-200">
                        Rating
                      </Badge>
                    )}
                    {column.key === "currentDepartment" && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                        Department
                      </Badge>
                    )}
                    {(column.key.includes("Compensation") || column.key.includes("Bonus")) && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                        Sensitive
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {editorColumns.filter((col) => col.enabled).length} fields displayed
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Reset to default
                      setEditorColumns((prev) =>
                        prev.map((col) => ({
                          ...col,
                          enabled: ["currentDepartment", "currentJobTitle", "currentLevel"].includes(col.key),
                        })),
                      )
                    }}
                  >
                    Reset Default
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowEditorConfig(false)}
                    className="bg-amber-400 hover:bg-amber-500 text-gray-900"
                  >
                    Apply Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change History Modal */}
      {showChangeHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[800px] max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Change History</h3>
                  <p className="text-gray-600">View all employee bulk change requests and their status</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowChangeHistory(false)} className="p-1">
                ✕
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {changeHistory.map((change) => (
                  <div key={change.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="font-medium text-gray-900">{change.description}</div>
                          {getStatusBadge(change.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Initiated by:</span> {change.initiatedBy}
                          </div>
                          <div>
                            <span className="font-medium">Employees affected:</span> {change.employeesAffected}
                          </div>
                          <div>
                            <span className="font-medium">Started:</span> {formatDateTime(change.date)}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            {change.status === "completed" && change.completedAt && (
                              <span> Completed {formatDateTime(change.completedAt)}</span>
                            )}
                            {change.status === "pending" && change.pendingSince && (
                              <span> Pending since {formatDateTime(change.pendingSince)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm font-medium text-gray-700">Fields changed:</span>
                          {change.fieldsChanged.map((field) => (
                            <Badge
                              key={field}
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {availableFields.find((f) => f.id === field)?.name || field}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="ml-4 text-xs text-gray-500">ID: {change.id}</div>
                    </div>
                  </div>
                ))}
              </div>

              {changeHistory.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Change History</h4>
                  <p className="text-gray-600">No bulk changes have been made yet.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <Button
                onClick={() => setShowChangeHistory(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
