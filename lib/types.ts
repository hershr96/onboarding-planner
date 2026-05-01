export const CHANNELS = {
  mailers: 'Physical Mailers / Utility Bill Inserts',
  reverse911: 'Reverse 911',
  email: 'Email to Citizens',
  sms: 'SMS Notifications',
  social_media: 'Social Media',
  local_news: 'Local News Ads & Sponsorships',
  press_release: 'Press Releases',
  website: 'Website Updates',
  in_person: 'In-Person Event',
} as const

export type ChannelKey = keyof typeof CHANNELS

export const CHANNEL_COLORS: Record<ChannelKey | 'internal', string> = {
  mailers: 'bg-blue-100 text-blue-800',
  reverse911: 'bg-red-100 text-red-800',
  email: 'bg-purple-100 text-purple-800',
  sms: 'bg-yellow-100 text-yellow-800',
  social_media: 'bg-pink-100 text-pink-800',
  local_news: 'bg-orange-100 text-orange-800',
  press_release: 'bg-green-100 text-green-800',
  website: 'bg-cyan-100 text-cyan-800',
  in_person: 'bg-teal-100 text-teal-800',
  internal: 'bg-gray-100 text-gray-700',
}

export const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'bg-gray-200 text-gray-700', dot: 'bg-gray-400' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  complete: { label: 'Complete', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
}

export type Status = keyof typeof STATUS_CONFIG

export interface TaskData {
  id: string
  title: string
  channel: string
  monthOffset: number
  dueDate: string
  status: Status
  assignee: string
  notes: string
  sortOrder: number
  enabled: boolean
}

export interface ProjectData {
  id: string
  cityName: string
  launchDate: string
  channels: string[]
  createdAt: string
  tasks: TaskData[]
}
