import { getProject, addTask } from '@/lib/mockData'
import { addMonths } from 'date-fns'

export async function POST(
  request: Request,
  ctx: RouteContext<'/api/projects/[id]/tasks'>
) {
  const { id } = await ctx.params
  const { title, channel, monthOffset, dueDate } = await request.json()
  const project = getProject(id)
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })

  const resolved = dueDate
    ? new Date(dueDate)
    : addMonths(new Date(project.launchDate), monthOffset)

  const maxSort = project.tasks.reduce((m, t) => Math.max(m, t.sortOrder), -1)

  const task = addTask(id, {
    title,
    channel,
    monthOffset,
    dueDate: resolved.toISOString(),
    status: 'not_started',
    assignee: '',
    notes: '',
    sortOrder: maxSort + 1,
    enabled: true,
  })

  return Response.json(task, { status: 201 })
}
