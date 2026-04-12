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
// POST /api/auth/login       → { token, user: { email, id, role } }
export const loginUser  = (data) => API.post("/api/auth/login", data);
// POST /api/auth/signup      → { message, data }
export const signUpUser = (data) => API.post("/api/auth/signup", data);

// ─── User (own profile) ─────────────────────────────────
// GET  /api/user/profile     → { user_id, email, name, phone, age, gender,
//                                height_cm, weight_kg, activity_level,
//                                allergies, meal_preferences, deadline,
//                                aim_kg, role, diet_plan_breakfast,
//                                diet_plan_lunch, diet_plan_dinner, workout_plan }
export const getProfile    = ()     => API.get("/api/user/profile");

// PUT  /api/user/profile     → { message, data }
// accepted body fields: name, phone, age, gender, height_cm, weight_kg,
//                        activity_level, allergies (array), meal_preferences,
//                        deadline, aim_kg
export const updateProfile = (data) => API.put("/api/user/profile", data);

// ─── Diet (user role only) ──────────────────────────────
// POST /api/diet/generate    → { message, plan: { diet_plan_breakfast,
//                                diet_plan_lunch, diet_plan_dinner } }
// body: { meal_preferences, allergies }
export const generateDiet = (data) => API.post("/api/diet/generate", data);

// ─── Exercise (user role only) ──────────────────────────
// POST /api/exercise/generate → { message, plan: { workout_plan } }
// body: { activity_level }
export const generateWorkout = (data) => API.post("/api/exercise/generate", data);

// ─── Consultants ────────────────────────────────────────
// GET  /api/consultants/     → array of consultant objects
export const getConsultants = () => API.get("/api/consultants");

// GET  /api/consultants/users  (consultant + dba)
// → array of user profile objects
export const getConsultantUsers = () => API.get("/api/consultants/users");

// PUT  /api/consultants/update-plan/:userId  (consultant + dba)
// body: { diet_plan_breakfast?, diet_plan_lunch?, diet_plan_dinner?, workout_plan? }
// → { message, data }
export const updateUserPlan = (userId, data) =>
  API.put(`/api/consultants/update-plan/${userId}`, data);

// ─── DBA ────────────────────────────────────────────────
// GET  /api/user/users  (dba only)
// → array of all user profile objects (no plan columns)
export const getAllUsers = () => API.get("/api/user/users");
