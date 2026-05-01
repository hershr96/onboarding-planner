import { prisma } from '@/lib/db'
import { addMonths } from 'date-fns'

export async function POST(
  request: Request,
  ctx: RouteContext<'/api/projects/[id]/tasks'>
) {
  const { id } = await ctx.params
  const { title, channel, monthOffset, dueDate } = await request.json()

  const project = await prisma.project.findUnique({
    where: { id },
    select: { launchDate: true },
  })
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })

  const last = await prisma.task.findFirst({
    where: { projectId: id },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })

  const resolved = dueDate
    ? new Date(dueDate)
    : addMonths(new Date(project.launchDate), monthOffset)

  const task = await prisma.task.create({
    data: {
      projectId: id,
      title,
      channel,
      monthOffset,
      dueDate: resolved,
      status: 'not_started',
      assignee: '',
      notes: '',
      sortOrder: (last?.sortOrder ?? -1) + 1,
      enabled: true,
    },
  })

  return Response.json(task, { status: 201 })
}
