export interface Employee {
  id: string;
  name: string;
  created_at: string;
}

export interface Submission {
  id: string;
  employee_name: string;
  photo_url: string | null;
  model_url: string | null;
  status: 'pending' | 'processing' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface VerifyResponse {
  success: boolean;
  message?: string;
}

export interface SubmissionResponse {
  success: boolean;
  submission?: Submission;
  message?: string;
}
