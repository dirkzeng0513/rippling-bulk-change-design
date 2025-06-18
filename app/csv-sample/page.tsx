import { CSVGenerator } from "@/components/csv-generator"
import { RipplingHeader } from "@/components/rippling-header"

export default function CSVSamplePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <RipplingHeader />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sample CSV Data</h1>
          <p className="text-gray-600 mt-2">Download sample employee data for testing the bulk update functionality</p>
        </div>

        <CSVGenerator />
      </div>
    </div>
  )
}
