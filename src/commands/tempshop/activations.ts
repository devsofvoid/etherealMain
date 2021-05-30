import { Message } from 'discord.js'

import Command from '../../structures/Command'
import { genActivationsMsg } from '../../utils/util'

export default class ActivationsCommand extends Command {
  get options() {
    return { name: 'активации' }
  }

  async execute(message: Message) {
    message.channel.send(await genActivationsMsg(message.author))
  }
}
