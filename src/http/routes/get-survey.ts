import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"
import { redis } from "../../lib/redis"

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

    if (!survey) {
      return reply.status(400).send({ message: 'Survey not fund.' })
    }

    const result = await redis.zrange(surveyId, 0, -1, 'WITHSCORES')

    const votes = result.reduce((obj, line, index) => {
      if (index % 2 === 0) {
        const score = result[index + 1]

        Object.assign(obj, { [line]: Number(score) })
      }

      return obj
    }, {} as Record<string, number>)

    return reply.send({
      survey: {
        id: survey.id,
        title: survey.title,
        options: survey.options.map(option => {
          return {
            id: option.id,
            title: option.title,
            score: (option.id in votes) ? votes[option.id] : 0
          }
        })
      }
    })
  })
}