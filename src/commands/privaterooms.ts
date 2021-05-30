import {
  Guild,
  Message,
  Permissions,
  VoiceChannel,
  PermissionOverwrites,
  Collection
} from 'discord.js'

import * as Util from '../utils/util'
import Command, { CommandParams } from '../structures/Command'
import PrivateRoomManager from '../managers/PrivateRoomManager'
import { config } from '../main'

export class PKickCommand extends Command {
  get options() {
    return { name: 'pkick' }
  }
  get cOptions() {
    return { guildOnly: true }
  }

  async execute(message: Message, args: string[], { member }: CommandParams) {
    const channel = member.voice.channel as VoiceChannel

    if (!Util.validatePrivateroom(member, channel)) return
    const guild = message.guild as Guild

    const mentionString = args.join(' ')
    if (mentionString.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите участника'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const targetMember = await Util.resolveMember(mentionString, guild)
    if (!targetMember) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не найден'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (targetMember.id === member.id) return

    const sameVoice = targetMember.voice.channelID === member.voice.channelID
    if (!sameVoice) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не находится в вашем голосовом канале'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    targetMember.voice.setChannel(null).catch(() => {})
  }
}

export class PBanCommand extends Command {
  get options() {
    return { name: 'pban' }
  }
  get cOptions() {
    return { guildOnly: true }
  }

  async execute(message: Message, args: string[], { member }: CommandParams) {
    const channel = member.voice.channel as VoiceChannel

    if (!Util.validatePrivateroom(member, channel)) return
    const guild = message.guild as Guild

    const mentionString = args.join(' ')
    if (mentionString.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите участника'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    const targetMember = await Util.resolveMember(mentionString, guild)
    if (!targetMember) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не найден'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (targetMember.id === member.id) return

    const perms = channel.permissionOverwrites.get(member.id)
    const flags = Permissions.FLAGS.CONNECT

    const permsBlocked = perms && perms.deny.has(flags)
    const sameVoice = targetMember.voice.channelID === member.voice.channelID

    if (permsBlocked && !sameVoice) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник заблокирован в вашем голосовом канале'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    if (sameVoice) targetMember.voice.setChannel(null).catch(() => {})
    if (!permsBlocked) {
      channel
        .updateOverwrite(targetMember.id, { CONNECT: false })
        .catch(() => {})
    }
  }
}

export class PUnbanCommand extends Command {
  get options() {
    return { name: 'punban' }
  }
  get cOptions() {
    return { guildOnly: true }
  }

  async execute(message: Message, args: string[], { member }: CommandParams) {
    const channel = member.voice.channel as VoiceChannel

    if (!Util.validatePrivateroom(member, channel)) return
    const guild = message.guild as Guild

    const mentionString = args.join(' ')
    if (mentionString.length < 1) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите участника'
          }
        })
        .catch(() => {})
      return
    }

    const targetMember = await Util.resolveMember(mentionString, guild)
    if (!targetMember) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не найден'
          }
        })
        .catch(() => {})
      return
    }

    if (targetMember.id === member.id) return

    const perms = channel.permissionOverwrites.get(
      targetMember.id
    ) as PermissionOverwrites
    const flags = Permissions.FLAGS.CONNECT

    const permsBlocked = perms && perms.deny.has(flags)
    if (!permsBlocked) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не заблокирован в вашем голосовом канале'
          }
        })
        .catch(() => {})
      return
    }

    if (perms.allow.bitfield === 0 && (perms.deny.bitfield ^ flags) === 0) {
      channel.edit({
        permissionOverwrites: channel.permissionOverwrites
          .array()
          .filter(p => p.id !== targetMember.id)
      })
    } else {
      channel
        .updateOverwrite(targetMember.id, { CONNECT: null })
        .catch(() => {})
    }
  }
}
const privateNameChangeTimeout = new Collection<String, number>()
export class PNameCommand extends Command {
  get options() {
    return { name: 'pname' }
  }
  get cOptions() {
    return { guildOnly: true }
  }
  async execute(message: Message, args: string[], { member }: CommandParams) {
    const channel = member.voice.channel as VoiceChannel
    if (!Util.validatePrivateroom(member, channel)) return
    const name = args.join(' ')
    if (!name)
      return message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Вы не указали название'
          }
        })
        .catch(() => {})
    const now = Date.now()
    if (privateNameChangeTimeout.has(member.id)) {
      const difference =
        privateNameChangeTimeout.get(member.id)! +
        config.meta.privateNameInterval -
        now
      if (difference > 0) {
        message.channel
          .send({
            embed: {
              color: 0x2f3136,
              title: '**Ещё не время, потерпи немного!**',
              description: `Приходи через **${
                Util.parseFilteredFullTimeArray(difference)[0]
              }**`
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }
    }
    privateNameChangeTimeout.set(member.id, now)
    channel.edit({ name: name }).then(() => {
      return message.reply(
        ` вы успешно изменили название канала на \`${name}\``
      )
    })
  }
}

const privateLimitChangeTimeout = new Collection<String, number>()
export class PLimitCommand extends Command {
  get options() {
    return { name: 'plimit' }
  }
  get cOptions() {
    return { guildOnly: true }
  }
  async execute(
    message: Message,
    args: string[],
    { member }: CommandParams
  ): Promise<any> {
    const channel = member.voice.channel as VoiceChannel
    if (!Util.validatePrivateroom(member, channel)) return

    let limit = parseInt((args[0] || '').replace(/\D/g, ''))
    if (!Number.isInteger(limit)) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Укажите корректное количество слотов'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }

    limit = Math.min(6, Math.max(1, limit))

    if (channel.userLimit === limit) {
      return message.reply(
        ` вы успешно изменили количество слотов в канале на \`${limit}\``
      )
    }

    const now = Date.now()
    if (privateLimitChangeTimeout.has(member.id)) {
      const difference =
        privateLimitChangeTimeout.get(member.id)! +
        config.meta.privateLimitInterval -
        now
      if (difference > 0) {
        message.channel
          .send({
            embed: {
              color: 0x2f3136,
              title: '**Ещё не время, потерпи немного!**',
              description: `Приходи через **${
                Util.parseFilteredFullTimeArray(difference)[0]
              }**`
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }
    }
    privateLimitChangeTimeout.set(member.id, now)
    channel.edit({ userLimit: limit }).then(() => {
      return message.reply(
        ` вы успешно изменили количество слотов в канале на \`${limit}\``
      )
    })
  }
}

const privateOwnerTransferTimeout = new Collection<String, number>()
export class POwnerTransferCommand extends Command {
  get options() {
    return { name: 'ptowner' }
  }
  get cOptions() {
    return { guildOnly: true }
  }
  async execute(message: Message, args: string[], { member }: CommandParams) {
    const channel = member.voice.channel as VoiceChannel
    if (!Util.validatePrivateroom(member, channel)) return
    const targetMember = await Util.resolveMember(args.join(' '))
    if (!targetMember) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: 'Участник не найден'
          }
        })
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
      return
    }
    const now = Date.now()
    if (privateOwnerTransferTimeout.has(member.id)) {
      const difference =
        privateOwnerTransferTimeout.get(member.id)! +
        config.meta.privateOwnerTransferInterval -
        now
      if (difference > 0) {
        message.channel
          .send({
            embed: {
              color: 0x2f3136,
              title: '**Ещё не время, потерпи немного!**',
              description: `Приходи через **${
                Util.parseFilteredFullTimeArray(difference)[0]
              }**`
            }
          })
          .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
          .catch(() => {})
        return
      }
    }
    privateOwnerTransferTimeout.set(member.id, now)
    PrivateRoomManager.transferPerms(channel, targetMember)
    return message.channel.send({
      embed: {
        description: `Вы успешно передали права на канал`
      }
    })
  }
}
