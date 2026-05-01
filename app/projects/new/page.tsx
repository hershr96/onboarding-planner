'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { CHANNELS, ChannelKey } from '@/lib/types'

const CHANNEL_DESCRIPTIONS: Record<ChannelKey, string> = {
  mailers: 'Printed materials distributed via mail or utility bills at key milestones',
  reverse911: 'One-time mass phone alert to all citizens at launch',
  email: 'Email communications to registered citizens',
  sms: 'Text message notifications to opted-in users',
  social_media: 'City-specific Facebook/Instagram pages plus ongoing content',
  local_news: 'Paid ads and sponsorships with local TV, radio, and news outlets',
  press_release: 'Earned media — press releases distributed to local journalists',
  website: 'Updates to city website with program information',
  in_person: 'Community events such as farmers markets, chamber of commerce meetings, or local gatherings',
}

export default function NewProject() {
  const router = useRouter()
  const [cityName, setCityName] = useState('')
  const [launchDate, setLaunchDate] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<ChannelKey[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggleChannel = (key: ChannelKey) => {
    setSelectedChannels((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cityName.trim()) return setError('City name is required')
    if (!launchDate) return setError('Launch date is required')
    if (selectedChannels.length === 0) return setError('Select at least one channel')

    setSaving(true)
    setError('')

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cityName: cityName.trim(), launchDate, channels: selectedChannels }),
    })

    if (res.ok) {
      const project = await res.json()
      router.push(`/projects/${project.id}`)
    } else {
      setError('Failed to create project. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#235472]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="bg-white rounded-md px-2.5 py-1">
            <Image src="/logo.png" alt="TAP" width={90} height={28} className="h-7 w-auto object-contain" />
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div>
            <h1 className="text-base font-semibold text-white">New Onboarding Plan</h1>
            <p className="text-xs text-white/70">Configure a 14-month city onboarding timeline</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="space-y-6">
            {/* City Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. City of Austin"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#235472] focus:border-transparent"
              />
            </div>

            {/* Launch Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Launch Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#235472] focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                The plan will include 2 months of ramp-up before this date and 12 months of communications after.
              </p>
            </div>

            {/* Channels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Communication Channels <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Select all channels the city can use to distribute informational materials.
              </p>
              <div className="space-y-2">
                {(Object.entries(CHANNELS) as [ChannelKey, string][]).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedChannels.includes(key)
                        ? 'border-[#AD7027] bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(key)}
                      onChange={() => toggleChannel(key)}
                      className="mt-0.5 accent-[#AD7027]"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{label}</div>
                      <div className="text-xs text-gray-500">{CHANNEL_DESCRIPTIONS[key]}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Link
                href="/"
                className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#AD7027] hover:bg-[#8F5B1E] disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? <><Loader2 size={15} className="animate-spin" /> Generating Plan…</> : 'Generate 14-Month Plan'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
