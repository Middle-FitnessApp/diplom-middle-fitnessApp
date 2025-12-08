import { Routes, Route, Navigate } from 'react-router-dom'
import { Login, Registration } from '../pages/auth'
import {
	AddProgress,
	AllReports,
	Main,
	Nutrition,
	PersonalAccount,
	Progress,
	Report,
	Trainer,
} from '../pages/client'
import {
	AddNutritionTrainer,
	Admin,
	ClientProfile,
	CreateNutritionTrainer,
	NutritionPlanTrainer,
	NutritionTrainer,
} from '../pages/trainer'
import { ChatWithClient } from '../pages/trainer/'
import { ProtectedRoute } from './ProtectedRoute'

export const AppRouter = () => {
	return (
		<Routes>
			{/* Public routes */}
			<Route path='/login' element={<Login />} />
			<Route path='/signup' element={<Registration />} />

			{/* Главная страница (доступна всем, но показывает разный контент) */}
			<Route path='/' element={<Main />} />

			{/* Client routes - защищённые, требуют авторизации */}
			<Route
				path='/me'
				element={
					<ProtectedRoute requiredRole='CLIENT'>
						<PersonalAccount />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/me/nutrition'
				element={
					<ProtectedRoute requiredRole='CLIENT'>
						<Nutrition />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/me/progress'
				element={
					<ProtectedRoute requiredRole='CLIENT'>
						<Progress />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/me/progress/new-report'
				element={
					<ProtectedRoute requiredRole='CLIENT'>
						<AddProgress />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/me/progress/reports'
				element={
					<ProtectedRoute requiredRole='CLIENT'>
						<AllReports />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/me/progress/reports/:id'
				element={
					<ProtectedRoute requiredRole='CLIENT'>
						<Report />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/trainer'
				element={
					<ProtectedRoute requiredRole='CLIENT'>
						<Trainer />
					</ProtectedRoute>
				}
			/>

			{/* Trainer routes - защищённые, требуют роль TRAINER */}
			<Route
				path='/admin'
				element={
					<ProtectedRoute requiredRole='TRAINER'>
						<Admin />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/admin/chat/:id'
				element={
					<ProtectedRoute requiredRole='TRAINER'>
						<ChatWithClient />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/admin/client/:id'
				element={
					<ProtectedRoute requiredRole='TRAINER'>
						<ClientProfile />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/admin/nutrition'
				element={
					<ProtectedRoute requiredRole='TRAINER'>
						<NutritionTrainer />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/admin/nutrition/:category/:subcategory'
				element={
					<ProtectedRoute requiredRole='TRAINER'>
						<NutritionPlanTrainer />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/admin/nutrition/:category/create'
				element={
					<ProtectedRoute requiredRole='TRAINER'>
						<CreateNutritionTrainer />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/admin/client/:id/add-nutrition'
				element={
					<ProtectedRoute requiredRole='TRAINER'>
						<AddNutritionTrainer />
					</ProtectedRoute>
				}
			/>

			{/* Fallback */}
			<Route path='*' element={<Navigate to='/' replace />} />
		</Routes>
	)
}
