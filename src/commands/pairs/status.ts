import { Message } from 'discord.js'

import Command from '../../structures/Command'
import Pair from '../../structures/db/pair/Pair'

export default class PairStatusCommand extends Command {
  get options() {
    return { name: 'lstatus', aliases: ['пара статус'] }
  }

  async execute(message: Message, args: string[]) {
    const pair = await Pair.find(message.author.id)
    if (!pair) return

    const description = args.join(' ')
    if (description.length > 40) return

    pair.update({ description: description || null })
  }
}
