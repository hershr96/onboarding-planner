'use client'

import { useEffect, useState, use, useRef } from 'react'
import Link from 'next/link'
import { format, addMonths } from 'date-fns'
import Image from 'next/image'
import { ArrowLeft, Eye, EyeOff, LayoutList, Plus, Check, X } from 'lucide-react'
import { ProjectData, TaskData, CHANNELS, ChannelKey } from '@/lib/types'

const MONTH_OFFSETS = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const CH: Record<string, { bg: string; border: string; text: string; label: string }> = {
  internal:      { bg: '#f3f4f6', border: '#d1d5db', text: '#374151', label: 'Internal' },
  mailers:       { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', label: 'Physical Mailers' },
  reverse911:    { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', label: 'Reverse 911' },
  email:         { bg: '#f3e8ff', border: '#d8b4fe', text: '#6b21a8', label: 'Email' },
  sms:           { bg: '#fef9c3', border: '#fde047', text: '#854d0e', label: 'SMS' },
  social_media:  { bg: '#fce7f3', border: '#f9a8d4', text: '#be185d', label: 'Social Media' },
  local_news:    { bg: '#ffedd5', border: '#fdba74', text: '#c2410c', label: 'Local News' },
  press_release: { bg: '#dcfce7', border: '#86efac', text: '#15803d', label: 'Press Releases' },
  website:       { bg: '#cffafe', border: '#67e8f9', text: '#0e7490', label: 'Website' },
  in_person:     { bg: '#ccfbf1', border: '#5eead4', text: '#0f766e', label: 'In-Person Event' },
}

const CHANNEL_ORDER = [
  'internal', 'mailers', 'reverse911', 'email',
  'sms', 'social_media', 'local_news', 'press_release', 'website', 'in_person',
]

const STATUS_DOT: Record<string, string> = {
  complete:    'bg-green-400',
  in_progress: 'bg-blue-400',
  not_started: 'bg-gray-300',
}

type AddingCell = { channel: string; monthOffset: number } | null

export default function GanttView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInternal, setShowInternal] = useState(false)
  const [showSkipped, setShowSkipped] = useState(false)
  const [adding, setAdding] = useState<AddingCell>(null)
  const [newTitle, setNewTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(data => {
        setProject({
          ...data,
          channels: JSON.parse(data.channels),
          tasks: data.tasks.map((t: any) => ({
            ...t,
            enabled: t.enabled == null ? true : Boolean(t.enabled),
          })),
        })
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const startAdding = (channel: string, monthOffset: number) => {
    setAdding({ channel, monthOffset })
    setNewTitle('')
  }

  const cancelAdding = () => {
    setAdding(null)
    setNewTitle('')
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !adding || !project) return
    setSaving(true)

    const res = await fetch(`/api/projects/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(),
        channel: adding.channel,
        monthOffset: adding.monthOffset,
      }),
    })
    const created = await res.json()
    setProject(prev => prev
      ? { ...prev, tasks: [...prev.tasks, { ...created, enabled: Boolean(created.enabled) }] }
      : prev
    )
    setAdding(null)
    setNewTitle('')
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>
  )
  if (!project) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Project not found</div>
  )

  const launchDate = new Date(project.launchDate)

  const visibleTasks = project.tasks.filter(t => {
    if (!showInternal && t.channel === 'internal') return false
    if (!showSkipped && !t.enabled) return false
    return true
  })

  const activeChannels = CHANNEL_ORDER.filter(ch =>
    project.tasks.some(t => t.channel === ch) || (showInternal && ch === 'internal')
  )

  const cellTasks = (channel: string, offset: number): TaskData[] =>
    visibleTasks
      .filter(t => t.channel === channel && t.monthOffset === offset)
      .sort((a, b) => new Date(a.dueDate).getDate() - new Date(b.dueDate).getDate())

  const toggleBtn = (active: boolean, onClick: () => void, icon: React.ReactNode, label: string) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'border-white/50 bg-white/20 text-white'
          : 'border-white/30 hover:bg-white/10 text-white/70'
      }`}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#235472] border-b border-[#1a3f55] sticky top-0 z-30">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/projects/${id}`} className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="bg-white rounded-md px-2.5 py-1 hidden sm:block">
              <Image src="/logo.png" alt="TAP" width={80} height={26} className="h-6 w-auto object-contain" />
            </div>
            <div className="w-px h-6 bg-white/20 hidden sm:block" />
            <div>
              <h1 className="text-base font-semibold text-white">{project.cityName} — Timeline</h1>
              <p className="text-xs text-white/70">Launch: {format(launchDate, 'MMMM d, yyyy')} · 14-month plan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {toggleBtn(showInternal, () => setShowInternal(v => !v),
              showInternal ? <Eye size={12} /> : <EyeOff size={12} />, 'Internal')}
            {toggleBtn(showSkipped, () => setShowSkipped(v => !v),
              showSkipped ? <Eye size={12} /> : <EyeOff size={12} />, 'Skipped')}
            <Link
              href={`/projects/${id}`}
              className="flex items-center gap-1.5 border border-white/30 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <LayoutList size={12} />
              Task List
            </Link>
          </div>
        </div>
      </header>

      {/* Gantt table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ display: 'inline-block', minWidth: '100%' }}>
          <table className="border-collapse" style={{ tableLayout: 'fixed', width: `${160 + MONTH_OFFSETS.length * 118}px` }}>
            <colgroup>
              <col style={{ width: '160px' }} />
              {MONTH_OFFSETS.map(m => <col key={m} style={{ width: '118px' }} />)}
            </colgroup>

            {/* Month header */}
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-20 bg-gray-50 border-b-2 border-r-2 border-gray-200 px-4 py-3 text-left">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Channel</span>
                </th>
                {MONTH_OFFSETS.map(offset => {
                  const isLaunch = offset === 0
                  const isRampUp = offset < 0
                  return (
                    <th
                      key={offset}
                      className={`border-b-2 border-r border-gray-200 px-2 py-2.5 text-center ${
                        isLaunch ? 'bg-[#235472]' : isRampUp ? 'bg-gray-100' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`text-xs font-semibold leading-tight ${isLaunch ? 'text-white' : isRampUp ? 'text-gray-600' : 'text-gray-700'}`}>
                        {offset === -2 ? 'Ramp-Up 1' : offset === -1 ? 'Ramp-Up 2' : offset === 0 ? 'Launch' : `Month ${offset}`}
                      </div>
                      <div className={`text-xs mt-0.5 ${isLaunch ? 'text-white/70' : 'text-gray-400'}`}>
                        {format(addMonths(launchDate, offset), 'MMM yyyy')}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            {/* Swim lanes */}
            <tbody>
              {activeChannels.map((channel, rowIdx) => {
                const c = CH[channel] ?? { bg: '#f9fafb', border: '#e5e7eb', text: '#374151', label: channel }
                const rowBg = rowIdx % 2 === 0 ? '#ffffff' : '#fafafa'

                return (
                  <tr key={channel}>
                    {/* Channel label */}
                    <td
                      className="sticky left-0 z-10 border-b border-r-2 border-gray-200 px-3 py-2.5 align-middle"
                      style={{ backgroundColor: rowBg }}
                    >
                      <span
                        className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md whitespace-nowrap"
                        style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                      >
                        {c.label}
                      </span>
                    </td>

                    {/* Month cells */}
                    {MONTH_OFFSETS.map(offset => {
                      const tasks = cellTasks(channel, offset)
                      const isLaunch = offset === 0
                      const isRampUp = offset < 0
                      const isAddingHere = adding?.channel === channel && adding?.monthOffset === offset
                      let cellBg = rowBg
                      if (isLaunch) cellBg = rowIdx % 2 === 0 ? '#eff6ff' : '#e0f2fe'
                      else if (isRampUp) cellBg = rowIdx % 2 === 0 ? '#f9fafb' : '#f3f4f6'

                      return (
                        <td
                          key={offset}
                          className="group border-b border-r border-gray-100 p-1.5 align-top"
                          style={{ backgroundColor: cellBg }}
                        >
                          <div className="flex flex-col gap-1">
                            {/* Existing task pills */}
                            {tasks.map(task => (
                              <div
                                key={task.id}
                                title={`${task.title}\nDue: ${format(new Date(task.dueDate), 'MMMM d, yyyy')}\nStatus: ${task.status.replace('_', ' ')}`}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-default transition-opacity ${
                                  !task.enabled ? 'opacity-35' : 'hover:brightness-95'
                                }`}
                                style={{
                                  backgroundColor: c.bg,
                                  border: `1px solid ${c.border}`,
                                  minHeight: '22px',
                                }}
                              >
                                <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${STATUS_DOT[task.status] ?? 'bg-gray-300'}`} />
                                <span className="flex-shrink-0 text-gray-400" style={{ fontSize: '9px' }}>
                                  {format(new Date(task.dueDate), 'd')}
                                </span>
                                <span className="truncate leading-tight" style={{ fontSize: '10px', color: c.text }}>
                                  {task.title}
                                </span>
                              </div>
                            ))}

                            {/* Inline add form */}
                            {isAddingHere ? (
                              <form onSubmit={handleAdd} className="flex items-center gap-1 mt-0.5">
                                <input
                                  ref={inputRef}
                                  value={newTitle}
                                  onChange={e => setNewTitle(e.target.value)}
                                  placeholder="Task title…"
                                  disabled={saving}
                                  onKeyDown={e => e.key === 'Escape' && cancelAdding()}
                                  className="flex-1 min-w-0 text-xs px-1.5 py-0.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#235472] bg-white"
                                  style={{ fontSize: '10px' }}
                                />
                                <button
                                  type="submit"
                                  disabled={saving || !newTitle.trim()}
                                  className="flex-shrink-0 text-green-600 hover:text-green-800 disabled:opacity-40"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelAdding}
                                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                                >
                                  <X size={12} />
                                </button>
                              </form>
                            ) : (
                              <button
                                onClick={() => startAdding(channel, offset)}
                                className="flex items-center gap-0.5 px-1 py-0.5 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-black/5"
                                style={{ fontSize: '10px' }}
                              >
                                <Plus size={10} />
                                add
                              </button>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <span className="text-xs text-gray-400 font-medium">Status:</span>
          {[
            { dot: 'bg-gray-300', label: 'Not Started' },
            { dot: 'bg-blue-400', label: 'In Progress' },
            { dot: 'bg-green-400', label: 'Complete' },
          ].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
          <span className="text-xs text-gray-300 ml-2">· Hover any cell to add a task · Hover a task for full details</span>
        </div>
      </div>
    </div>
  )
}
