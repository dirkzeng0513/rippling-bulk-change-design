"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, Users } from "lucide-react"

interface Employee {
  id: string
  name: string
  email: string
  department: string
  role: string
  location: string
  manager: string
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    department: "Engineering",
    role: "Senior Software Engineer",
    location: "San Francisco",
    manager: "David Kim",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.johnson@company.com",
    department: "Engineering",
    role: "Software Engineer",
    location: "San Francisco",
    manager: "David Kim",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    department: "Marketing",
    role: "Marketing Manager",
    location: "New York",
    manager: "Lisa Park",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.wilson@company.com",
    department: "Sales",
    role: "Account Executive",
    location: "Chicago",
    manager: "Robert Lee",
  },
  {
    id: "5",
    name: "Anna Thompson",
    email: "anna.thompson@company.com",
    department: "Engineering",
    role: "Frontend Engineer",
    location: "Remote",
    manager: "David Kim",
  },
  {
    id: "6",
    name: "Michael Brown",
    email: "michael.brown@company.com",
    department: "Operations",
    role: "Operations Manager",
    location: "Austin",
    manager: "Jennifer Davis",
  },
]

interface EmployeeSelectionProps {
  selectedEmployees: string[]
  onSelectionChange: (selected: string[]) => void
  onNext: () => void
}

export function EmployeeSelection({ selectedEmployees, onSelectionChange, onNext }: EmployeeSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")

  const filteredEmployees = mockEmployees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const departments = Array.from(new Set(mockEmployees.map((emp) => emp.department)))

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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">Select Employees</h2>
          </div>
          <Badge variant="secondary">{selectedEmployees.length} selected</Badge>
        </div>

        <div className="mt-4 flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <Checkbox
            checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Select all ({filteredEmployees.length})</span>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center">
              <Checkbox
                checked={selectedEmployees.includes(employee.id)}
                onCheckedChange={() => handleEmployeeToggle(employee.id)}
              />
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{employee.role}</p>
                    <p className="text-sm text-gray-500">
                      {employee.department} • {employee.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-end">
          <Button onClick={onNext} disabled={selectedEmployees.length === 0} className="bg-blue-600 hover:bg-blue-700">
            Continue with {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </div>
  )
}
