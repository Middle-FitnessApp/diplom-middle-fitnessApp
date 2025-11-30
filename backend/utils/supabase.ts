import { createClient } from '@supabase/supabase-js'

// Проверка наличия необходимых переменных окружения
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
	console.warn(
		'⚠️  Supabase учетные данные не найдены. Функции хранилища будут отключены.',
	)
}

// Создание Supabase клиента с service_role ключом для серверных операций
export const supabase =
	supabaseUrl && supabaseServiceKey
		? createClient(supabaseUrl, supabaseServiceKey, {
				auth: {
					autoRefreshToken: false,
					persistSession: false,
				},
		  })
		: null

// Названия buckets из переменных окружения
export const PHOTOS_BUCKET = process.env.SUPABASE_PHOTOS_BUCKET || 'fitness-photos'
export const DEFAULTS_BUCKET = process.env.SUPABASE_DEFAULTS_BUCKET || 'default'
