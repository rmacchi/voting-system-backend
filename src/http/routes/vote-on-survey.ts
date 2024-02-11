import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { FastifyInstance } from "fastify"
import { randomUUID } from "node:crypto"
import { redis } from "../../lib/redis"
import { voting } from "../../utils/voting-pub-sub"

export async function voteOnSurvey(app: FastifyInstance) {
  app.post('/surveys/:surveyId/votes', async (request, reply) => {
    const voteOnSurveyBody = z.object({
      surveyOptionId: z.string().uuid()
    })

    const voteOnSurveyParams = z.object({
      surveyId: z.string().uuid(),
    })

    const { surveyId } = voteOnSurveyParams.parse(request.params)
    const { surveyOptionId } = voteOnSurveyBody.parse(request.body)

    let { sessionId } = request.cookies

    if (sessionId) {
      const userPreviousVoteOnSurvey = await prisma.vote.findUnique({
        where: {
          sessionId_surveyId: {
            sessionId,
            surveyId,
          },
        }
      })

      if (userPreviousVoteOnSurvey && userPreviousVoteOnSurvey.surveyOptionId !== surveyOptionId) {
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnSurvey.id,
          }
        })

        const votes = await redis.zincrby(surveyId, -1, userPreviousVoteOnSurvey.surveyOptionId)

        voting.publish(surveyId, {
          surveyOptionId: userPreviousVoteOnSurvey.surveyOptionId,
          votes: Number(votes),
        })

      } else if (userPreviousVoteOnSurvey) {
        return reply.status(400).send({ message: 'You already voted on this survey.' })
      }
    }

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        signed: true,
        httpOnly: true,
      })
    }

    await prisma.vote.create({
      data: {
        sessionId,
        surveyId,
        surveyOptionId,
      }
    })

    const votes = await redis.zincrby(surveyId, 1, surveyOptionId)

    voting.publish(surveyId, {
      surveyOptionId,
      votes: Number(votes),
    })

    return reply.status(201).send()
  })
}