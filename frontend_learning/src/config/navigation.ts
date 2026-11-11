export interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
  primary?: boolean;
}

export const STUDENT_NAV: NavItem[] = [
  { to: '/student/dashboard', label: 'Dashboard', icon: 'grid', end: true },
  { to: '/courses', label: 'Browse Courses', icon: 'book' },
  { to: '/student/my-learning', label: 'My Learning', icon: 'layers' },
  { to: '/student/progress', label: 'Progress', icon: 'chart' },
  { to: '/student/certificates', label: 'Certificates', icon: 'award' },
  { to: '/student/payments', label: 'Payments', icon: 'card' },
  { to: '/student/profile', label: 'Profile', icon: 'user' },
];

export const TEACHER_NAV: NavItem[] = [
  { to: '/teacher/dashboard', label: 'Dashboard', icon: 'grid', end: true },
  { to: '/teacher/courses', label: 'My Courses', icon: 'book' },
  { to: '/teacher/courses/create', label: 'Create Course', icon: 'plus' },
  { to: '/teacher/assignments', label: 'Assignments', icon: 'clipboard' },
  { to: '/teacher/profile', label: 'Profile', icon: 'user' },
];

export const ADMIN_NAV: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'grid', end: true },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/instructors', label: 'Instructor Applications', icon: 'user' },
  { to: '/admin/courses', label: 'Courses', icon: 'book' },
  { to: '/admin/categories', label: 'Course Categories', icon: 'folder' },
  { to: '/admin/profile', label: 'Profile', icon: 'user' },
];

// Bottom nav — exactly 5 items per spec §4.2–4.4.
export const STUDENT_MOBILE_NAV: NavItem[] = [
  { to: '/student/dashboard', label: 'Home', icon: 'home' },
  { to: '/courses', label: 'Courses', icon: 'book' },
  { to: '/student/my-learning', label: 'My Learning', icon: 'layers' },
  { to: '/student/progress', label: 'Progress', icon: 'chart' },
  { to: '/student/profile', label: 'Profile', icon: 'user' },
];

export const TEACHER_MOBILE_NAV: NavItem[] = [
  { to: '/teacher/dashboard', label: 'Home', icon: 'home' },
  { to: '/teacher/courses', label: 'Courses', icon: 'book' },
  { to: '/teacher/courses/create', label: 'Create', icon: 'plus', primary: true },
  { to: '/teacher/assignments', label: 'Tasks', icon: 'clipboard' },
  { to: '/teacher/profile', label: 'Profile', icon: 'user' },
];

export const ADMIN_MOBILE_NAV: NavItem[] = [
  { to: '/admin/dashboard', label: 'Home', icon: 'home' },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/courses', label: 'Courses', icon: 'book' },
  { to: '/admin/more', label: 'More', icon: 'more' },
  { to: '/admin/profile', label: 'Profile', icon: 'user' },
];