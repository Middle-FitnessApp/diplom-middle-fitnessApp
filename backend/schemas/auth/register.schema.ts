const registerSchema = {
  body: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
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
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
      },
    },
  },
}

export default registerSchema
