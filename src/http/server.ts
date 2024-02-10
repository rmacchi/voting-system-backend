import fastify from 'fastify'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const app = fastify()

const prisma = new PrismaClient()

app.post('/votings', async (request, reply) => {
  const createVotingBody = z.object({
    title: z.string()
  })

  const { title } = createVotingBody.parse(request.body)

  const voting = await prisma.voting.create({
    data: {
      title,
    }
  })

  return reply.status(201).send({ votingId: voting.id })
})

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server running! ')
})