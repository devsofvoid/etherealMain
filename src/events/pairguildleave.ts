import { Event } from 'discore.js'
import { GuildMember } from 'discord.js'

import * as Util from '../utils/util'
import Pair from '../structures/db/pair/Pair'

export default class DeletePair extends Event {
  get options() {
    return { name: 'guildMemberRemove' }
  }

  run(member: GuildMember) {
    if (!Util.verifyMainGuild(member.guild.id)) return
    Pair.delete(member.id)
  }
}
