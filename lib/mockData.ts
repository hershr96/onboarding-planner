import { ProjectData, TaskData } from './types'

let projects: ProjectData[] = [
  {
    id: 'mock-1',
    cityName: 'Springfield',
    launchDate: '2026-06-01T00:00:00.000Z',
    channels: ['email', 'sms', 'social_media', 'reverse911'],
    createdAt: '2026-04-01T00:00:00.000Z',
    tasks: [
      { id: 't1', title: 'Draft welcome email to citizens', channel: 'email', monthOffset: -3, dueDate: '2026-03-01T00:00:00.000Z', status: 'complete', assignee: 'Sarah M.', notes: 'Approved by comms team', sortOrder: 0, enabled: true },
      { id: 't2', title: 'Set up SMS broadcast list', channel: 'sms', monthOffset: -2, dueDate: '2026-04-01T00:00:00.000Z', status: 'complete', assignee: 'James R.', notes: '', sortOrder: 1, enabled: true },
      { id: 't3', title: 'Create social media campaign assets', channel: 'social_media', monthOffset: -2, dueDate: '2026-04-01T00:00:00.000Z', status: 'in_progress', assignee: 'Sarah M.', notes: 'Graphics in review', sortOrder: 2, enabled: true },
      { id: 't4', title: 'Configure Reverse 911 alert system', channel: 'reverse911', monthOffset: -1, dueDate: '2026-05-01T00:00:00.000Z', status: 'in_progress', assignee: 'James R.', notes: '', sortOrder: 3, enabled: true },
      { id: 't5', title: 'Send launch announcement email blast', channel: 'email', monthOffset: 0, dueDate: '2026-06-01T00:00:00.000Z', status: 'not_started', assignee: '', notes: '', sortOrder: 4, enabled: true },
      { id: 't6', title: 'Post go-live announcement on social media', channel: 'social_media', monthOffset: 0, dueDate: '2026-06-01T00:00:00.000Z', status: 'not_started', assignee: '', notes: '', sortOrder: 5, enabled: true },
      { id: 't7', title: 'Send SMS notification to residents', channel: 'sms', monthOffset: 0, dueDate: '2026-06-01T00:00:00.000Z', status: 'not_started', assignee: '', notes: '', sortOrder: 6, enabled: true },
      { id: 't8', title: '30-day follow-up email', channel: 'email', monthOffset: 1, dueDate: '2026-07-01T00:00:00.000Z', status: 'not_started', assignee: '', notes: '', sortOrder: 7, enabled: true },
    ],
  },
  {
    id: 'mock-2',
    cityName: 'Shelbyville',
    launchDate: '2026-09-01T00:00:00.000Z',
    channels: ['mailers', 'email', 'press_release', 'website'],
    createdAt: '2026-04-15T00:00:00.000Z',
    tasks: [
      { id: 't9', title: 'Design mailer postcard', channel: 'mailers', monthOffset: -3, dueDate: '2026-06-01T00:00:00.000Z', status: 'not_started', assignee: '', notes: '', sortOrder: 0, enabled: true },
      { id: 't10', title: 'Draft press release for local outlets', channel: 'press_release', monthOffset: -2, dueDate: '2026-07-01T00:00:00.000Z', status: 'not_started', assignee: '', notes: '', sortOrder: 1, enabled: true },
      { id: 't11', title: 'Update city website landing page', channel: 'website', monthOffset: -1, dueDate: '2026-08-01T00:00:00.000Z', status: 'not_started', assignee: '', notes: '', sortOrder: 2, enabled: true },
      { id: 't12', title: 'Mail postcards to all residents', channel: 'mailers', monthOffset: -1, dueDate: '2026-08-01T00:00:00.000Z', status: 'not_started', assignee: '', notes: '', sortOrder: 3, enabled: true },
      { id: 't13', title: 'Send launch email to registered users', channel: 'email', monthOffset: 0, dueDate: '2026-09-01T00:00:00.000Z', status: 'not_started', assignee: '', notes: '', sortOrder: 4, enabled: true },
      { id: 't14', title: 'Distribute press release', channel: 'press_release', monthOffset: 0, dueDate: '2026-09-01T00:00:00.000Z', status: 'not_started', assignee: '', notes: '', sortOrder: 5, enabled: true },
    ],
  },
]

export function getProjects(): ProjectData[] {
  return projects
}

export function getProject(id: string): ProjectData | undefined {
  return projects.find(p => p.id === id)
}

export function createProject(data: Omit<ProjectData, 'id' | 'createdAt' | 'tasks'>, tasks: Omit<TaskData, 'id'>[]): ProjectData {
  const project: ProjectData = {
    id: `proj-${Date.now()}`,
    createdAt: new Date().toISOString(),
    tasks: tasks.map((t, i) => ({ ...t, id: `task-${Date.now()}-${i}` })),
    ...data,
  }
  projects = [project, ...projects]
  return project
}

export function deleteProject(id: string): void {
  projects = projects.filter(p => p.id !== id)
}

export function addTask(projectId: string, task: Omit<TaskData, 'id'>): TaskData | null {
  const project = projects.find(p => p.id === projectId)
  if (!project) return null
  const newTask: TaskData = { ...task, id: `task-${Date.now()}` }
  project.tasks = [...project.tasks, newTask]
  return newTask
}

export function updateTask(projectId: string, taskId: string, updates: Partial<TaskData>): TaskData | null {
  const project = projects.find(p => p.id === projectId)
  if (!project) return null
  const task = project.tasks.find(t => t.id === taskId)
  if (!task) return null
  Object.assign(task, updates)
  return task
}
