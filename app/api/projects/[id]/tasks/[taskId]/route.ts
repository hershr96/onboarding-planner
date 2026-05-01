import { prisma } from '@/lib/db'

export async function PATCH(
  request: Request,
  ctx: RouteContext<'/api/projects/[id]/tasks/[taskId]'>
) {
  const { taskId } = await ctx.params
  const body = await request.json()

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(body.status    !== undefined && { status: body.status }),
      ...(body.assignee  !== undefined && { assignee: body.assignee }),
      ...(body.notes     !== undefined && { notes: body.notes }),
      ...(body.enabled   !== undefined && { enabled: body.enabled }),
    },
  })
  return Response.json(task)
}
