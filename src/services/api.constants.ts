export const API_ENDPOINTS = {
  //Auth
  AUTH: {
    LOGIN: '/api/Auth/login',
    REGISTER: '/api/Auth/register',
  },

  // User Management
  USER_MANAGEMENT: {
    USER_BASE: '/api/UserManagement/users',
    PENDING: '/api/UserManagement/users/pending',
    ACTIVE: '/api/UserManagement/users/active',
    INACTIVE: '/api/UserManagement/users/inactive',
    STATISTICS: '/api/UserManagement/statistics',
  },

  // User Role
  USER_ROLE: {
    BASE: '/api/UserRole',
    ROLES: '/api/UserRole/roles',
    USERS: '/api/UserRole/users',
    STATISTICS: '/api/UserRole/statistics',
  },

  // Student
  STUDENT: {
    BASE: '/api/Student',
    SEARCH: '/api/Student/search',
    ACTIVE: '/api/Student/active',
    BY_PARENT: (parentId: number | string) => `/api/Student/parent/${parentId}`,
  },

  // Student Parent
  STUDENT_PARENT: {
    BASE: '/api/StudentParent',
    BY_STUDENT: (studentId: number | string) => `/api/StudentParent/student/${studentId}`,
    BY_PARENT: (parentId: number | string) => `/api/StudentParent/parent/${parentId}`,
    LINK: (studentId: number | string) => `/api/StudentParent/student/${studentId}/link`,
    UPDATE_RELATION: (studentId: number | string, parentId: number | string) => `/api/StudentParent/student/${studentId}/parent/${parentId}`,
  },

  // Classes
  CLASSES: {
    BASE: '/api/Classes',
  },

  // Class Student
  CLASS_STUDENT: {
    BASE: '/api/ClassStudent',
    BY_CLASS: (classId: number | string) => `/api/ClassStudent/class/${classId}`,
    BY_STUDENT: (studentId: number | string) => `/api/ClassStudent/student/${studentId}`,
    ENROLL: (classId: number | string) => `/api/ClassStudent/class/${classId}/enroll`,
    ENROLL_MULTIPLE: (classId: number | string) => `/api/ClassStudent/class/${classId}/enroll-multiple`,
    REMOVE: (classId: number | string, studentId: number | string) => `/api/ClassStudent/class/${classId}/student/${studentId}`,
    TRANSFER: (studentId: number | string) => `/api/ClassStudent/student/${studentId}/transfer`,
  },

  // Class Teacher
  CLASS_TEACHER: {
    BASE: '/api/ClassTeacher',
    BY_CLASS: (classId: number | string) => `/api/ClassTeacher/class/${classId}`,
    BY_TEACHER: (teacherId: number | string) => `/api/ClassTeacher/teacher/${teacherId}`,
    ASSIGN: (classId: number | string) => `/api/ClassTeacher/class/${classId}/assign`,
    UPDATE_ROLE: (classId: number | string, teacherId: number | string) => `/api/ClassTeacher/class/${classId}/teacher/${teacherId}/role`,
    REMOVE: (classId: number | string, teacherId: number | string) => `/api/ClassTeacher/class/${classId}/teacher/${teacherId}`,
  },

  // Menus
  MENUS: {
    BASE: '/api/menus',
    BY_CLASS: (classId: number | string) => `/api/menus/by-class/${classId}`,
  },

  // Semesters
  SEMESTER: {
    BASE: '/api/Semesters',
    BY_ID: (id: number | string) => `/api/Semesters/${id}`,
  },

  // Payment
  PAYMENT: {
    BASE: '/api/Payment',
    BY_ID: (id: number | string) => `/api/Payment/${id}`,
    BY_INVOICE: (invoiceId: number | string) => `/api/Payment/invoice/${invoiceId}`,
    FILTER: '/api/Payment/filter',
    REVENUE_SUMMARY: '/api/Payment/revenue-summary',
  },

  // Teacher
  TEACHER: {
    BASE: '/api/Teacher',
    BY_ID: (id: number | string) => `/api/Teacher/${id}`,
    SEARCH: '/api/Teacher/search',
    ACTIVE: '/api/Teacher/active',
  },

  // Campuses
  CAMPUSES: {
    BASE: '/api/Campuses',
    BY_ID: (id: number | string) => `/api/Campuses/${id}`,
  },

  // Invoice
  INVOICE: {
    BASE: '/api/Invoice',
    BY_ID: (id: number | string) => `/api/Invoice/${id}`,
    BY_STUDENT: (studentId: number | string) => `/api/Invoice/student/${studentId}`,
    SUMMARY_BY_STUDENT: (studentId: number | string) => `/api/Invoice/student/${studentId}/summary`,
    OVERDUE: '/api/Invoice/overdue',
    FILTER: '/api/Invoice/filter',
    FROM_TEMPLATE: '/api/Invoice/from-template',
    MARK_OVERDUE: '/api/Invoice/mark-overdue',
  },

  // Parent Registration
  PARENT_REGISTRATION: {
    BASE: '/api/ParentRegistration',
    SUBMIT: '/api/ParentRegistration/submit',
    PENDING: '/api/ParentRegistration/pending',
    BY_ID: (id: number | string) => `/api/ParentRegistration/${id}`,
    APPROVE: (id: number | string) => `/api/ParentRegistration/${id}/approve`,
    REJECT: (id: number | string) => `/api/ParentRegistration/${id}/reject`,
  },
  // Health Checks
  HEALTH_CHECKS: {
    BASE: '/api/HealthChecks',
    BY_ID: (id: number | string) => `/api/HealthChecks/${id}`,
    BY_STUDENT: (studentId: number | string) => `/api/HealthChecks/student/${studentId}`,
  },

  // Medical Incidents
  MEDICAL_INCIDENTS: {
    BASE: '/api/MedicalIncidents',
    BY_ID: (id: number | string) => `/api/MedicalIncidents/${id}`,
    BY_STUDENT: (studentId: number | string) => `/api/MedicalIncidents/student/${studentId}`,
  }
} as const;
