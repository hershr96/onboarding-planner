import { prisma } from '@/lib/db'
import { generatePlan } from '@/lib/planGenerator'
import { ChannelKey } from '@/lib/types'

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tasks: { orderBy: { sortOrder: 'asc' } } },
  })
  return Response.json(projects)
}

export async function POST(request: Request) {
  try {
  const { cityName, launchDate, channels } = await request.json()

  const launch = new Date(launchDate)
  const planTasks = generatePlan(launch, channels as ChannelKey[])

  const project = await prisma.project.create({
    data: {
      cityName,
      launchDate: launch,
      channels: JSON.stringify(channels),
      tasks: {
        create: planTasks.map((t) => ({
          title: t.title,
          channel: t.channel,
          monthOffset: t.monthOffset,
          dueDate: t.dueDate,
          sortOrder: t.sortOrder,
          enabled: true,
        })),
      },
    },
    include: { tasks: { orderBy: { sortOrder: 'asc' } } },
  })

  return Response.json(project, { status: 201 })
  } catch (e: any) {
    console.error('POST /api/projects error:', e)
    return Response.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}
