import { updateTask } from '@/lib/mockData'

export async function PATCH(
  request: Request,
  ctx: RouteContext<'/api/projects/[id]/tasks/[taskId]'>
) {
  const { id, taskId } = await ctx.params
  const body = await request.json()
  const task = updateTask(id, taskId, body)
  if (!task) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(task)
}
