"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LegalHeader() {
  return (
    <div className="mb-8">
      <Link
        href="/"
        className="
          inline-flex items-center gap-2
          rounded-lg border border-gray-300
          px-4 py-2
          text-sm font-medium
          text-gray-700 bg-white
          shadow-sm
          hover:bg-gray-100 hover:border-gray-400
          active:scale-95
          transition-all
        "
      >
        <ArrowLeft size={18} />
        Home
      </Link>
    </div>
  )
}
