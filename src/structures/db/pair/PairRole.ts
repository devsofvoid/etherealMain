import { Guild } from 'discord.js'

import Pair from './Pair'
import client from '../../../main'
import { discordRetryHandler, getMainGuild } from '../../../utils/util'

class PairRole {
  constructor(public pair: Pair) {}

  get exists() {
    return this.id != null
  }

  get id() {
    return this.pair.roleID
  }

  get count() {
    return this.pair.roleCount
  }

  get endTimestamp() {
    return this.pair.roleEndTick
  }

  async delete() {
    if (!this.exists) return

    const guild = getMainGuild() as Guild

    this.pair.update({ roleID: null, roleEndTick: null })
    await discordRetryHandler(`guilds/${guild.id}/roles/${this.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bot ${client.token}` }
    })
  }
}

export default PairRole
