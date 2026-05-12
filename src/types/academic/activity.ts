export interface ApiClassActivity {
  activityId: number;
  classId: number;
  title: string;
  content: string;
  activityDate: string;
  activityType?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  managedBy?: number;
  photos?: ApiActivityPhoto[];
}

export interface ApiActivityPhoto {
  photoId: number;
  activityId: number;
  photoUrl: string;
  description: string;
  uploadDate: string;
}

export interface CreateActivityDTO {
  classId: number;
  title: string;
  content: string;
  activityDate: string;
  activityType?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  managedBy?: number;
}
