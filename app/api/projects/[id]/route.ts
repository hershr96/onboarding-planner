import { prisma } from '@/lib/db'

export async function GET(
  _req: Request,
  ctx: RouteContext<'/api/projects/[id]'>
) {
  const { id } = await ctx.params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { tasks: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(project)
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<'/api/projects/[id]'>
) {
  const { id } = await ctx.params
  await prisma.project.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
