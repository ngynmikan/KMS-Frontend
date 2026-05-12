export interface ApiTimetable {
  id: number;
  classId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: number;
  room: string;
}

export interface CreateTimetableRequest {
  classId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: number;
  room: string;
}

export interface UpdateTimetableRequest {
  id: number;
  classId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: number;
  room: string;
}
