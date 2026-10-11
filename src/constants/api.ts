// ⚠️ REPLACE WITH YOUR ACTUAL IP ADDRESS
// Use "http://10.0.2.2/tracktogether" for Android Emulator
// Use "http://YOUR_LOCAL_IP/tracktogether" for physical device
export const API_BASE_URL = "http://192.168.1.2/tracktogether";

export interface User {
  id: number;
  username: string;
  full_name: string;
  role_id: number;
  role_name: string;
  status: string;
  created_at: string;
}

export interface Project {
  project_id: number;
  project_name: string;
  description: string | null;
  location: string;
  budget: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_by: number;
  created_at: string;
}

export interface LogEntry {
  log_id: number;
  user_id: number | null;
  full_name: string | null;
  username: string | null;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  user?: User;
  users?: User[];
  projects?: Project[];
  proposals?: Proposal[];
  logs?: LogEntry[];
}

export async function apiCall<T = ApiResponse>(
  endpoint: string,
  body: any = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await response.json();
}

export interface Proposal {
  proposal_id: number;
  project_name: string;
  description: string | null;
  location: string;
  budget: number;
  proposed_by: number;
  full_name: string;
  status: string;
  admin_remarks: string | null;
  created_at: string;
}
