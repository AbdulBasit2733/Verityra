import Link from "next/link"
import { requireAdmin } from "@/lib/auth-guard"
import { Navbar } from "@/components/navbar"
import {
  LayoutDashboard,
  FileCheck2,
  BookOpen,
  Users,
  ShieldCheck,
  Settings,
} from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enforce server-side role check
  await requireAdmin("/admin")

  return (
    <div className="flex min-h-screen flex-col bg-[#F2F7FA]">
      <Navbar />

      <div className="border-b border-[#D5E5F2] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-1 sm:gap-6 text-xs font-semibold overflow-x-auto">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#0784B5] hover:bg-[#CADEEF]/30"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/admin/test-series"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#4B6375] hover:text-[#0784B5] hover:bg-[#CADEEF]/30"
              >
                <BookOpen className="h-4 w-4" />
                Test Series
              </Link>
              <Link
                href="/admin/submissions"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#4B6375] hover:text-[#0784B5] hover:bg-[#CADEEF]/30"
              >
                <FileCheck2 className="h-4 w-4" />
                Submissions & Reviews
              </Link>
              <Link
                href="/admin/students"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#4B6375] hover:text-[#0784B5] hover:bg-[#CADEEF]/30"
              >
                <Users className="h-4 w-4" />
                Candidates & Overrides
              </Link>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#0784B5] font-semibold bg-[#CADEEF]/40 px-3 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Portal
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
