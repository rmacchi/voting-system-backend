import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"

export async function createSurvey(app: FastifyInstance) {
  app.post('/surveys', async (request, reply) => {
    const createSurveyBody = z.object({
      title: z.string(),
      options: z.array(z.string()),
    })

    const { title, options } = createSurveyBody.parse(request.body)

    const survey = await prisma.survey.create({
      data: {
        title,
        options: {
          createMany: {
            data: options.map(option => {
              return { title: option }
            }),
          }
        },
      }
    })

    return reply.status(201).send({ surveyId: survey.id })
  })
}