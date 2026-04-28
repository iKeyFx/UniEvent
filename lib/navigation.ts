export interface NavItem { id: string; label: string; icon: string; href: string }

export const STUDENT_LINKS: NavItem[] = [
  { id: 'browse',    label: 'Browse Events',    icon: '🗓', href: '/browse'    },
  { id: 'my-events', label: 'My Registrations', icon: '🎟', href: '/my-events' },
  { id: 'profile',   label: 'Profile',          icon: '👤', href: '/profile'   },
]

export const ORG_LINKS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard',    icon: '📊', href: '/dashboard' },
  { id: 'analytics', label: 'Analytics',    icon: '📈', href: '/analytics' },
  { id: 'create',    label: 'Create Event', icon: '➕', href: '/create'    },
  { id: 'checkin',   label: 'QR Check-In',  icon: '📷', href: '/checkin'   },
  { id: 'profile',   label: 'Profile',      icon: '👤', href: '/profile'   },
]
