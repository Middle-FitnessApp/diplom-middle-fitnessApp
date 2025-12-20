import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Создаём mock server
export const server = setupServer(...handlers)
