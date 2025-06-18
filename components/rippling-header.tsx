import { Button } from "@/components/ui/button"
import Image from "next/image"

export function RipplingHeader() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Image src="/rippling-logo.png" alt="Rippling" width={120} height={32} className="h-8 w-auto" priority />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-5 h-3 bg-blue-600 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs">🇺🇸</span>
              </span>
              <span>EN</span>
            </div>
            <Button className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-6 rounded-lg">
              Back to Rippling
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
