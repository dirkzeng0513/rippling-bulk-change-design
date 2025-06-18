"use server"

import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const FilterSchema = z.object({
  departments: z.array(z.string()).optional().describe("Department names to filter by"),
  jobTitles: z.array(z.string()).optional().describe("Job titles or roles to filter by"),
  locations: z.array(z.string()).optional().describe("Office locations to filter by"),
  startDateAfter: z.string().optional().describe("Start date after this date (YYYY-MM-DD format)"),
  startDateBefore: z.string().optional().describe("Start date before this date (YYYY-MM-DD format)"),
  managers: z.array(z.string()).optional().describe("Manager names to filter by"),
  searchTerms: z.array(z.string()).optional().describe("General search terms for names or emails"),
  explanation: z.string().describe("Brief explanation of what filters were applied"),
})

// Fallback function for when OpenAI is not available
function parseQueryWithFallback(query: string) {
  const lowerQuery = query.toLowerCase()
  const filters: any = {}

  // Department matching
  const departments = ["epd", "product marketing", "sales", "commercial", "legal", "customer success"]
  const foundDepartments = departments.filter(
    (dept) =>
      lowerQuery.includes(dept) ||
      (dept === "epd" && (lowerQuery.includes("engineering") || lowerQuery.includes("engineer"))) ||
      (dept === "product marketing" && lowerQuery.includes("marketing")) ||
      (dept === "customer success" && lowerQuery.includes("success")),
  )
  if (foundDepartments.length > 0) {
    filters.departments = foundDepartments.map((dept) => {
      if (dept === "epd") return "EPD"
      return dept
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    })
  }

  // Job title matching
  const jobTitles = []
  if (lowerQuery.includes("engineer") || lowerQuery.includes("developer")) {
    jobTitles.push("Engineer")
  }
  if (lowerQuery.includes("manager")) {
    jobTitles.push("Manager")
  }
  if (lowerQuery.includes("director")) {
    jobTitles.push("Director")
  }
  if (lowerQuery.includes("senior")) {
    jobTitles.push("Senior")
  }
  if (lowerQuery.includes("principal")) {
    jobTitles.push("Principal")
  }
  if (jobTitles.length > 0) {
    filters.jobTitles = jobTitles
  }

  // Location matching
  const locations = []
  if (lowerQuery.includes("san francisco") || lowerQuery.includes("sf")) {
    locations.push("San Francisco")
  }
  if (lowerQuery.includes("new york") || lowerQuery.includes("ny") || lowerQuery.includes("nyc")) {
    locations.push("New York")
  }
  if (lowerQuery.includes("remote")) {
    locations.push("Remote")
  }
  if (lowerQuery.includes("chicago")) {
    locations.push("Chicago")
  }
  if (lowerQuery.includes("austin")) {
    locations.push("Austin")
  }
  if (locations.length > 0) {
    filters.locations = locations
  }

  // Date matching
  const currentYear = new Date().getFullYear()
  const yearMatch = lowerQuery.match(/\b(20\d{2})\b/)
  if (yearMatch) {
    const year = Number.parseInt(yearMatch[1])
    if (lowerQuery.includes("before") || lowerQuery.includes("prior to")) {
      filters.startDateBefore = `${year}-01-01`
    } else if (lowerQuery.includes("after") || lowerQuery.includes("since")) {
      filters.startDateAfter = `${year}-12-31`
    } else if (lowerQuery.includes("in") || lowerQuery.includes("during")) {
      filters.startDateAfter = `${year}-01-01`
      filters.startDateBefore = `${year}-12-31`
    }
  }

  // Generate explanation
  const explanation = "Applied filters based on your query: "
  const explanationParts = []
  if (filters.departments) explanationParts.push(`departments (${filters.departments.join(", ")})`)
  if (filters.jobTitles) explanationParts.push(`job titles containing (${filters.jobTitles.join(", ")})`)
  if (filters.locations) explanationParts.push(`locations (${filters.locations.join(", ")})`)
  if (filters.startDateAfter || filters.startDateBefore) {
    if (filters.startDateAfter && filters.startDateBefore) {
      explanationParts.push(`hired in ${yearMatch?.[1] || "specified year"}`)
    } else if (filters.startDateAfter) {
      explanationParts.push(`hired after ${filters.startDateAfter}`)
    } else if (filters.startDateBefore) {
      explanationParts.push(`hired before ${filters.startDateBefore}`)
    }
  }

  filters.explanation =
    explanation + (explanationParts.length > 0 ? explanationParts.join(", ") : "general search terms")

  return filters
}

export async function processNaturalLanguageQuery(query: string) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not found, using fallback parser")
      const fallbackFilters = parseQueryWithFallback(query)
      return {
        success: true,
        filters: fallbackFilters,
        usingFallback: true,
      }
    }

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      system: `You are an HR system assistant that converts natural language queries into structured employee filters.

Available departments: EPD, Product Marketing, Sales, Commercial, Legal, Customer Success
Available locations: San Francisco, New York, Chicago, Austin, Remote, Seattle, Boston, Los Angeles
Common job titles: Software Engineer, Senior Software Engineer, Staff Software Engineer, Principal Engineer, Product Manager, Senior Product Manager, Director of Product, Marketing Manager, Senior Marketing Manager, Marketing Director, Account Executive, Senior Account Executive, Sales Director, Legal Counsel, Senior Legal Counsel, General Counsel, Customer Success Manager, Senior Customer Success Manager, VP Customer Success

Convert the user's natural language query into appropriate filters. Be flexible with matching - if they say "engineers" match any engineering titles, if they say "SF" match "San Francisco", etc.

For dates, assume current year is 2024. If they say "hired in 2023" use startDateAfter: "2023-01-01" and startDateBefore: "2023-12-31".`,
      prompt: `Convert this employee search query into filters: "${query}"`,
      schema: FilterSchema,
    })

    return {
      success: true,
      filters: object,
      usingFallback: false,
    }
  } catch (error) {
    console.error("Error processing natural language query:", error)

    // If OpenAI fails, fall back to basic parsing
    console.log("Falling back to basic query parsing")
    const fallbackFilters = parseQueryWithFallback(query)
    return {
      success: true,
      filters: fallbackFilters,
      usingFallback: true,
      fallbackReason: "OpenAI service unavailable",
    }
  }
}
