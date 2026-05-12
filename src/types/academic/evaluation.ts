export interface ApiEvaluationCriteria {
  criteriaId: number;
  category: string;
  categoryLabel: string;
  name: string;
  description?: string;
  ratingType: 'scale' | 'label';
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface ApiEvaluationDetail {
  detailId: number;
  criteriaId: number;
  criteriaName: string;
  category: string;
  categoryLabel: string;
  ratingType: string;
  score?: number;
  ratingLabel?: string;
  comment?: string;
}

export interface ApiEvaluationCategoryGroup {
  category: string;
  categoryLabel: string;
  details: ApiEvaluationDetail[];
  averageScore?: number;
}

export interface ApiEvaluation {
  evaluationId: number;
  studentId: number;
  studentName: string;
  studentPhoto?: string;
  classId: number;
  className: string;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  isGoodStudent?: boolean;
  generalComment?: string;
  evaluatedByName?: string;
  createdAt: string;
  updatedAt: string;
  overallAverageScore?: number;
  categoryGroups: ApiEvaluationCategoryGroup[];
}

export interface CreateEvaluationRequest {
  classId: number;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  isGoodStudent?: boolean;
  generalComment?: string;
  details: {
    criteriaId: number;
    score?: number;
    ratingLabel?: string;
    comment?: string;
  }[];
}

export interface UpdateEvaluationRequest {
  isGoodStudent?: boolean;
  generalComment?: string;
  details: {
    criteriaId: number;
    score?: number;
    ratingLabel?: string;
    comment?: string;
  }[];
}

export interface StudentEvaluationSummaryItem {
  studentId: number;
  fullName: string;
  photo?: string;
  evaluationId?: number;
  isGoodStudent?: boolean;
  averageScore?: number;
  isEvaluated: boolean;
}

export interface ClassEvaluationSummary {
  classId: number;
  className: string;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  totalStudents: number;
  evaluatedCount: number;
  goodStudentCount: number;
  notEvaluatedCount: number;
  students: StudentEvaluationSummaryItem[];
}
