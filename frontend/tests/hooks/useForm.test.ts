import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Form } from 'antd'

describe('useForm', () => {
	it('должен создавать форму', () => {
		const { result } = renderHook(() => Form.useForm())

		expect(result.current).toBeDefined()
		expect(result.current[0]).toBeDefined()
	})
})
