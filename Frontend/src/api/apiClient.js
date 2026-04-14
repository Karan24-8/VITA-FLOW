import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ───────────────────────────────────────────────
export const loginUser  = (data) => API.post("/api/auth/login", data);
export const signUpUser = (data) => API.post("/api/auth/signup", data);

// ─── User (own profile) ─────────────────────────────────
export const getProfile    = ()     => API.get("/api/user/profile");
export const updateProfile = (data) => API.put("/api/user/profile", data);

// ─── Diet (user role only) ──────────────────────────────
export const generateDiet = (data) => API.post("/api/diet/generate", data);

// ─── Exercise (user role only) ──────────────────────────
export const generateWorkout = (data) => API.post("/api/exercise/generate", data);

// ─── Consultants ────────────────────────────────────────
export const getConsultants     = ()             => API.get("/api/consultants");
export const getConsultantUsers = ()             => API.get("/api/consultants/users");
export const updateUserPlan     = (userId, data) => API.put(`/api/consultants/update-plan/${userId}`, data);

// ─── DBA ────────────────────────────────────────────────
export const getAllUsers = () => API.get("/api/user/users");

// ─── AI Chat ✅ NEW ─────────────────────────────────────
// POST /api/chat
// body: { message: string, history: GeminiHistory[] }
// response: { reply: string }
export const sendChatMessage = (data) => API.post("/api/chat", data);
