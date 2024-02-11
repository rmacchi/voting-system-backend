type Message = { surveyOptionId: string, votes: number }
type Subscriber = (message: Message) => void

class VotingPubSub {
  private channels: Record<string, Subscriber[]> = {}

  subscribe(surveyId: string, subscriber: Subscriber) {
    if (!this.channels[surveyId]) {
      this.channels[surveyId] = []
    }

    this.channels[surveyId].push(subscriber)
  }

  publish(surveyId: string, message: Message) {
    if (!this.channels[surveyId]) {
      return;
    }

    for (const subscriber of this.channels[surveyId]) {
      subscriber(message)
    }
  }
}

export const voting = new VotingPubSub()