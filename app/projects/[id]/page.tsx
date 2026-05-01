'use client'

import { useEffect, useState, use, useRef } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, CheckCircle2, Circle, Clock, EyeOff, GanttChartSquare, Plus, Check, X, Link2 } from 'lucide-react'
import { ProjectData, TaskData, STATUS_CONFIG, CHANNELS, CHANNEL_COLORS, Status, ChannelKey } from '@/lib/types'
import { monthLabel } from '@/lib/planGenerator'

type AddingRow = { monthOffset: number } | null

export default function ProjectTracker({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ assignee: string; notes: string }>({ assignee: '', notes: '' })
  const [showDisabled, setShowDisabled] = useState(true)
  const [adding, setAdding] = useState<AddingRow>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newChannel, setNewChannel] = useState<ChannelKey | ''>('')
  const [newDueDate, setNewDueDate] = useState('')
  const [savingNew, setSavingNew] = useState(false)
  const [copied, setCopied] = useState(false)
  const addTitleRef = useRef<HTMLInputElement>(null)

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
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

  const updateTask = async (taskId: string, updates: Partial<TaskData>) => {
    const res = await fetch(`/api/projects/${id}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const updated = await res.json()
    setProject((prev) =>
      prev ? { ...prev, tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updated } : t)) } : prev
    )
  }

  const cycleStatus = (task: TaskData) => {
    if (!task.enabled) return
    const statuses: Status[] = ['not_started', 'in_progress', 'complete']
    const next = statuses[(statuses.indexOf(task.status as Status) + 1) % statuses.length]
    updateTask(task.id, { status: next })
  }

  const toggleEnabled = (task: TaskData) => {
    updateTask(task.id, { enabled: !task.enabled })
  }

  const saveEdit = (taskId: string) => {
    updateTask(taskId, editValues)
    setEditingTask(null)
  }

  const startAdding = (monthOffset: number) => {
    setAdding({ monthOffset })
    setNewTitle('')
    setNewChannel('')
    setNewDueDate('')
    setTimeout(() => addTitleRef.current?.focus(), 0)
  }

  const cancelAdding = () => {
    setAdding(null)
    setNewTitle('')
    setNewChannel('')
    setNewDueDate('')
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newChannel || !adding || !project) return
    setSavingNew(true)
    const res = await fetch(`/api/projects/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle.trim(),
        channel: newChannel,
        monthOffset: adding.monthOffset,
        dueDate: newDueDate || undefined,
      }),
    })
    const created = await res.json()
    setProject(prev =>
      prev ? { ...prev, tasks: [...prev.tasks, { ...created, enabled: Boolean(created.enabled) }] } : prev
    )
    cancelAdding()
    setSavingNew(false)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>
  if (!project) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Project not found</div>

  const launchDate = new Date(project.launchDate)
  const months = [...new Set(project.tasks.map((t) => t.monthOffset))].sort((a, b) => a - b)
  const activeTasks = project.tasks.filter((t) => t.enabled)
  const total = activeTasks.length
  const done = activeTasks.filter((t) => t.status === 'complete').length
  const inProg = activeTasks.filter((t) => t.status === 'in_progress').length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const disabledCount = project.tasks.filter((t) => !t.enabled).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#235472] border-b border-[#1a3f55] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="bg-white rounded-md px-2.5 py-1 hidden sm:block">
              <Image src="/logo.png" alt="TAP" width={80} height={26} className="h-6 w-auto object-contain" />
            </div>
            <div className="w-px h-6 bg-white/20 hidden sm:block" />
            <div>
              <h1 className="text-base font-semibold text-white">{project.cityName}</h1>
              <p className="text-xs text-white/70">Launch: {format(launchDate, 'MMMM d, yyyy')} · 14-month onboarding plan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-white/70">{done}/{total} complete · {inProg} in progress</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#AD7027] rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-medium text-white/80">{pct}%</span>
              </div>
            </div>
            {disabledCount > 0 && (
              <button
                onClick={() => setShowDisabled((v) => !v)}
                className="flex items-center gap-1.5 border border-white/30 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                <EyeOff size={13} />
                {showDisabled ? `Hide skipped (${disabledCount})` : `Show skipped (${disabledCount})`}
              </button>
            )}
            <Link
              href={`/projects/${id}/gantt`}
              className="flex items-center gap-1.5 border border-white/30 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <GanttChartSquare size={13} />
              Timeline
            </Link>
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                copied
                  ? 'border-green-400/60 bg-green-500/20 text-green-300'
                  : 'border-white/30 hover:bg-white/10 text-white'
              }`}
            >
              {copied ? <Check size={13} /> : <Link2 size={13} />}
              {copied ? 'Copied!' : 'Share'}
            </button>
            <Link
              href={`/projects/${id}/schedule`}
              className="flex items-center gap-1.5 border border-white/30 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <ExternalLink size={13} />
              Customer View
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[24px_2fr_1fr_120px_140px_1fr] gap-0 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div />
            <div>Task</div>
            <div>Channel</div>
            <div>Due Date</div>
            <div>Assignee</div>
            <div>Status</div>
          </div>

          {months.map((offset) => {
            const monthTasks = project.tasks.filter((t) => t.monthOffset === offset)
            const visibleTasks = monthTasks.filter((t) => t.enabled || showDisabled)
            if (visibleTasks.length === 0) return null
            const monthDone = monthTasks.filter((t) => t.status === 'complete' && t.enabled).length
            const monthActive = monthTasks.filter((t) => t.enabled).length

            return (
              <div key={offset}>
                {/* Section header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-800">
                      {monthLabel(offset, launchDate)}
                    </h4>
                    <span className="text-xs text-gray-400 font-normal">
                      {monthDone}/{monthActive} active
                    </span>
                  </div>
                  {offset <= 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      {offset < 0 ? 'Ramp-Up' : 'Launch'}
                    </span>
                  )}
                </div>

                {visibleTasks.map((task) => {
                  const statusCfg = STATUS_CONFIG[task.status as Status] ?? STATUS_CONFIG.not_started
                  const channelLabel = CHANNELS[task.channel as ChannelKey] ?? (task.channel === 'internal' ? 'Internal' : task.channel)
                  const channelColor = CHANNEL_COLORS[task.channel as keyof typeof CHANNEL_COLORS] ?? 'bg-gray-100 text-gray-600'
                  const isEditing = editingTask === task.id
                  const isDisabled = !task.enabled

                  return (
                    <div
                      key={task.id}
                      className={`border-b border-gray-50 last:border-0 transition-colors ${isDisabled ? 'bg-gray-50/60' : 'hover:bg-gray-50/50'}`}
                    >
                      <div className="grid grid-cols-[24px_2fr_1fr_120px_140px_1fr] gap-0 items-center px-4 py-3">
                        {/* Enable/disable toggle */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={task.enabled}
                            onChange={() => toggleEnabled(task)}
                            className="w-3.5 h-3.5 accent-[#AD7027] cursor-pointer"
                            title={task.enabled ? 'Click to skip this task' : 'Click to include this task'}
                          />
                        </div>

                        {/* Task title */}
                        <div className={`flex items-center gap-2 min-w-0 ${isDisabled ? 'opacity-40' : ''}`}>
                          <button
                            onClick={() => cycleStatus(task)}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                            disabled={isDisabled}
                          >
                            {task.status === 'complete' ? (
                              <CheckCircle2 size={16} className="text-green-500" />
                            ) : task.status === 'in_progress' ? (
                              <Clock size={16} className="text-blue-500" />
                            ) : (
                              <Circle size={16} />
                            )}
                          </button>
                          <span className={`text-sm text-gray-800 truncate ${task.status === 'complete' ? 'line-through text-gray-400' : ''} ${isDisabled ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                          </span>
                        </div>

                        {/* Channel */}
                        <div className={isDisabled ? 'opacity-40' : ''}>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${isDisabled ? 'bg-gray-100 text-gray-400' : channelColor}`}>
                            {channelLabel}
                          </span>
                        </div>

                        {/* Due date */}
                        <div className={`text-sm text-gray-500 ${isDisabled ? 'opacity-40' : ''}`}>
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </div>

                        {/* Assignee */}
                        <div className={isDisabled ? 'opacity-40 pointer-events-none' : ''}>
                          {isEditing && !isDisabled ? (
                            <input
                              autoFocus
                              value={editValues.assignee}
                              onChange={(e) => setEditValues((v) => ({ ...v, assignee: e.target.value }))}
                              onBlur={() => saveEdit(task.id)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#235472]"
                              placeholder="Assignee…"
                            />
                          ) : (
                            <button
                              onClick={() => !isDisabled && (setEditingTask(task.id), setEditValues({ assignee: task.assignee, notes: task.notes }))}
                              className="text-sm text-gray-500 hover:text-gray-800 text-left truncate w-full"
                            >
                              {task.assignee || <span className="text-gray-300">— Add assignee</span>}
                            </button>
                          )}
                        </div>

                        {/* Status */}
                        <div className={isDisabled ? 'opacity-40' : ''}>
                          {isDisabled ? (
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-400">Skipped</span>
                          ) : (
                            <button
                              onClick={() => cycleStatus(task)}
                              className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusCfg.color}`}
                            >
                              {statusCfg.label}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notes row */}
                      {!isDisabled && (task.notes || isEditing) && (
                        <div className="px-4 pb-3 pl-12">
                          {isEditing ? (
                            <textarea
                              value={editValues.notes}
                              onChange={(e) => setEditValues((v) => ({ ...v, notes: e.target.value }))}
                              onBlur={() => saveEdit(task.id)}
                              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 text-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-[#235472]"
                              rows={2}
                              placeholder="Add notes…"
                            />
                          ) : (
                            <p className="text-xs text-gray-400 italic">{task.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Add task row */}
                {adding?.monthOffset === offset ? (
                  <form
                    onSubmit={handleAdd}
                    className="border-t border-gray-100 px-4 py-2.5 bg-blue-50/40"
                  >
                    <div className="grid grid-cols-[24px_2fr_1fr_120px_140px_1fr] gap-0 items-center">
                      <div />
                      <input
                        ref={addTitleRef}
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Task title…"
                        disabled={savingNew}
                        onKeyDown={e => e.key === 'Escape' && cancelAdding()}
                        className="text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#235472] mr-2"
                      />
                      <select
                        value={newChannel}
                        onChange={e => setNewChannel(e.target.value as ChannelKey)}
                        disabled={savingNew}
                        className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#235472] mr-2"
                      >
                        <option value="">Channel…</option>
                        <option value="internal">Internal</option>
                        {(Object.entries(CHANNELS) as [ChannelKey, string][]).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={newDueDate}
                        onChange={e => setNewDueDate(e.target.value)}
                        disabled={savingNew}
                        className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#235472] mr-2"
                      />
                      <div />
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={savingNew || !newTitle.trim() || !newChannel}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#235472] text-white rounded-lg disabled:opacity-40 hover:bg-[#1a3f55]"
                        >
                          <Check size={12} /> Add
                        </button>
                        <button
                          type="button"
                          onClick={cancelAdding}
                          className="flex items-center gap-1 text-xs px-2 py-1.5 text-gray-500 hover:text-gray-800 border border-gray-300 rounded-lg"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => startAdding(offset)}
                    className="w-full flex items-center gap-1.5 px-4 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-t border-gray-100 transition-colors"
                  >
                    <Plus size={12} />
                    Add task to this month
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
