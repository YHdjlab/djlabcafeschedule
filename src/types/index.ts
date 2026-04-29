export type Role = 'gm' | 'supervisor' | 'supervisor' | 'floor' | 'bar'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  phone?: string
  telegram_id?: string
  active: boolean
  created_at: string
  terminated_at?: string
}

export interface ShiftSlot {
  id: string
  week_starting: string
  slot_date: string
  slot_key: string
  slot_label: string
  slot_type: 'rush' | 'off-rush'
  start_time: string
  end_time: string
  supervisor_id?: string
  bar_staff_id?: string
  floor_staff1_id?: string
  floor_staff2_id?: string
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  created_at: string
}

export interface Availability {
  id: string
  week_starting: string
  staff_id: string
  slot_key: string
  available: boolean
  created_at: string
}

export interface SwapRequest {
  id: string
  swap_id: string
  staff_a_id: string
  staff_b_id: string
  shift_date: string
  shift_label: string
  status: 'pending_staff_b' | 'pending_supervisor' | 'approved' | 'denied'
  created_at: string
}

export interface DayOffRequest {
  id: string
  request_id: string
  staff_id: string
  date_off: string
  reason?: string
  status: 'pending_supervisor' | 'pending_gm' | 'approved' | 'denied'
  created_at: string
}

export interface AttendanceRecord {
  id: string
  attendance_id: string
  staff_id: string
  date: string
  checkin_time?: string
  checkout_time?: string
  shift_type: 'rush' | 'off-rush'
  status: 'pending_approval' | 'checked_in' | 'checked_out' | 'rejected'
  attendance_flag: 'on_time' | 'late' | 'no_show' | 'partial'
  created_at: string
}

export interface RushHourConfig {
  id: string
  day_type: 'weekday' | 'weekend'
  rush_start: string
  rush_end: string
  updated_by: string
  updated_at: string
}
