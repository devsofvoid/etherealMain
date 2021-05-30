import { VoiceState } from 'discord.js'
import User from '../structures/db/User'

import VoiceActivity from '../structures/db/VoiceActivity'
import * as Util from '../utils/util'

const voiceMembers = new Map<string, number>()

export default class VoiceActivityManager {
  static onJoin(state: VoiceState) {
    const { member, guild } = state

    if (!member) return
    if (!Util.verifyGuild(guild.id)) return

    if (member.user.bot) return

    VoiceActivity.create({ userID: member.id })
  }

  static async onLeave(state: VoiceState) {
    const { member, guild } = state

    if (!member) return
    if (!Util.verifyGuild(guild.id)) return

    if (member.user.bot) return

    const lastVAs = await VoiceActivity.getLast(member.id, 2)
    const lastVA = lastVAs[0]
    if (!lastVA) return
    if (typeof lastVA.rawLeaveTime === 'number') return

    if (Date.now() - lastVA.rawJoinTime < 1e3) {
      return lastVA.delete().then(() => {})
    }

    lastVA.update({ leaveTime: Date.now() })

    const userDoc = await User.get(member.id)
    const newData = await Util.calculateActivityRewards(
      member,
      userDoc,
      lastVAs as [any, any]
    )
    userDoc.update(newData)
  }

  static onLoveroomJoin(state: VoiceState) {
    const { member, guild } = state

    if (!member) return
    if (!Util.verifyGuild(guild.id)) return

    if (member.user.bot) return

    voiceMembers.set(member.id, Date.now())
  }

  static onLoveroomLeave(state: VoiceState) {
    const { member, guild } = state

    if (!member) return
    if (!Util.verifyGuild(guild.id)) return

    if (member.user.bot) return

    const joinDate = voiceMembers.get(member.id)
    if (typeof joinDate === 'number') {
      User.get(member.id).then(userDoc => {
        voiceMembers.delete(member.id)
        const diff = Date.now() - joinDate
        userDoc.update({ loveroomTime: userDoc.loveroomTime + diff })

        if (userDoc.loveroomTime > 2.16e7) {
          if (!member.roles.cache.has('807911472113385492')) {
            member.roles.add('807911472113385492').catch(() => {})
          }
        }
      })
    }
  }
}
