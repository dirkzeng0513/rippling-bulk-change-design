"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Filter,
  Users,
  Sparkles,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Code,
  Eye,
  Settings,
} from "lucide-react"
import { processNaturalLanguageQuery } from "@/app/actions/natural-language-query"

interface Employee {
  id: string
  name: string
  email: string
  employeeId: string
  department: string
  jobTitle: string
  location: string
  startDate: string
  manager: string
}

interface NLFilters {
  departments?: string[]
  jobTitles?: string[]
  locations?: string[]
  startDateAfter?: string
  startDateBefore?: string
  managers?: string[]
  searchTerms?: string[]
  explanation?: string
}

interface QueryResult {
  success: boolean
  filters?: NLFilters
  usingFallback?: boolean
  fallbackReason?: string
  error?: string
}

type SortField = "name" | "employeeId" | "department" | "startDate" | "jobTitle" | "location"
type SortDirection = "asc" | "desc" | null

// Generate 100 mock employees
const generateMockEmployees = (): Employee[] => {
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
  ]

  return Array.from({ length: 100 }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${firstName} ${lastName}`

    return {
      id: (index + 1).toString(),
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      employeeId: `EMP${String(index + 1).padStart(3, "0")}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      startDate: new Date(
        2020 + Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      )
        .toISOString()
        .split("T")[0],
      manager: managers[Math.floor(Math.random() * managers.length)],
    }
  })
}

const mockEmployees = generateMockEmployees()

interface EmployeeSelectionProps {
  selectedEmployees: string[]
  onSelectionChange: (selected: string[]) => void
  onNext: () => void
}

export function EmployeeSelection({ selectedEmployees, onSelectionChange, onNext }: EmployeeSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [jobTitleFilter, setJobTitleFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [jobLevelFilter, setJobLevelFilter] = useState("")
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("")
  const [nlFilters, setNlFilters] = useState<NLFilters | null>(null)
  const [nlLoading, setNlLoading] = useState(false)
  const [nlError, setNlError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("quick")
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [showQuerySyntax, setShowQuerySyntax] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [tableColumns, setTableColumns] = useState([
    { key: "name", label: "Name", enabled: true, sortable: true },
    { key: "email", label: "Email", enabled: true, sortable: false },
    { key: "employeeId", label: "Employee ID", enabled: true, sortable: true },
    { key: "department", label: "Department", enabled: true, sortable: true },
    { key: "startDate", label: "Start Date", enabled: true, sortable: true },
    { key: "jobTitle", label: "Job Title", enabled: true, sortable: true },
    { key: "location", label: "Location", enabled: true, sortable: true },
    { key: "jobLevel", label: "Job Level", enabled: false, sortable: true },
    { key: "bonusTarget", label: "Bonus Target", enabled: false, sortable: true },
  ])

  const departments = ["EPD", "Product Marketing", "Sales", "Commercial", "Legal", "Customer Success"]
  const jobTitles = ["IC", "Manager", "Sr.Manager", "Director", "Sr.Director", "VP", "Executive"]

  const locations = ["San Francisco", "New York", "Chicago", "Austin", "Remote", "Seattle", "Boston", "Los Angeles"]

  const jobLevels = ["L3", "L4", "L5", "L6", "L7", "M1", "M2", "M3"]
  const itemsPerPage = 5 // 5 employees per page to get 20 pages total
  const totalPages = 20

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortDirection(null)
        setSortField(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
    }

    if (sortDirection === "asc") {
      return <ChevronUp className="h-3 w-3 text-amber-600 cursor-pointer" />
    } else if (sortDirection === "desc") {
      return <ChevronDown className="h-3 w-3 text-amber-600 cursor-pointer" />
    }

    return <ChevronsUpDown className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-600" />
  }

  const sortEmployees = (employees: Employee[]) => {
    if (!sortField || !sortDirection) return employees

    return [...employees].sort((a, b) => {
      let aValue: string | number = a[sortField]
      let bValue: string | number = b[sortField]

      // Special handling for dates
      if (sortField === "startDate") {
        aValue = new Date(a.startDate).getTime()
        bValue = new Date(b.startDate).getTime()
      }

      // Special handling for employee ID (numeric sort)
      if (sortField === "employeeId") {
        aValue = Number.parseInt(a.employeeId.replace("EMP", ""))
        bValue = Number.parseInt(b.employeeId.replace("EMP", ""))
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }

  const applyNaturalLanguageFilters = (employees: Employee[], filters: NLFilters) => {
    return employees.filter((employee) => {
      // Department filter
      if (filters.departments && filters.departments.length > 0) {
        const matchesDept = filters.departments.some((dept) =>
          employee.department.toLowerCase().includes(dept.toLowerCase()),
        )
        if (!matchesDept) return false
      }

      // Job title filter
      if (filters.jobTitles && filters.jobTitles.length > 0) {
        const matchesTitle = filters.jobTitles.some((title) =>
          employee.jobTitle.toLowerCase().includes(title.toLowerCase()),
        )
        if (!matchesTitle) return false
      }

      // Location filter
      if (filters.locations && filters.locations.length > 0) {
        const matchesLocation = filters.locations.some((location) =>
          employee.location.toLowerCase().includes(location.toLowerCase()),
        )
        if (!matchesLocation) return false
      }

      // Start date filters
      if (filters.startDateAfter) {
        if (new Date(employee.startDate) < new Date(filters.startDateAfter)) return false
      }
      if (filters.startDateBefore) {
        if (new Date(employee.startDate) > new Date(filters.startDateBefore)) return false
      }

      // Manager filter
      if (filters.managers && filters.managers.length > 0) {
        const matchesManager = filters.managers.some((manager) =>
          employee.manager.toLowerCase().includes(manager.toLowerCase()),
        )
        if (!matchesManager) return false
      }

      // Search terms (name/email)
      if (filters.searchTerms && filters.searchTerms.length > 0) {
        const matchesSearch = filters.searchTerms.some(
          (term) =>
            employee.name.toLowerCase().includes(term.toLowerCase()) ||
            employee.email.toLowerCase().includes(term.toLowerCase()),
        )
        if (!matchesSearch) return false
      }

      return true
    })
  }

  const filteredEmployees = sortEmployees(
    mockEmployees.filter((employee) => {
      // Apply natural language filters first
      if (nlFilters) {
        const nlFilteredEmployees = applyNaturalLanguageFilters([employee], nlFilters)
        if (nlFilteredEmployees.length === 0) return false
      }

      // Then apply manual filters
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDepartment = !departmentFilter || employee.department === departmentFilter
      const matchesJobTitle = !jobTitleFilter || employee.jobTitle === jobTitleFilter
      const matchesLocation = !locationFilter || employee.location === locationFilter
      // For job level, we'll simulate it by extracting level from job title or using a mock level
      const employeeLevel = employee.jobTitle.includes("Senior")
        ? "L5"
        : employee.jobTitle.includes("Staff")
          ? "L6"
          : employee.jobTitle.includes("Principal")
            ? "L7"
            : employee.jobTitle.includes("Director") || employee.jobTitle.includes("VP")
              ? "M2"
              : employee.jobTitle.includes("Manager")
                ? "M1"
                : "L4"
      const matchesJobLevel = !jobLevelFilter || employeeLevel === jobLevelFilter

      return matchesSearch && matchesDepartment && matchesJobTitle && matchesLocation && matchesJobLevel
    }),
  )

  // Get filtered employees for advanced filtering preview
  const advancedFilteredEmployees = nlFilters ? applyNaturalLanguageFilters(mockEmployees, nlFilters) : []

  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(filteredEmployees.map((emp) => emp.id))
    }
  }

  const handleEmployeeToggle = (employeeId: string) => {
    if (selectedEmployees.includes(employeeId)) {
      onSelectionChange(selectedEmployees.filter((id) => id !== employeeId))
    } else {
      onSelectionChange([...selectedEmployees, employeeId])
    }
  }

  const handleNaturalLanguageQuery = async () => {
    if (!naturalLanguageQuery.trim()) return

    setNlLoading(true)
    setNlError(null)
    setUsingFallback(false)
    setShowQuerySyntax(false)

    try {
      const result: QueryResult = await processNaturalLanguageQuery(naturalLanguageQuery)

      if (result.success && result.filters) {
        setNlFilters(result.filters)
        setUsingFallback(result.usingFallback || false)
        setShowQuerySyntax(true)
        setCurrentPage(1) // Reset to first page
      } else {
        setNlError(result.error || "Failed to process query")
      }
    } catch (error) {
      setNlError("An error occurred while processing your query")
    } finally {
      setNlLoading(false)
    }
  }

  const clearNaturalLanguageFilters = () => {
    setNlFilters(null)
    setNaturalLanguageQuery("")
    setNlError(null)
    setUsingFallback(false)
    setShowQuerySyntax(false)
    setCurrentPage(1)
  }

  const generateQuerySyntax = () => {
    if (!nlFilters) return ""

    const conditions = []

    if (nlFilters.departments && nlFilters.departments.length > 0) {
      conditions.push(`department IN (${nlFilters.departments.map((d) => `"${d}"`).join(", ")})`)
    }

    if (nlFilters.jobTitles && nlFilters.jobTitles.length > 0) {
      conditions.push(`jobTitle CONTAINS (${nlFilters.jobTitles.map((t) => `"${t}"`).join(" OR ")})`)
    }

    if (nlFilters.locations && nlFilters.locations.length > 0) {
      conditions.push(`location IN (${nlFilters.locations.map((l) => `"${l}"`).join(", ")})`)
    }

    if (nlFilters.startDateAfter) {
      conditions.push(`startDate >= "${nlFilters.startDateAfter}"`)
    }

    if (nlFilters.startDateBefore) {
      conditions.push(`startDate <= "${nlFilters.startDateBefore}"`)
    }

    if (nlFilters.managers && nlFilters.managers.length > 0) {
      conditions.push(`manager CONTAINS (${nlFilters.managers.map((m) => `"${m}"`).join(" OR ")})`)
    }

    if (nlFilters.searchTerms && nlFilters.searchTerms.length > 0) {
      conditions.push(`(name OR email) CONTAINS (${nlFilters.searchTerms.map((s) => `"${s}"`).join(" OR ")})`)
    }

    return `SELECT * FROM employees WHERE ${conditions.join(" AND ")}`
  }

  const renderPaginationNumbers = () => {
    const pages = []
    const maxVisiblePages = 7

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show smart pagination
      if (currentPage <= 4) {
        // Show first 5 pages + ... + last page
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Show first page + ... + last 5 pages
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        // Show first + ... + current-1, current, current+1 + ... + last
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setDepartmentFilter("")
    setJobTitleFilter("")
    setLocationFilter("")
    setJobLevelFilter("")
    clearNaturalLanguageFilters()
  }

  const getJobLevel = (jobTitle: string) => {
    const levelMap: Record<string, string> = {
      IC: "L4",
      Manager: "M1",
      "Sr.Manager": "M2",
      Director: "M3",
      "Sr.Director": "M4",
      VP: "M5",
      Executive: "M6",
    }
    return levelMap[jobTitle] || "L4"
  }

  const getBonusTarget = (jobTitle: string) => {
    const bonusMap: Record<string, string> = {
      IC: "10%",
      Manager: "15%",
      "Sr.Manager": "20%",
      Director: "25%",
      "Sr.Director": "30%",
      VP: "40%",
      Executive: "50%",
    }
    return bonusMap[jobTitle] || "10%"
  }

  const getColumnValue = (employee: Employee, columnKey: string) => {
    switch (columnKey) {
      case "jobLevel":
        return getJobLevel(employee.jobTitle)
      case "bonusTarget":
        return getBonusTarget(employee.jobTitle)
      default:
        return employee[columnKey as keyof Employee]
    }
  }

  const enabledColumns = tableColumns.filter((col) => col.enabled)

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900">Select employees to modify</CardTitle>
                <p className="text-gray-600 mt-1">Choose employees using quick filters or advanced search</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge
                variant="secondary"
                className="bg-amber-50 text-amber-700 border-amber-200 px-4 py-2 text-sm font-medium"
              >
                {selectedEmployees.length} selected
              </Badge>
              {sortField && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 text-xs">
                  Sorted by {sortField} ({sortDirection})
                </Badge>
              )}
              {nlFilters && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1 text-xs">
                  {usingFallback ? "Basic Filter" : "AI Filtered"}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfigModal(true)}
                className="px-3 py-2 text-sm border-gray-200 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-gray-50 rounded-none border-b border-gray-100 p-0 h-auto">
              <TabsTrigger
                value="quick"
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-amber-400 rounded-none px-6 py-4 font-medium"
                onClick={clearAllFilters}
              >
                Quick Filter
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-amber-400 rounded-none px-6 py-4 font-medium"
                onClick={clearAllFilters}
              >
                Advanced Filtering
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="p-6 space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by name, employee ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-gray-200 rounded-xl text-base"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex space-x-4">
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="pl-12 pr-8 h-12 border border-gray-200 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent appearance-none min-w-[180px]"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={jobTitleFilter}
                    onChange={(e) => setJobTitleFilter(e.target.value)}
                    className="pl-12 pr-8 h-12 border border-gray-200 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent appearance-none min-w-[200px]"
                  >
                    <option value="">All Job Titles</option>
                    {jobTitles.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="pl-12 pr-8 h-12 border border-gray-200 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent appearance-none min-w-[160px]"
                  >
                    <option value="">All Locations</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={jobLevelFilter}
                    onChange={(e) => setJobLevelFilter(e.target.value)}
                    className="pl-12 pr-8 h-12 border border-gray-200 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent appearance-none min-w-[140px]"
                  >
                    <option value="">All Job Levels</option>
                    {jobLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0
                          ? `All ${filteredEmployees.length} employees selected`
                          : `Select all filtered employees`}
                      </span>
                    </div>
                    {filteredEmployees.length > itemsPerPage && (
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {selectedEmployees.length === filteredEmployees.length
                          ? "All pages selected"
                          : "Selects across all pages"}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length}
                    {searchTerm || departmentFilter || jobTitleFilter || locationFilter || jobLevelFilter || nlFilters
                      ? " filtered"
                      : ""}{" "}
                    employees
                  </div>
                </div>

                {/* Table Header */}
                {/* Table */}
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  {/* Table */}
                  <table className="w-full table-fixed">
                    {/* Header */}
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {enabledColumns.map((column, index) => (
                          <th
                            key={column.key}
                            className={`px-4 py-3 text-left text-sm font-medium text-gray-700 ${
                              column.sortable ? "cursor-pointer hover:text-gray-900 hover:bg-gray-100" : ""
                            } ${index === 0 ? "w-64" : "w-auto"}`}
                            onClick={() => column.sortable && handleSort(column.key as SortField)}
                          >
                            <div className="flex items-center justify-start space-x-1">
                              <span className="text-left">{column.label}</span>
                              {column.sortable && (
                                <div className="flex-shrink-0">{getSortIcon(column.key as SortField)}</div>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* Body */}
                    <tbody className="bg-white divide-y divide-gray-100">
                      {paginatedEmployees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                          {enabledColumns.map((column, index) => (
                            <td key={column.key} className="px-4 py-3 text-left align-top">
                              {index === 0 ? (
                                // First column with checkbox and name
                                <div className="flex items-center justify-start space-x-3">
                                  <Checkbox
                                    checked={selectedEmployees.includes(employee.id)}
                                    onCheckedChange={() => handleEmployeeToggle(employee.id)}
                                    className="data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400 flex-shrink-0"
                                  />
                                  <div className="text-left min-w-0 flex-1">
                                    <div className="font-medium text-gray-900 text-sm truncate text-left">
                                      {getColumnValue(employee, column.key)}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // Other columns
                                <div className="text-left">
                                  {column.key === "email" ? (
                                    <div className="text-xs text-gray-600 truncate text-left">
                                      {getColumnValue(employee, column.key)}
                                    </div>
                                  ) : column.key === "employeeId" ? (
                                    <div className="text-xs font-mono text-gray-900 text-left">
                                      {getColumnValue(employee, column.key)}
                                    </div>
                                  ) : column.key === "startDate" ? (
                                    <div className="text-xs text-gray-600 text-left">
                                      {formatDate(employee.startDate)}
                                    </div>
                                  ) : column.key === "bonusTarget" ? (
                                    <div className="text-sm font-medium text-green-600 text-left">
                                      {getColumnValue(employee, column.key)}
                                    </div>
                                  ) : column.key === "jobLevel" ? (
                                    <div className="text-sm font-medium text-blue-600 text-left">
                                      {getColumnValue(employee, column.key)}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-900 truncate text-left">
                                      {getColumnValue(employee, column.key)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm"
                    >
                      Next
                    </Button>
                  </div>

                  <div className="flex items-center space-x-1">
                    {renderPaginationNumbers().map((page, index) => (
                      <div key={index}>
                        {page === "..." ? (
                          <span className="px-2 py-1 text-sm text-gray-500">...</span>
                        ) : (
                          <button
                            onClick={() => setCurrentPage(page as number)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              currentPage === page ? "bg-amber-400 text-gray-900" : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="p-6 space-y-6">
              <div className="space-y-6">
                {/* Natural Language Query Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Natural Language Query</label>
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                      <Input
                        placeholder="Find all engineers hired before 2022 in SF or Remote"
                        value={naturalLanguageQuery}
                        onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                        className="pl-12 h-12 border-gray-200 rounded-xl text-base"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleNaturalLanguageQuery()
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={handleNaturalLanguageQuery}
                      disabled={nlLoading || !naturalLanguageQuery.trim()}
                      className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-6 rounded-xl h-12"
                    >
                      {nlLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Run Query"
                      )}
                    </Button>
                    {nlFilters && (
                      <Button onClick={clearNaturalLanguageFilters} variant="outline" className="px-6 rounded-xl h-12">
                        Clear Filter
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Use natural language to find employees. Try: "All managers in Sales", "Engineers hired in 2023",
                    "Remote workers in EPD", etc.
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
                {usingFallback && nlFilters && (
                  <Alert className="border-blue-200 bg-blue-50 rounded-xl">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <div className="font-medium mb-1">Using Basic Query Parser</div>
                      <p className="text-sm">
                        OpenAI integration is not available, but we've applied basic filters based on your query.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Query Results */}
                {nlFilters && !usingFallback && (
                  <Alert className="border-green-200 bg-green-50 rounded-xl">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <div className="font-medium mb-2">AI Query Applied</div>
                      <p className="text-sm">{nlFilters.explanation}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {nlFilters.departments?.map((dept) => (
                          <Badge
                            key={dept}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                          >
                            Dept: {dept}
                          </Badge>
                        ))}
                        {nlFilters.jobTitles?.map((title) => (
                          <Badge
                            key={title}
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                          >
                            Role: {title}
                          </Badge>
                        ))}
                        {nlFilters.locations?.map((location) => (
                          <Badge
                            key={location}
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                          >
                            Location: {location}
                          </Badge>
                        ))}
                        {nlFilters.startDateAfter && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                            After: {nlFilters.startDateAfter}
                          </Badge>
                        )}
                        {nlFilters.startDateBefore && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                            Before: {nlFilters.startDateBefore}
                          </Badge>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Translated Query Syntax */}
                {showQuerySyntax && nlFilters && (
                  <Card className="border-gray-200 bg-gray-50 rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <Code className="h-5 w-5 text-gray-600" />
                        <span>Translated Query Syntax</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <code className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                          {generateQuerySyntax()}
                        </code>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Preview Results */}
                {nlFilters && advancedFilteredEmployees.length > 0 && (
                  <Card className="border-gray-200 rounded-xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-5 w-5 text-gray-600" />
                          <span>Preview Results</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {advancedFilteredEmployees.length} employees found
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full table-fixed">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 w-48">Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 w-32">
                                Employee ID
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 w-40">Department</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 w-32">Job Title</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 w-32">Location</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 w-28">Start Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {advancedFilteredEmployees.slice(0, 5).map((employee) => (
                              <tr key={employee.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-left">
                                  <div className="flex items-center justify-start space-x-2">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs font-medium text-gray-700">
                                        {employee.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </span>
                                    </div>
                                    <div className="text-left min-w-0 flex-1">
                                      <span className="font-medium text-gray-900 text-sm truncate text-left block">
                                        {employee.name}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-left">
                                  <div className="text-xs font-mono text-gray-900 text-left">{employee.employeeId}</div>
                                </td>
                                <td className="px-4 py-3 text-left">
                                  <div className="text-sm text-gray-900 text-left truncate">{employee.department}</div>
                                </td>
                                <td className="px-4 py-3 text-left">
                                  <div className="text-sm text-gray-900 text-left truncate">{employee.jobTitle}</div>
                                </td>
                                <td className="px-4 py-3 text-left">
                                  <div className="text-sm text-gray-600 text-left truncate">{employee.location}</div>
                                </td>
                                <td className="px-4 py-3 text-left">
                                  <div className="text-xs text-gray-600 text-left">
                                    {formatDate(employee.startDate)}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {advancedFilteredEmployees.length > 5 && (
                          <div className="px-4 py-3 text-center text-sm text-gray-500 bg-gray-50 border-t border-gray-100">
                            +{advancedFilteredEmployees.length - 5} more employees match your criteria
                          </div>
                        )}
                      </div>
                      {advancedFilteredEmployees.length > 0 && (
                        <div className="mt-4 flex justify-center">
                          <Button
                            onClick={() => {
                              onSelectionChange(advancedFilteredEmployees.map((emp) => emp.id))
                              setActiveTab("quick")
                            }}
                            className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg"
                          >
                            Select All {advancedFilteredEmployees.length} Employees
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* No Results */}
                {nlFilters && advancedFilteredEmployees.length === 0 && (
                  <Card className="border-gray-200 rounded-xl">
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500 mb-2">No employees match your search criteria</div>
                      <p className="text-sm text-gray-400">Try adjusting your query or using different search terms</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="px-6 py-3 rounded-xl text-base h-auto border-gray-200">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
          <span className="text-sm text-gray-500">Export filtered results for offline editing</span>
        </div>
        <Button
          onClick={onNext}
          disabled={selectedEmployees.length === 0}
          className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-xl text-base h-auto"
        >
          Continue with {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? "s" : ""}
        </Button>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Configure Table Columns</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowConfigModal(false)} className="p-1">
                ✕
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Select which columns to display in the employee table. You can show up to 7 columns at once.
              </p>

              {tableColumns.map((column) => (
                <div
                  key={column.key}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={column.enabled}
                      onCheckedChange={(checked) => {
                        const enabledCount = tableColumns.filter((col) => col.enabled).length
                        if (checked && enabledCount >= 7) {
                          return // Don't allow more than 7 columns
                        }
                        if (!checked && enabledCount <= 3) {
                          return // Don't allow less than 3 columns
                        }
                        setTableColumns((prev) =>
                          prev.map((col) => (col.key === column.key ? { ...col, enabled: checked as boolean } : col)),
                        )
                      }}
                      className="data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{column.label}</div>
                      {(column.key === "jobLevel" || column.key === "bonusTarget") && (
                        <div className="text-xs text-gray-500">
                          {column.key === "jobLevel" ? "Calculated from job title" : "Target bonus percentage"}
                        </div>
                      )}
                    </div>
                  </div>
                  {column.sortable && (
                    <Badge variant="outline" className="text-xs">
                      Sortable
                    </Badge>
                  )}
                </div>
              ))}

              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {tableColumns.filter((col) => col.enabled).length} of 7 columns selected
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Reset to default
                      setTableColumns((prev) =>
                        prev.map((col) => ({
                          ...col,
                          enabled: [
                            "name",
                            "email",
                            "employeeId",
                            "department",
                            "startDate",
                            "jobTitle",
                            "location",
                          ].includes(col.key),
                        })),
                      )
                    }}
                  >
                    Reset Default
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowConfigModal(false)}
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
    </div>
  )
}
