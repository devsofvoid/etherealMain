import { Discord, Event } from 'discore.js'
import { Presence } from 'discord.js'

import * as Util from '../utils/util'
import { config } from '../main'
import User from '../structures/db/User'

export class GameRole extends Event {
  get options() {
    return { name: 'presenceUpdate' }
  }

  run(_: Presence, presence: Presence) {
    if (!presence) return

    const { guild, member } = presence
    if (!guild) return
    if (!member) return
    if (!Util.verifyMainGuild(guild.id)) return

    if (member.roles.cache.has(config.ids.roles.gender.null)) return

    User.get(presence.userID).then(userDoc => {
      if (!userDoc.gameroles) return
      if (member.roles.cache.has(config.ids.roles.gender.null)) return
      const activity = presence.activities.find(a => {
        return a.type === 'PLAYING'
      })
      if (!activity) return

      const { games } = config.ids.roles
      const gameName = activity.name as keyof typeof games
      const roleID = games[gameName]
      if (!roleID) return
      const bool = verifyRolesCount(games, member)
      if (!bool) return
      member.roles.add(roleID).catch(() => {})
    })
  }
}

function verifyRolesCount(games: {}, member: Discord.GuildMember): Boolean {
  let gameCount = 0
  for (var i in games) {
    if (gameCount == 2) return false
    else if (member.roles.cache.has(i)) gameCount++
  }
  return true
}
