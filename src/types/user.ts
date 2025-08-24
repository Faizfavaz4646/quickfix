export interface Profile {
  id?:string;
  profilePic?: string;
  state?: string;
  district?: string;
  city?: string;
  schedule?: string;
  phone?: string;
  gender?: string;
  zip?: string;
  profession?: string;
  previousWorkImages?: string[];
  termsAccepted?: boolean;
  name?:string;
  role?: "client" | "worker"; 
 

}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "client" | "worker";
  token?: string;
  profile?: Profile;
}

// ✅ Cleaned up generic reusable form field
export interface Field<T> {
  label: string;
  name: keyof T;
  type: string;
  options?: { value: string; label: string }[];
  value?: T[keyof T];
  maxLength?: number;
  placeholder?: string;
}
