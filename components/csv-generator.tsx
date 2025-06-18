"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileSpreadsheet } from "lucide-react"

export function CSVGenerator() {
  const generateCSV = () => {
    // Sample employee data that matches our interface
    const employees = [
      {
        name: "Emily Garcia",
        email: "emily.garcia@company.com",
        employeeId: "EMP001",
        department: "EPD",
        startDate: "2021-09-12",
        jobTitle: "Senior Software Engineer",
        location: "San Francisco",
        manager: "David Kim",
        baseCompensation: "$145,000",
        bonusTarget: "15%",
        level: "L5",
        employeeType: "Full-time",
      },
      {
        name: "Riley Brown",
        email: "riley.brown@company.com",
        employeeId: "EMP002",
        department: "Product Marketing",
        startDate: "2022-03-05",
        jobTitle: "Marketing Manager",
        location: "New York",
        manager: "Lisa Park",
        baseCompensation: "$125,000",
        bonusTarget: "12%",
        level: "L4",
        employeeType: "Full-time",
      },
      {
        name: "Jordan Wilson",
        email: "jordan.wilson@company.com",
        employeeId: "EMP003",
        department: "Sales",
        startDate: "2020-11-23",
        jobTitle: "Account Executive",
        location: "Chicago",
        manager: "Robert Lee",
        baseCompensation: "$95,000",
        bonusTarget: "25%",
        level: "L3",
        employeeType: "Full-time",
      },
      {
        name: "Avery Thompson",
        email: "avery.thompson@company.com",
        employeeId: "EMP004",
        department: "EPD",
        startDate: "2023-01-15",
        jobTitle: "Software Engineer",
        location: "Remote",
        manager: "David Kim",
        baseCompensation: "$120,000",
        bonusTarget: "10%",
        level: "L3",
        employeeType: "Full-time",
      },
      {
        name: "Quinn Davis",
        email: "quinn.davis@company.com",
        employeeId: "EMP005",
        department: "Commercial",
        startDate: "2021-06-08",
        jobTitle: "Senior Account Executive",
        location: "Austin",
        manager: "Jennifer Davis",
        baseCompensation: "$110,000",
        bonusTarget: "20%",
        level: "L4",
        employeeType: "Full-time",
      },
      {
        name: "Morgan Miller",
        email: "morgan.miller@company.com",
        employeeId: "EMP006",
        department: "EPD",
        startDate: "2020-04-17",
        jobTitle: "Principal Engineer",
        location: "Seattle",
        manager: "David Kim",
        baseCompensation: "$185,000",
        bonusTarget: "18%",
        level: "L7",
        employeeType: "Full-time",
      },
      {
        name: "Casey Martinez",
        email: "casey.martinez@company.com",
        employeeId: "EMP007",
        department: "Legal",
        startDate: "2022-08-12",
        jobTitle: "Legal Counsel",
        location: "Boston",
        manager: "Michael Chen",
        baseCompensation: "$155,000",
        bonusTarget: "8%",
        level: "L5",
        employeeType: "Full-time",
      },
      {
        name: "Taylor Anderson",
        email: "taylor.anderson@company.com",
        employeeId: "EMP008",
        department: "Customer Success",
        startDate: "2021-12-03",
        jobTitle: "Customer Success Manager",
        location: "Los Angeles",
        manager: "Sarah Johnson",
        baseCompensation: "$105,000",
        bonusTarget: "12%",
        level: "L4",
        employeeType: "Full-time",
      },
      {
        name: "Chris Taylor",
        email: "chris.taylor@company.com",
        employeeId: "EMP009",
        department: "Product Marketing",
        startDate: "2020-07-21",
        jobTitle: "Senior Marketing Manager",
        location: "San Francisco",
        manager: "Lisa Park",
        baseCompensation: "$135,000",
        bonusTarget: "15%",
        level: "L5",
        employeeType: "Full-time",
      },
      {
        name: "Alex Thomas",
        email: "alex.thomas@company.com",
        employeeId: "EMP010",
        department: "EPD",
        startDate: "2023-02-28",
        jobTitle: "Staff Software Engineer",
        location: "Remote",
        manager: "David Kim",
        baseCompensation: "$165,000",
        bonusTarget: "16%",
        level: "L6",
        employeeType: "Full-time",
      },
    ]

    // Convert to CSV format
    const headers = [
      "Name",
      "Email",
      "Employee ID",
      "Department",
      "Start Date",
      "Job Title",
      "Location",
      "Manager",
      "Base Compensation",
      "Bonus Target",
      "Level",
      "Employee Type",
    ]

    const csvContent = [
      headers.join(","),
      ...employees.map((emp) =>
        [
          `"${emp.name}"`,
          emp.email,
          emp.employeeId,
          `"${emp.department}"`,
          emp.startDate,
          `"${emp.jobTitle}"`,
          `"${emp.location}"`,
          `"${emp.manager}"`,
          `"${emp.baseCompensation}"`,
          `"${emp.bonusTarget}"`,
          emp.level,
          `"${emp.employeeType}"`,
        ].join(","),
      ),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "employee_sample_data.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="border-gray-100 rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5 text-amber-600" />
          <span>Sample CSV Data</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            Download a sample CSV file with employee data that matches the bulk update interface. This file includes all
            the fields you can modify through the system.
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Included Fields:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>• Name</div>
              <div>• Base Compensation</div>
              <div>• Email</div>
              <div>• Bonus Target</div>
              <div>• Employee ID</div>
              <div>• Level</div>
              <div>• Department</div>
              <div>• Employee Type</div>
              <div>• Start Date</div>
              <div>• Manager</div>
              <div>• Job Title</div>
              <div>• Location</div>
            </div>
          </div>

          <Button
            onClick={generateCSV}
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-xl"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Sample CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
