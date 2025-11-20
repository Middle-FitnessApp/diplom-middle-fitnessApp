const loginSchema = {
	body: {
		type: 'object',
		required: ['emailOrPhone', 'password'],
		properties: {
			emailOrPhone: { type: 'string' },
			password: { type: 'string' },
		},
	},

	response: {
		200: {
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

export default loginSchema
