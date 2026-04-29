import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BRAND = {
  dark: '#323232',
  cream: '#F7F0E8',
  coral: '#FF6357',
} as const

export const ROLE_LABELS: Record<string, string> = {
  gm: 'General Manager',
  supervisor: 'Supervisor',
  supervisor: 'Supervisor',
  floor: 'Floor Staff',
  bar: 'Bar Staff',
}

export const ROLE_COLORS: Record<string, string> = {
  gm: 'bg-purple-100 text-purple-800',
  supervisor: 'bg-blue-100 text-blue-800',
  supervisor: 'bg-indigo-100 text-indigo-800',
  floor: 'bg-green-100 text-green-800',
  bar: 'bg-orange-100 text-orange-800',
}

export function isAdmin(role: string, is_admin?: boolean) {
  return is_admin === true || ['gm', 'admin', 'supervisor'].includes(role)
}

export function isGM(role: string, is_admin?: boolean) {
  return role === 'gm' || role === 'admin' || is_admin === true
}

export function isSupervisor(role: string) {
  return ['supervisor'].includes(role)
}

export function formatTime(time: string) {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return displayHour + ':' + m + period
}

export function getWeekDates(weekStarting: string) {
  const dates = []
  const start = new Date(weekStarting + 'T00:00:00')
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export function getNextMonday() {
  const today = new Date()
  const day = today.getDay()
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() + daysUntilMonday)
  return monday.toISOString().slice(0, 10)
}

export function getCurrentWeekMonday() {
  const today = new Date()
  const day = today.getDay()
  const daysFromMonday = day === 0 ? 6 : day - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMonday)
  return monday.toISOString().slice(0, 10)
}
