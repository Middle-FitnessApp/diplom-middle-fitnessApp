import { Routes, Route, Navigate } from "react-router-dom";
import { Login, Registration } from "../pages/auth";
import {
  AddProgress,
  AllReports,
  Main,
  Nutrition,
  PersonalAccount,
  Progress,
  Report,
  Trainer,
} from "../pages/client";
import {
  AddNutritionTrainer,
  Admin,
  Chat,
  ClientProfile,
  CreateNutritionTrainer,
  NutritionPlanTrainer,
  NutritionTrainer,
} from "../pages/trainer";

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Registration />} />

      {/* Client routes */}
      <Route path="/me" element={<PersonalAccount />} />
      <Route path="/me/nutrition" element={<Nutrition />} />
      <Route path="/me/progress" element={<Progress />} />
      <Route path="/me/progress/new-report" element={<AddProgress />} />
      <Route path="/me/progress/reports" element={<AllReports />} />
      <Route path="/me/progress/reports/:id" element={<Report />} />
      <Route path="/trainer" element={<Trainer />} />
      <Route path="/" element={<Main />} />

      {/* Trainer routes */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/chat/:id" element={<Chat />} />
      <Route path="/admin/client/:id" element={<ClientProfile />} />
      <Route path="/admin/nutrition" element={<NutritionTrainer />} />
      <Route
        path="/admin/nutrition/:category/:subcategory"
        element={<NutritionPlanTrainer />}
      />
      <Route
        path="/admin/nutrition/:category/:subcategory/create"
        element={<CreateNutritionTrainer />}
      />
      <Route
        path="/admin/client/:id/add-nutrition"
        element={<AddNutritionTrainer />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};