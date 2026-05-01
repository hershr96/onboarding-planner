'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import Image from 'next/image'
import { ArrowLeft, Printer } from 'lucide-react'
import { ProjectData, CHANNELS, ChannelKey } from '@/lib/types'
import { monthLabel } from '@/lib/planGenerator'

export default function CustomerSchedule({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProject({ ...data, channels: JSON.parse(data.channels) })
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>
  if (!project) return <div className="min-h-screen flex items-center justify-center text-gray-400">Not found</div>

  const launchDate = new Date(project.launchDate)
  const months = [...new Set(project.tasks.map((t) => t.monthOffset))].sort((a, b) => a - b)

  // Only include customer-facing enabled tasks (exclude internal and skipped)
  const customerTasks = project.tasks.filter((t) => t.channel !== 'internal' && t.enabled)
  const tasksByMonth = (offset: number) => customerTasks.filter((t) => t.monthOffset === offset)

  const CHANNEL_PRINT_COLORS: Record<string, string> = {
    mailers: '#dbeafe',
    reverse911: '#fee2e2',
    email: '#f3e8ff',
    sms: '#fef9c3',
    social_media: '#fce7f3',
    press_release: '#dcfce7',
    website: '#cffafe',
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print controls — hidden when printing */}
      <div className="print:hidden bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href={`/projects/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={16} />
            Back to Tracker
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-[#AD7027] hover:bg-[#8F5B1E] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Printer size={15} />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-4xl mx-auto px-8 py-10 print:py-6 print:px-6">
        {/* Cover */}
        <div className="mb-10 pb-8 border-b-2 border-[#235472]">
          <div className="flex items-end justify-between">
            <div>
              <Image src="/logo.png" alt="TAP" width={140} height={44} className="h-11 w-auto object-contain mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">{project.cityName}</h1>
              <h2 className="text-xl text-gray-600 mt-1">14-Month Outreach & Communications Plan</h2>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>Plan Generated: {format(new Date(project.createdAt), 'MMMM d, yyyy')}</div>
              <div className="font-semibold text-gray-800 mt-1">Launch Date: {format(launchDate, 'MMMM d, yyyy')}</div>
            </div>
          </div>
        </div>

        {/* Overview note */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
          <p>
            This plan outlines a 14-month communications timeline beginning with a 2-month ramp-up period,
            followed by the program launch and 12 months of ongoing community outreach. All communications
            are informational in nature — designed to keep citizens aware of and informed about the program.
          </p>
        </div>

        {/* Channel legend */}
        {project.channels.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Communication Channels</h3>
            <div className="flex flex-wrap gap-2">
              {(project.channels as ChannelKey[]).map((c) => (
                <span
                  key={c}
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: CHANNEL_PRINT_COLORS[c] ?? '#f3f4f6', color: '#374151' }}
                >
                  {CHANNELS[c]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Monthly sections */}
        {months.map((offset) => {
          const tasks = tasksByMonth(offset)
          if (tasks.length === 0) return null
          const isLaunch = offset === 0
          const isRampUp = offset < 0

          return (
            <div key={offset} className="mb-8 print:break-inside-avoid">
              {/* Month header */}
              <div className={`flex items-center justify-between px-4 py-2 rounded-lg mb-3 ${
                isLaunch ? 'bg-[#235472] text-white' : isRampUp ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
              }`}>
                <h3 className="font-semibold text-sm">{monthLabel(offset, launchDate)}</h3>
                {isRampUp && <span className="text-xs opacity-75">Internal Preparation</span>}
                {isLaunch && <span className="text-xs opacity-75">Launch</span>}
              </div>

              {/* Tasks */}
              <div className="space-y-1.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 px-3 py-2 rounded border border-gray-100"
                    style={{ backgroundColor: CHANNEL_PRINT_COLORS[task.channel] ? `${CHANNEL_PRINT_COLORS[task.channel]}40` : '#f9fafb' }}
                  >
                    <div className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: CHANNEL_PRINT_COLORS[task.channel] ?? '#9ca3af' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{task.title}</p>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                      {CHANNELS[task.channel as ChannelKey] ?? task.channel}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400 flex justify-between print:mt-8">
          <span>MD Health Pathways · Confidential</span>
          <span>{project.cityName} · {format(launchDate, 'yyyy')} Onboarding Plan</span>
        </div>
      </div>
    </div>
  )
}
