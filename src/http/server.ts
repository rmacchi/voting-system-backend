import fastify from 'fastify'
import { z } from 'zod'
import { createSurvey } from './routes/create-survey'
import { getSurvey } from './routes/get-survey'
import { voteOnSurvey } from './routes/vote-on-survey'
import cookie from '@fastify/cookie'

const app = fastify()

app.register(cookie, {
  secret: "votes-project-backend",
  hook: 'onRequest',
})

app.register(createSurvey)
app.register(getSurvey)
app.register(voteOnSurvey)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server running! ')
})