import { FastifyInstance } from "fastify"
import { voting } from "../../utils/voting-pub-sub"
import { z } from "zod"

export async function surveyResults(app: FastifyInstance) {
  app.get('/surveys/:surveyId/results', { websocket: true }, (connection, request) => {
    const getSurveyParams = z.object({
      surveyId: z.string().uuid(),
    })

    const { surveyId } = getSurveyParams.parse(request.params)

    voting.subscribe(surveyId, (message) => {
      connection.socket.send(JSON.stringify(message))
    })
  })
}