import { Event } from 'discore.js'
import { Guild, GuildMember } from 'discord.js'

import * as Util from '../utils/util'
import User from '../structures/db/User'
import Pair from '../structures/db/pair/Pair'
import TempRoom from '../structures/db/tempRoom/TempRoom'
import TempRoleModel from '../models/raw/TempRole'
import client, { config } from '../main'

export class Join extends Event {
  get options() {
    return { name: 'guildMemberAdd' }
  }

  run(member: GuildMember) {
    if (!Util.verifyMainGuild(member.guild.id)) return

    User.find(member.id).then(userDoc => {
      if (!userDoc) return

      if (
        userDoc.leaveTick &&
        userDoc.leaveTick + config.meta.leaveClearInterval < Date.now()
      ) {
        userDoc.delete()
      }
    })
  }
}

export class Leave extends Event {
  get options() {
    return { name: 'guildMemberRemove' }
  }

  run(member: GuildMember) {
    if (!Util.verifyMainGuild(member.guild.id)) return

    const guild = Util.getMainGuild() as Guild

    User.get(member.id).then(userDoc => {
      userDoc.update({
        roles: member.roles.cache
          .keyArray()
          .filter(id => id !== member.guild.id),
        leaveTick: Date.now(),
        gold: 0,
        hiddenGender: null,
        hiddenGenderEndDate: null,
        lastChest: 0,
        lastTimelyTick: null,
        status: null,
        itemChests: 0,
        goldChests: 0,
        inventory: {}
      })
    })

    Pair.find(member.id).then(pair => pair && pair.delete())
    TempRoom.get(member.id).then(tempRooms => tempRooms.map(r => r.delete()))
    TempRoleModel.find({ userID: member.id })
      .lean()
      .exec()
      .then(roles => {
        roles.map(r => {
          Util.discordRetryHandler(`guilds/${guild.id}/roles/${r.roleID}`, {
            method: 'DELETE',
            headers: { Authorization: `Bot ${client.token}` }
          })
        })
        TempRoleModel.deleteMany({ userID: member.id })
      })
  }
}
