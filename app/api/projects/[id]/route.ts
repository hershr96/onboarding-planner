import { getProject, deleteProject } from '@/lib/mockData'

export async function GET(
  _req: Request,
  ctx: RouteContext<'/api/projects/[id]'>
) {
  const { id } = await ctx.params
  const project = getProject(id)
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(project)
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<'/api/projects/[id]'>
) {
  const { id } = await ctx.params
  deleteProject(id)
  return new Response(null, { status: 204 })
}
