import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"

export async function getSurvey(app: FastifyInstance) {
  app.get('/surveys/:surveyId', async (request, reply) => {
    const getSurveyParams = z.object({
      surveyId: z.string().uuid(),
    })

    const { surveyId } = getSurveyParams.parse(request.params)

    const survey = await prisma.survey.findUnique({
      where: {
        id: surveyId,
      },
      include: {
        options: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return reply.send({ survey })
  })
}