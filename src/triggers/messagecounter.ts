import { Trigger } from 'discore.js'
import { Message } from 'discord.js'

import User from '../structures/db/User'
import * as Util from '../utils/util'
import { awardXP } from '../utils/util'

export default class MessageCounter extends Trigger {
  run(message: Message) {
    if (!message.guild) return
    if (!Util.verifyMainGuild(message.guild.id)) return
    if (message.author.bot) return

    User.get(message.author.id).then(doc => {
      const newData = {
        messageCount: doc.messageCount + 1,
        xp: doc.xp,
        lvl: doc.lvl,
        lastMsgXpTick: doc.lastMsgXpTick
      }
      if ((doc.lastMsgXpTick || 0) + 3e4 < Date.now()) {
        newData.lastMsgXpTick = Date.now()
        awardXP(newData, Math.floor(Math.random() * (3 - 1 + 1)) + 1)
      }
      doc.update(newData)
    })
  }
}
