const registerSchema = {
	body: {
		type: 'object',
		required: ['emailOrPhone', 'password'],
		properties: {
			name: { type: 'string' },
			emailOrPhone: { type: 'string' },
			password: { type: 'string', minLength: 6 },
			age: { type: 'number' },
			weight: { type: 'number' },
			height: { type: 'number' },
			waist: { type: 'number' },
			chest: { type: 'number' },
			hips: { type: 'number' },
			arm: { type: 'number' },
			leg: { type: 'number' },
			goal: { type: 'string' },
			restrictions: { type: 'string' },
			experience: { type: 'string' },
			diet: { type: 'string' },
			photoFront: { type: 'string' },
			photoSide: { type: 'string' },
			photoBack: { type: 'string' },
		},
	},

	response: {
		201: {
			type: 'object',
			properties: {
				token: {
					type: 'object',
					properties: {
						accessToken: { type: 'string' },
						refreshToken: { type: 'string' },
					},
				},
				user: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						name: { type: 'string' },
						email: { type: ['string', 'null'] },
						phone: { type: ['string', 'null'] },
					},
				},
			},
		},
	},
}

export default registerSchema
