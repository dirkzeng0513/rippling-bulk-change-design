"use server"

import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const ChangeConfigurationSchema = z.object({
  changes: z
    .array(
      z.object({
        field: z.string().describe("The field to be changed (e.g., jobTitle, level, baseCompensation)"),
        value: z.string().describe("The new value for the field"),
        condition: z.string().optional().describe("Optional condition for when to apply this change"),
      }),
    )
    .describe("Array of changes to be applied"),
  sqlQuery: z.string().describe("SQL UPDATE query to apply these changes"),
  explanation: z.string().describe("Human-readable explanation of what changes will be applied"),
  affectedEmployees: z.number().describe("Estimated number of employees that will be affected"),
  requiresApproval: z.boolean().describe("Whether these changes require approval"),
})

// Fallback function for when OpenAI is not available
function parseChangesWithFallback(query: string) {
  const lowerQuery = query.toLowerCase()
  const changes = []
  let sqlQuery = "UPDATE employees SET "
  const sqlParts = []
  let requiresApproval = false

  // Parse common change patterns
  if (lowerQuery.includes("promote") || lowerQuery.includes("promotion")) {
    if (lowerQuery.includes("senior")) {
      changes.push({ field: "jobTitle", value: "Senior Software Engineer" })
      changes.push({ field: "level", value: "L5" })
      sqlParts.push("job_title = 'Senior Software Engineer'", "level = 'L5'")
    }
    if (lowerQuery.includes("manager")) {
      changes.push({ field: "jobTitle", value: "Manager" })
      changes.push({ field: "level", value: "M1" })
      sqlParts.push("job_title = 'Manager'", "level = 'M1'")
    }
  }

  // Parse salary/compensation changes
  if (lowerQuery.includes("salary") || lowerQuery.includes("compensation") || lowerQuery.includes("raise")) {
    requiresApproval = true
    if (lowerQuery.includes("band 2")) {
      changes.push({ field: "baseCompensation", value: "Band 2" })
      sqlParts.push("base_compensation = 'Band 2'")
    } else if (lowerQuery.includes("band 3")) {
      changes.push({ field: "baseCompensation", value: "Band 3" })
      sqlParts.push("base_compensation = 'Band 3'")
    }
  }

  // Parse bonus changes
  if (lowerQuery.includes("bonus")) {
    requiresApproval = true
    if (lowerQuery.includes("20%")) {
      changes.push({ field: "bonusTarget", value: "20%" })
      sqlParts.push("bonus_target = '20%'")
    } else if (lowerQuery.includes("25%")) {
      changes.push({ field: "bonusTarget", value: "25%" })
      sqlParts.push("bonus_target = '25%'")
    }
  }

  // Parse department changes
  if (lowerQuery.includes("move to") || lowerQuery.includes("transfer")) {
    if (lowerQuery.includes("epd") || lowerQuery.includes("engineering")) {
      changes.push({ field: "department", value: "EPD" })
      sqlParts.push("department = 'EPD'")
    } else if (lowerQuery.includes("marketing")) {
      changes.push({ field: "department", value: "Product Marketing" })
      sqlParts.push("department = 'Product Marketing'")
    }
  }

  // Parse location changes
  if (lowerQuery.includes("remote") || lowerQuery.includes("work from home")) {
    changes.push({ field: "jobLocation", value: "Remote" })
    sqlParts.push("job_location = 'Remote'")
  }

  if (sqlParts.length > 0) {
    sqlQuery += sqlParts.join(", ") + " WHERE employee_id IN (SELECT employee_id FROM selected_employees)"
  } else {
    sqlQuery = "-- No changes detected from query"
  }

  const explanation =
    changes.length > 0
      ? `Applied changes: ${changes.map((c) => `${c.field} → ${c.value}`).join(", ")}`
      : "No specific changes could be parsed from your request"

  return {
    changes,
    sqlQuery,
    explanation,
    affectedEmployees: Math.floor(Math.random() * 20) + 5, // Mock number
    requiresApproval,
  }
}

export async function processNaturalLanguageChanges(query: string, selectedEmployeeCount: number) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not found, using fallback parser")
      const fallbackChanges = parseChangesWithFallback(query)
      return {
        success: true,
        configuration: fallbackChanges,
        usingFallback: true,
      }
    }

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      system: `You are an HR system assistant that converts natural language change requests into structured employee updates.

Available fields to modify:
- jobTitle: Job titles like "Software Engineer", "Senior Software Engineer", "Manager", "Director"
- level: Levels like "L3", "L4", "L5", "L6", "L7", "M1", "M2", "M3"
- department: Departments like "EPD", "Product Marketing", "Sales", "Commercial", "Legal", "Customer Success"
- baseCompensation: Compensation bands like "Band 1", "Band 2", "Band 3"
- bonusTarget: Bonus percentages like "15%", "20%", "25%", "30%"
- jobLocation: Locations like "San Francisco", "New York", "Remote", "Chicago"
- employeeType: Types like "FTE", "Contractor"
- manager: Manager names

Sensitive fields that require approval: baseCompensation, bonusTarget, level (when promoting to management)

Generate SQL UPDATE statements that would apply to the selected employees. Use proper SQL syntax with employee_id IN (SELECT employee_id FROM selected_employees) as the WHERE clause.

Current context: ${selectedEmployeeCount} employees are selected for bulk changes.`,
      prompt: `Convert this bulk change request into structured updates: "${query}"`,
      schema: ChangeConfigurationSchema,
    })

    return {
      success: true,
      configuration: object,
      usingFallback: false,
    }
  } catch (error) {
    console.error("Error processing natural language changes:", error)

    // If OpenAI fails, fall back to basic parsing
    console.log("Falling back to basic change parsing")
    const fallbackChanges = parseChangesWithFallback(query)
    return {
      success: true,
      configuration: fallbackChanges,
      usingFallback: true,
      fallbackReason: "OpenAI service unavailable",
    }
  }
}
