import { addMonths, addDays, format } from 'date-fns'
import { ChannelKey } from './types'

interface PlanTask {
  title: string
  channel: string
  monthOffset: number
  dueDate: Date
  sortOrder: number
}

function monthStart(launchDate: Date, offset: number): Date {
  return addMonths(launchDate, offset)
}

export function generatePlan(launchDate: Date, channels: ChannelKey[]): PlanTask[] {
  const tasks: PlanTask[] = []
  let sort = 0

  const add = (title: string, channel: string, monthOffset: number, dayOffset = 0) => {
    const base = monthStart(launchDate, monthOffset)
    tasks.push({ title, channel, monthOffset, dueDate: addDays(base, dayOffset), sortOrder: sort++ })
  }

  const has = (c: ChannelKey) => channels.includes(c)

  // ── Month -2: Internal Setup & Channel Preparation ─────────────────────
  add('Technology platform setup and city configuration', 'internal', -2, 0)
  add('Collections system integration and testing', 'internal', -2, 5)
  add('Internal team training on platform and operations', 'internal', -2, 10)
  add('Identify city liaison and key communication contacts', 'internal', -2, 14)
  add('Request city branding assets — logo, colors, letterhead', 'internal', -2, 14)
  if (has('social_media'))  add('Create city-specific Facebook and Instagram pages', 'social_media', -2, 21)
  if (has('mailers'))       add('Design launch utility mailer with city branding', 'mailers', -2, 21)
  if (has('email'))         add('Build and segment citizen email distribution list', 'email', -2, 21)
  if (has('sms'))           add('Configure SMS platform and confirm opt-in list with city', 'sms', -2, 21)
  if (has('website'))       add('Plan city-specific landing page content and design', 'website', -2, 21)

  // ── Month -1: Finalization & Approvals ─────────────────────────────────
  add('System integration and user acceptance testing (UAT)', 'internal', -1, 0)
  add('City staff briefing and Q&A session', 'internal', -1, 7)
  add('Soft launch — pilot testing with internal users', 'internal', -1, 14)
  if (has('reverse911'))    add('Write and get city approval on Reverse 911 script', 'reverse911', -1, 5)
  if (has('press_release')) add('Draft launch press release — submit to city for approval', 'press_release', -1, 5)
  if (has('social_media'))  add('Finalize launch week social media content calendar', 'social_media', -1, 7)
  if (has('social_media'))  add('Publish city Facebook and Instagram pages publicly', 'social_media', -1, 14)
  if (has('email'))         add('Prepare and get approval on launch announcement email', 'email', -1, 7)
  if (has('sms'))           add('Prepare and get approval on launch SMS message', 'sms', -1, 7)
  if (has('mailers'))       add('Finalize launch mailer artwork — submit to printer/mail house', 'mailers', -1, 7)
  if (has('website'))       add('Finalize city landing page — ready to publish on launch day', 'website', -1, 14)
  if (has('local_news'))    add('Book and design launch week local news ad / sponsorship', 'local_news', -1, 7)

  // ── Month 0: Launch ────────────────────────────────────────────────────
  add('Official program launch — go live', 'internal', 0, 0)
  if (has('mailers'))       add('Utility bill mailer distributed to all households', 'mailers', 0, 0)
  if (has('reverse911'))    add('Reverse 911 call to all registered numbers — program launch announcement', 'reverse911', 0, 0)
  if (has('press_release')) add('Distribute launch press release to local media', 'press_release', 0, 0)
  if (has('email'))         add('Send launch announcement email to all citizens', 'email', 0, 0)
  if (has('sms'))           add('Send launch SMS to all opted-in residents', 'sms', 0, 0)
  if (has('social_media'))  add('Post: "Introducing TAP in [City]" — launch announcement', 'social_media', 0, 0)
  if (has('social_media'))  add('Post: What is TAP and what can you use it for? (educational)', 'social_media', 0, 3)
  if (has('social_media'))  add('Post: How to register your account (step-by-step)', 'social_media', 0, 5)
  if (has('website'))       add('Publish program launch page on city website', 'website', 0, 0)
  if (has('local_news'))    add('Launch week local news ad — program awareness', 'local_news', 0, 0)
  add('Post-launch debrief with city liaison', 'internal', 0, 7)

  // ── Month 1: Registration Drive ────────────────────────────────────────
  add('Month 1 internal performance review', 'internal', 1, 0)
  if (has('mailers'))       add('Month 1 mailer: Registration guide — how to sign up and why it matters', 'mailers', 1, 0)
  if (has('social_media'))  add('Post: How to register — step-by-step with screenshots', 'social_media', 1, 0)
  if (has('social_media'))  add('Post: Top reasons to register for the program', 'social_media', 1, 7)
  if (has('social_media'))  add('Post: Early user testimonial / "What I love about TAP"', 'social_media', 1, 14)
  if (has('social_media'))  add('Post: Registration reminder — deadline or urgency message', 'social_media', 1, 21)
  if (has('email'))         add('Email: Registration reminder to all unregistered citizens', 'email', 1, 3)
  if (has('sms'))           add('SMS: Registration reminder to all opted-in residents', 'sms', 1, 3)
  if (has('local_news'))    add('Local news ad: "Have you registered for [City]\'s TAP program yet?"', 'local_news', 1, 0)
  if (has('press_release')) add('Press release: Early adoption momentum — community response to launch', 'press_release', 1, 7)

  // ── Month 2: Education & Feature Awareness ─────────────────────────────
  add('Month 2 internal performance review', 'internal', 2, 0)
  if (has('social_media'))  add('Post: Feature spotlight — how to use the service for [key use case]', 'social_media', 2, 0)
  if (has('social_media'))  add('Post: FAQ — top questions we\'re hearing from the community', 'social_media', 2, 7)
  if (has('social_media'))  add('Post: Resident spotlight — real story from an early user', 'social_media', 2, 14)
  if (has('email'))         add('Email: "Making the most of TAP" — feature highlights for registered users', 'email', 2, 3)
  if (has('sms'))           add('SMS: Feature tip — one thing you can do with TAP this month', 'sms', 2, 7)
  if (has('local_news'))    add('Local news sponsorship: Month 2 awareness campaign', 'local_news', 2, 0)

  // ── Month 3: 90-Day Milestone ──────────────────────────────────────────
  add('Month 3 performance review — 90-day milestone', 'internal', 3, 0)
  if (has('mailers'))       add('Month 3 mailer: 90-day update — program highlights and registration numbers', 'mailers', 3, 0)
  if (has('social_media'))  add('Post: 90-day community milestone — registration and usage stats', 'social_media', 3, 0)
  if (has('social_media'))  add('Post: How-to tutorial for a popular feature', 'social_media', 3, 7)
  if (has('social_media'))  add('Post: "Share your story" — user-generated content drive', 'social_media', 3, 14)
  if (has('email'))         add('Email: 90-day program update — what we\'ve accomplished together', 'email', 3, 3)
  if (has('local_news'))    add('Local news ad: 90-day milestone — growing community awareness', 'local_news', 3, 0)
  if (has('press_release')) add('Press release: Q1 report — adoption numbers and community impact', 'press_release', 3, 0)

  // ── Month 4: Sustained Engagement ──────────────────────────────────────
  add('Month 4 internal performance review', 'internal', 4, 0)
  if (has('social_media'))  add('Post: How-to video or carousel — [top feature in depth]', 'social_media', 4, 0)
  if (has('social_media'))  add('Post: Community poll or Q&A — engage your neighbors', 'social_media', 4, 10)
  if (has('social_media'))  add('Post: Did you know? Surprising ways people use TAP', 'social_media', 4, 20)
  if (has('email'))         add('Email: Tips and tricks — getting more out of TAP', 'email', 4, 3)
  if (has('sms'))           add('SMS: Engagement message — new feature or tip for active users', 'sms', 4, 7)

  // ── Month 5: Pre-Scale-Back Push ───────────────────────────────────────
  add('Month 5 internal performance review', 'internal', 5, 0)
  if (has('social_media'))  add('Post: Feature deep-dive — [second most-used feature]', 'social_media', 5, 0)
  if (has('social_media'))  add('Post: Testimonial series — voices from the community', 'social_media', 5, 10)
  if (has('social_media'))  add('Post: Reminder for unregistered residents — it\'s not too late', 'social_media', 5, 20)
  if (has('email'))         add('Email: 5-month program update for all citizens', 'email', 5, 3)
  if (has('local_news'))    add('Local news sponsorship: Month 5 — final major ad buy before scale-back', 'local_news', 5, 0)
  if (has('press_release')) add('Press release: 5-month momentum update', 'press_release', 5, 0)

  // ── Month 6: 6-Month Milestone + Transition to Sustained ───────────────
  add('Month 6 strategic review — transition to sustained engagement phase', 'internal', 6, 0)
  if (has('mailers'))       add('Month 6 mailer: 6-month highlights — celebrating the community', 'mailers', 6, 0)
  if (has('social_media'))  add('Post: 6-month milestone — by the numbers', 'social_media', 6, 0)
  if (has('social_media'))  add('Post: Community impact story — real difference in residents\' lives', 'social_media', 6, 7)
  if (has('social_media'))  add('Post: What\'s coming — continued value for registered users', 'social_media', 6, 14)
  if (has('email'))         add('Email: 6-month anniversary — celebrating the community', 'email', 6, 3)
  if (has('press_release')) add('Press release: 6-month comprehensive report — community impact and growth', 'press_release', 6, 0)

  // ── Months 7–12: Sustained Social + Quarterly Touchpoints ─────────────
  for (let m = 7; m <= 12; m++) {
    add(`Month ${m} internal performance review`, 'internal', m, 0)

    if (has('social_media')) {
      add(`Post: Monthly community content — [relevant seasonal or program topic]`, 'social_media', m, 0)
      add(`Post: Monthly engagement content — tips, stories, or reminders`, 'social_media', m, 14)
      if (m === 9 || m === 12) {
        add(`Post: Program milestone — ${m === 9 ? '9-month' : 'year 1'} highlights`, 'social_media', m, 7)
      }
    }

    if (has('email') && (m === 9 || m === 12)) {
      add(`Email: ${m === 9 ? '9-month' : 'Year 1 anniversary'} update to all citizens`, 'email', m, 3)
    }

    if (has('sms') && (m === 9 || m === 12)) {
      add(`SMS: ${m === 9 ? 'Re-engagement' : 'Year 1 anniversary'} message to all opted-in residents`, 'sms', m, 3)
    }

    if (has('press_release') && m === 9) {
      add('Press release: Q3 program update — continued community growth', 'press_release', 9, 0)
    }

    if (m === 12) {
      if (has('mailers'))       add('Year 1 anniversary mailer: Celebrating our first year together', 'mailers', 12, 0)
      if (has('press_release')) add('Press release: Year 1 annual report — full program impact and outcomes', 'press_release', 12, 0)
    }
  }

  return tasks
}

export function monthLabel(offset: number, launchDate: Date): string {
  if (offset === -2) return 'Ramp-Up — Month 1'
  if (offset === -1) return 'Ramp-Up — Month 2'
  if (offset === 0)  return `Launch — ${format(launchDate, 'MMMM yyyy')}`
  return `Month ${offset} — ${format(addMonths(launchDate, offset), 'MMMM yyyy')}`
}
