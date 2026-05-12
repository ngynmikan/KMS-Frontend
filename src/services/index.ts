import authService from './auth/auth.service';
import userService from './users/user.service';
import roleService from './users/role.service';
import teacherService from './users/teacher.service';
import studentService from './students/student.service';
import studentParentService from './students/student-parent.service';
import parentRegistrationService from './students/parent-registration.service';
import classService from './classes/class.service';
import classStudentService from './classes/class-student.service';
import classTeacherService from './classes/class-teacher.service';
import menuService from './academic/menu.service';
import semesterService from './academic/semester.service';
import campusService from './academic/campus.service';
import paymentService from './billing/payment.service';
import invoiceService from './billing/invoice.service';
import { healthCheckService } from './health/health-check.service';
import { medicalIncidentService } from './health/medical-incident.service';
import classActivityService from './academic/class-activity.service';
import timetableService from './academic/timetable.service';
import evaluationService from './academic/evaluation.service';

export { API_ENDPOINTS } from './api.constants';

export * from './health/health-check.service';
export * from './health/medical-incident.service';

export { 
  authService, 
  userService, 
  roleService, 
  studentService, 
  studentParentService, 
  classService, 
  classStudentService, 
  classTeacherService, 
  menuService,
  semesterService,
  paymentService,
  teacherService,
  campusService,
  invoiceService,
  parentRegistrationService,
  healthCheckService,
  medicalIncidentService,
  classActivityService,
  timetableService,
  evaluationService
};

export default {
  auth: authService,
  user: userService,
  role: roleService,
  student: studentService,
  studentParent: studentParentService,
  class: classService,
  classStudent: classStudentService,
  classTeacher: classTeacherService,
  menu: menuService,
  semester: semesterService,
  payment: paymentService,
  teacher: teacherService,
  campus: campusService,
  invoice: invoiceService,
  parentRegistration: parentRegistrationService,
  healthCheck: healthCheckService,
  medicalIncident: medicalIncidentService,
  classActivity: classActivityService,
  timetable: timetableService,
  evaluation: evaluationService
};
