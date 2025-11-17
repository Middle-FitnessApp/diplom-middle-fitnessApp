import app from './app.js'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log('Сервер работает на порту', PORT)
})
