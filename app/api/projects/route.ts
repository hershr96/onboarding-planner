import { getProjects, createProject } from '@/lib/mockData'
import { generatePlan } from '@/lib/planGenerator'
import { ChannelKey } from '@/lib/types'

export async function GET() {
  return Response.json(getProjects())
}

export async function POST(request: Request) {
  const { cityName, launchDate, channels } = await request.json()
  const launch = new Date(launchDate)
  const planTasks = generatePlan(launch, channels as ChannelKey[])
  const project = createProject(
    { cityName, launchDate: launch.toISOString(), channels },
    planTasks.map(t => ({
      title: t.title,
      channel: t.channel,
      monthOffset: t.monthOffset,
      dueDate: t.dueDate,
      status: 'not_started' as const,
      assignee: '',
      notes: '',
      sortOrder: t.sortOrder,
      enabled: true,
    }))
  )
  return Response.json(project, { status: 201 })
}
