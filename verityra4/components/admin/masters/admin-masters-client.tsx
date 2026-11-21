"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { toast } from "@/components/ui/sonner"
import {
  Layers,
  Search,
  Plus,
  Pencil,
  Trash2,
  BookOpenCheck,
  GraduationCap,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { MasterItem } from "@/lib/mock-masters"
import {
  deleteSubjectAction,
  deleteStandardAction,
  deleteBoardAction,
} from "@/actions/master-actions"
import { SubjectDialog } from "./subject-dialog"
import { StandardDialog } from "./standard-dialog"
import { BoardDialog } from "./board-dialog"

export type MasterTab = "subjects" | "standards" | "boards"

interface AdminMastersClientProps {
  initialTab?: MasterTab
  initialSubjects: MasterItem[]
  initialStandards: MasterItem[]
  initialBoards: MasterItem[]
}

export function AdminMastersClient({
  initialTab = "subjects",
  initialSubjects,
  initialStandards,
  initialBoards,
}: AdminMastersClientProps) {
  const router = useRouter()
  const confirm = useConfirm()

  const [activeTab, setActiveTab] = React.useState<MasterTab>(initialTab)
  const [searchQuery, setSearchQuery] = React.useState("")

  const [subjects, setSubjects] = React.useState<MasterItem[]>(initialSubjects)
  const [standards, setStandards] = React.useState<MasterItem[]>(initialStandards)
  const [boards, setBoards] = React.useState<MasterItem[]>(initialBoards)

  // Dialog States
  const [subjectDialogOpen, setSubjectDialogOpen] = React.useState(false)
  const [editingSubject, setEditingSubject] = React.useState<MasterItem | null>(null)

  const [standardDialogOpen, setStandardDialogOpen] = React.useState(false)
  const [editingStandard, setEditingStandard] = React.useState<MasterItem | null>(null)

  const [boardDialogOpen, setBoardDialogOpen] = React.useState(false)
  const [editingBoard, setEditingBoard] = React.useState<MasterItem | null>(null)

  // Filtering
  const q = searchQuery.trim().toLowerCase()

  const filteredSubjects = React.useMemo(() => {
    if (!q) return subjects
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
    )
  }, [subjects, q])

  const filteredStandards = React.useMemo(() => {
    if (!q) return standards
    return standards.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q))
    )
  }, [standards, q])

  const filteredBoards = React.useMemo(() => {
    if (!q) return boards
    return boards.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.code && b.code.toLowerCase().includes(q))
    )
  }, [boards, q])

  // Delete Handlers
  const handleDeleteSubject = async (item: MasterItem) => {
    const ok = await confirm({
      title: `Delete Subject "${item.name}"?`,
      description: "Existing tests with this subject will remain intact, but it will be removed from future selection.",
      confirmText: "Delete Subject",
      cancelText: "Cancel",
      variant: "destructive",
      badgeText: "Subject Master",
    })
    if (!ok) return

    const res = await deleteSubjectAction(item.id)
    if (res.success) {
      toast.success(res.message || "Subject deleted.")
      setSubjects((prev) => prev.filter((s) => s.id !== item.id))
      router.refresh()
    } else {
      toast.error(res.error || "Failed to delete subject.")
    }
  }

  const handleDeleteStandard = async (item: MasterItem) => {
    const ok = await confirm({
      title: `Delete Standard "${item.name}"?`,
      description: "Existing test series will remain intact, but it will be removed from future selection.",
      confirmText: "Delete Standard",
      cancelText: "Cancel",
      variant: "destructive",
      badgeText: "Standard Master",
    })
    if (!ok) return

    const res = await deleteStandardAction(item.id)
    if (res.success) {
      toast.success(res.message || "Standard deleted.")
      setStandards((prev) => prev.filter((s) => s.id !== item.id))
      router.refresh()
    } else {
      toast.error(res.error || "Failed to delete standard.")
    }
  }

  const handleDeleteBoard = async (item: MasterItem) => {
    const ok = await confirm({
      title: `Delete Board "${item.name}"?`,
      description: "Existing test series will remain intact, but it will be removed from future selection.",
      confirmText: "Delete Board",
      cancelText: "Cancel",
      variant: "destructive",
      badgeText: "Board Master",
    })
    if (!ok) return

    const res = await deleteBoardAction(item.id)
    if (res.success) {
      toast.success(res.message || "Board deleted.")
      setBoards((prev) => prev.filter((b) => b.id !== item.id))
      router.refresh()
    } else {
      toast.error(res.error || "Failed to delete board.")
    }
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={Layers}
        title="Academic Masters"
        subtitle="Manage master records for subjects, standards/classes, and examination boards used across test series."
        showRefresh
      >
        <div className="flex items-center gap-2">
          {activeTab === "subjects" && (
            <Button
              onClick={() => {
                setEditingSubject(null)
                setSubjectDialogOpen(true)
              }}
              size="sm"
              className="h-10 rounded-md bg-[#145DEB] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#0F4DC7]"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add Subject
            </Button>
          )}
          {activeTab === "standards" && (
            <Button
              onClick={() => {
                setEditingStandard(null)
                setStandardDialogOpen(true)
              }}
              size="sm"
              className="h-10 rounded-md bg-[#145DEB] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#0F4DC7]"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add Standard
            </Button>
          )}
          {activeTab === "boards" && (
            <Button
              onClick={() => {
                setEditingBoard(null)
                setBoardDialogOpen(true)
              }}
              size="sm"
              className="h-10 rounded-md bg-[#145DEB] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#0F4DC7]"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add Board
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Tabs Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-md border border-border/80">
          <button
            type="button"
            onClick={() => setActiveTab("subjects")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "subjects"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpenCheck className="h-3.5 w-3.5 text-primary" />
            <span>Subjects</span>
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
              {subjects.length}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("standards")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "standards"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span>Standards / Classes</span>
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
              {standards.length}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("boards")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "boards"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span>Boards / Streams</span>
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
              {boards.length}
            </Badge>
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="h-9 pl-8 text-xs bg-card"
          />
        </div>
      </div>

      {/* High-density Enterprise Table */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-4 py-3.5">Code</th>
                {activeTab === "standards" && <th className="px-4 py-3.5">Sort Order</th>}
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {/* SUBJECTS TAB */}
              {activeTab === "subjects" &&
                (filteredSubjects.length > 0 ? (
                  filteredSubjects.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <BookOpenCheck className="h-4 w-4 text-primary shrink-0" />
                          <span>{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {s.code ? (
                          <Badge variant="outline" className="font-mono text-[10px] font-semibold">
                            {s.code}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground max-w-sm truncate">
                        {s.description || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        {s.isActive ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] gap-1">
                            <XCircle className="h-3 w-3" /> Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingSubject(s)
                              setSubjectDialogOpen(true)
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit Subject"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSubject(s)}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10"
                            title="Delete Subject"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No subjects found.
                    </td>
                  </tr>
                ))}

              {/* STANDARDS TAB */}
              {activeTab === "standards" &&
                (filteredStandards.length > 0 ? (
                  filteredStandards.map((std) => (
                    <tr key={std.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                          <span>{std.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {std.code ? (
                          <Badge variant="outline" className="font-mono text-[10px] font-semibold">
                            {std.code}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-muted-foreground">
                        {std.order ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground max-w-sm truncate">
                        {std.description || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        {std.isActive ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] gap-1">
                            <XCircle className="h-3 w-3" /> Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingStandard(std)
                              setStandardDialogOpen(true)
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit Standard"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteStandard(std)}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10"
                            title="Delete Standard"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No standards found.
                    </td>
                  </tr>
                ))}

              {/* BOARDS TAB */}
              {activeTab === "boards" &&
                (filteredBoards.length > 0 ? (
                  filteredBoards.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary shrink-0" />
                          <span>{b.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {b.code ? (
                          <Badge variant="outline" className="font-mono text-[10px] font-semibold">
                            {b.code}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground max-w-sm truncate">
                        {b.description || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        {b.isActive ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] gap-1">
                            <XCircle className="h-3 w-3" /> Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingBoard(b)
                              setBoardDialogOpen(true)
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit Board"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteBoard(b)}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10"
                            title="Delete Board"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No boards found.
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Modals */}
      <SubjectDialog
        open={subjectDialogOpen}
        onOpenChange={setSubjectDialogOpen}
        subject={editingSubject}
        onSuccess={(saved) => {
          setSubjects((prev) => {
            const exists = prev.some((s) => s.id === saved.id)
            return exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [saved, ...prev]
          })
          router.refresh()
        }}
      />

      <StandardDialog
        open={standardDialogOpen}
        onOpenChange={setStandardDialogOpen}
        standard={editingStandard}
        onSuccess={(saved) => {
          setStandards((prev) => {
            const exists = prev.some((s) => s.id === saved.id)
            return exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [saved, ...prev]
          })
          router.refresh()
        }}
      />

      <BoardDialog
        open={boardDialogOpen}
        onOpenChange={setBoardDialogOpen}
        board={editingBoard}
        onSuccess={(saved) => {
          setBoards((prev) => {
            const exists = prev.some((b) => b.id === saved.id)
            return exists ? prev.map((b) => (b.id === saved.id ? saved : b)) : [saved, ...prev]
          })
          router.refresh()
        }}
      />
    </div>
  )
}
