'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import Image from 'next/image'
import { Plus, Calendar, Trash2, FileText } from 'lucide-react'
import { ProjectData } from '@/lib/types'

export default function Home() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.map((p: any) => ({
          ...p,
          channels: JSON.parse(p.channels),
          tasks: p.tasks.map((t: any) => ({
            ...t,
            enabled: t.enabled == null ? true : Boolean(t.enabled),
          })),
        })))
        setLoading(false)
      })
  }, [])

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#235472]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="bg-white rounded-lg px-3 py-1.5">
            <Image src="/logo.png" alt="TAP" width={120} height={38} className="h-9 w-auto object-contain" />
          </div>
          <Link
            href="/projects/new"
            className="flex items-center gap-2 bg-[#AD7027] hover:bg-[#8F5B1E] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            New Project
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No projects yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first city onboarding plan</p>
            <Link
              href="/projects/new"
              className="mt-4 inline-flex items-center gap-2 bg-[#AD7027] hover:bg-[#8F5B1E] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} /> New Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => {
              const total = p.tasks.length
              const done = p.tasks.filter((t) => t.status === 'complete').length
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              return (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="font-semibold text-gray-900">{p.cityName}</h2>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <Calendar size={13} />
                          <span>Launch: {format(new Date(p.launchDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProject(p.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{done} / {total} tasks complete</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#AD7027] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/projects/${p.id}`}
                        className="flex-1 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Open Tracker
                      </Link>
                      <Link
                        href={`/projects/${p.id}/schedule`}
                        className="flex-1 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Customer View
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
