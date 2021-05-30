import * as chalk from 'chalk'
import * as moment from 'moment-timezone'
import fetch from 'node-fetch'

import { CronJob } from 'cron'
import { RequestInfo, RequestInit } from 'node-fetch'
import {
  User as DiscordUser,
  Guild,
  Message,
  ClientUser,
  TextChannel,
  GuildMember,
  Permissions,
  VoiceChannel,
  MessageAttachment
} from 'discord.js'
import { MongooseFilterQuery } from 'mongoose'

import * as logger from '../utils/logger'
import UserModel, { UserDoc } from '../models/raw/User'
import client from '../main'
import emojiRegex from './emojiRegex'
import CanvasUtil from './canvas/canvas'
import Collection from '../structures/Collection'
import User from '../structures/db/User'
import VoiceActivityModel from '../models/raw/VoiceActivity'
import VoiceActivity from '../structures/db/VoiceActivity'
import PairModel from '../models/raw/Pair'
import Pair from '../structures/db/pair/Pair'
import TempRoomModel from '../models/raw/TempRoom'
import TempRoom from '../structures/db/tempRoom/TempRoom'
import TempRoleModel from '../models/raw/TempRole'
import GiveawayModel from '../models/raw/Giveaway'
import Timer from './Timer'

import { crystalGoods, goods } from '../goods'
import { config } from '../main'
import { privaterooms } from '../main'
import { ParsedFullTime, ParsedTime } from './types'
import { PrivateRoom } from './db'

export const runTick = Date.now()
export const eventStates = new Collection<string, { enabled: boolean }>()

export function getMainGuild(): Guild | undefined {
  return client.guilds.cache.get(config.ids.guilds.main)
}

export function parseTime(time: number): ParsedTime {
  const parsed: ParsedTime = {
    h: Math.floor(time / 3.6e6),
    m: Math.floor(time / 6e4) % 60,
    s: Math.ceil(time / 1e3) % 60
  }
  return parsed
}

export function parseFullTime(time: number): ParsedFullTime {
  const parsed: ParsedFullTime = {
    w: Math.floor(time / 6.048e8),
    d: Math.floor(time / 8.64e7) % 7,
    h: Math.floor(time / 3.6e6) % 24,
    m: Math.floor(time / 6e4) % 60,
    s: Math.ceil(time / 1e3) % 60
  }
  return parsed
}

export function parseFullTimeArray(time: number): string[] {
  const parsed = parseFullTime(time)
  return Object.entries(parsed).map(([k, v]) => {
    return `${v}${config.meta.timeSpelling[k as keyof ParsedFullTime]}`
  })
}

export function parseFilteredFullTimeArray(time: number): string[] {
  const parsed = parseFullTime(time)
  const res = Object.entries(parsed)
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => {
      return `${v}${config.meta.timeSpelling[k as keyof ParsedFullTime]}`
    })

  return res.length === 0 ? [`0${config.meta.timeSpelling['s']}`] : res
}

export function parseFullTimeString(time: number): string {
  return parseFullTimeArray(time).join(' ')
}

export function parseFilteredFullTimeString(time: number): string {
  return parseFilteredFullTimeArray(time).join(' ')
}

export function parseTimeArray(time: number): string[] {
  const parsed = parseTime(time)
  return Object.entries(parsed).map(([k, v]) => {
    return `${v}${config.meta.timeSpelling[k as keyof ParsedFullTime]}.`
  })
}

export function parseFilteredTimeArray(time: number): string[] {
  const parsed = parseTime(time)
  const res = Object.entries(parsed)
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => {
      return `${v}${config.meta.timeSpelling[k as keyof ParsedFullTime]}.`
    })

  return res.length === 0 ? [`0${config.meta.timeSpelling['s']}`] : res
}

export function parseTimeString(time: number): string {
  return parseTimeArray(time).join(' ')
}

export function parseFilteredTimeString(time: number): string {
  return parseFilteredTimeArray(time).join(' ')
}

export async function resolveMember(
  mention: string,
  guild: Guild | undefined = getMainGuild()
): Promise<GuildMember | null> {
  return new Promise(resolve => {
    if (!guild) return resolve(null)

    const targetID = resolveUserID(mention) || mention
    if (!targetID) return resolve(null)

    resolve(guild.members.fetch(targetID).catch(() => null))
  })
}

export function validatePrivateroom(
  member: GuildMember,
  channel: VoiceChannel
): boolean {
  if (!channel) return false
  if (!privaterooms.has(channel.id)) return false

  const permissionOverwrites = channel.permissionOverwrites.get(member.id)
  if (!permissionOverwrites) return false

  const flags = Permissions.FLAGS.CREATE_INSTANT_INVITE
  if (!permissionOverwrites.allow.has(flags)) return false

  return true
}

export function resolveMentionUserID(mention: string = '') {
  const regex = /^<@!?(\d+)>$/
  const match = mention.match(regex)
  if (!match) return null
  return match[1]
}

export function resolveUserID(mention: string): string | null {
  if (/^\d+$/.test(mention)) return mention
  return resolveMentionUserID(mention)
}

export function resolveRoleID(mention: string): string | null {
  if (/^\d+$/.test(mention)) return mention
  const regex = /^<@&(\d+)>$/
  const match = mention.match(regex)
  if (!match) return null
  return match[1]
}

export function resolveChannelID(mention: string): string | null {
  if (/^\d+$/.test(mention)) return mention
  const regex = /^<@#(\d+)>$/
  const match = mention.match(regex)
  if (!match) return null
  return match[1]
}

// export function filterWeekActivity(
//   voiceActivity: VoiceActivity[]
// ): VoiceActivity[] {
//   const weekMs = 6.048e8

//   const va = [...voiceActivity.map(a => [...a])] as VoiceActivity[]
//   const weekActivity = va.filter(a => {
//     return a[1] ? a[1] > Date.now() - weekMs : true
//   })
//   if (weekActivity[0]) {
//     weekActivity[0][0] = Math.max(weekActivity[0][0], Date.now() - weekMs)
//   }

//   return weekActivity
// }

// export function filterOutOfWeekActivity(
//   voiceActivity: VoiceActivity[]
// ): VoiceActivity[] {
//   const weekMs = 6.048e8

//   const va = [...voiceActivity.map(a => [...a])].filter(a => {
//     return a[0] < Date.now() - weekMs
//   }) as VoiceActivity[]
//   const lastActivityIndex = va.length - 1

//   if (lastActivityIndex > -1) {
//     va[lastActivityIndex][1] = Math.min(
//       va[lastActivityIndex][1],
//       Date.now() - weekMs
//     )
//   }

//   return va
// }

// export function parseVoiceActivity(voiceActivity: VoiceActivity) {
//   const va = [...voiceActivity.map(a => [...a])]
//   const lastActivity = va.slice(-1)[0]
//   if (lastActivity && typeof lastActivity[1] !== 'number') {
//     va[va.length - 1][1] = Date.now()
//   }
//   return va
//     .map(a => (a[1] as number) - (a[0] as number))
//     .reduce((p, c) => p + c, 0)
// }

export function disableEvents() {
  client.events
    .filter(e => e.name !== 'ready')
    .forEach(e => {
      eventStates.set(e._id, { enabled: e.enabled })
      e.disable()
    })
}

export function enableEvents() {
  ;[...eventStates.entries()]
    .filter(([_, info]) => info.enabled)
    .map(([id]) => client.events.get(id))
    .forEach(e => e.enable())
}

export function readyMessage() {
  const { tag } = client.user as ClientUser
  logger.log(
    chalk.cyan.bold('[BOT]'),
    'Started:',
    chalk.green(tag),
    'in',
    `${chalk.yellow(Date.now() - runTick)}ms`
  )
}

export function checkMainGuildExistance() {
  const guild = getMainGuild()
  if (!guild) {
    logger.error(
      chalk.cyan.bold('[BOT]'),
      'Main guild not found.',
      chalk.red.bold('Exiting..')
    )
    process.exit(1)
  }
  return guild
}

export async function startAutoMessage() {
  new CronJob(
    '0 0 */12 * * *',
    async () => {
      const guild = getMainGuild()
      let channel = guild!.channels.cache.get(
        config.ids.channels.text.mainChat
      ) as TextChannel
      channel.send({
        embed: {
          color: 3092790,
          author: {
            name: 'Продвижения сервера!',
            icon_url:
              'https://cdn.discordapp.com/attachments/578884018045452288/776151307760828456/ethereal.gif'
          },
          description:
            '```fix\nОставь отзыв о нашем сервере и получи вознаграждение!\n```\n```ini\n[Чтобы получить бесплатные монеты, нужно прописывать команду раз в 4 часа: !bump или s.up]```',
          fields: [
            {
              name: '\u200b',
              value:
                '[```Discord-Server```](https://discord-server.com/728716141802815539)',
              inline: true
            },
            {
              name: '\u200b',
              value:
                '[```⠀Discordbook⠀```](https://discordbook.ru/server/728716141802815539)',
              inline: true
            },
            {
              name: '\u200b',
              value:
                '[```Server-Discord```](https://server-discord.com/728716141802815539)',
              inline: true
            },
            {
              name: '\u200b',
              value:
                '[```DiscordServer```](https://discordserver.info/728716141802815539)',
              inline: true
            }
          ],
          image: {
            url:
              'https://cdn.discordapp.com/attachments/735569583301460046/794779937173143572/Comp_1_00000.png'
          },
          footer: {
            text: 'Ты можешь получить приятное вознаграждение за помощь серверу'
          }
        }
      })
    },
    null,
    true,
    'Europe/Moscow'
  )
}

export function fetchVoiceMembers(): Promise<void> {
  return new Promise((resolve, reject) => {
    const guild = getMainGuild()
    if (!guild) return resolve()

    const voiceMembers = guild.voiceStates.cache
      .filter(v => {
        if (!v.channel) return false
        if (v.mute) return false

        const filteredMembers = v.channel.members
          .filter(m => !m.voice.mute)
          .array()
        return Boolean(v.member && filteredMembers.length > 0)
      })
      .map(v => v.member) as GuildMember[]

    const docs = voiceMembers.map(m => ({
      user_id: m.id,
      join_time: Date.now(),
      leave_time: null
    }))
    VoiceActivityModel.insertMany(docs).then(() => resolve(), reject)
  })
}

export function cleanupVoiceActivity(): Promise<void> {
  return VoiceActivityModel.deleteMany({ leave_time: null })
    .lean()
    .exec()
    .then(() => {})
}

export function openCreateroom() {
  const channel = client.channels.cache.get(
    config.ids.channels.voice.createPrivate
  ) as VoiceChannel
  if (!channel) return

  const permissionOverwrites = channel.permissionOverwrites
    .array()
    .filter(p => p.type !== 'member')

  channel.edit({ permissionOverwrites })
}

export function cleanupPrivaterooms(): Promise<void> {
  return PrivateRoom.getData().then(() => {
    for (const pr of [...privaterooms.values()]) {
      const channel = client.channels.cache.get(pr.roomID) as VoiceChannel
      if (!channel || channel.members.size < 1) {
        PrivateRoom.deleteOne({ roomID: pr.roomID })
        privaterooms.delete(pr.roomID)
        if (channel) channel.delete().catch(() => {})
      }
    }
  })
}

export function fetchPrivaterooms() {
  PrivateRoom.getData()
    .then(data => [...data.values()])
    .then(docs => {
      for (const doc of docs) {
        const { roomID, ownerID } = doc
        privaterooms.set(roomID, { roomID, ownerID })
      }
    })
}

export function verifyGuild(id: string) {
  return config.meta.allowedGuilds.includes(id)
}

export function verifyMainGuild(id: string) {
  return config.ids.guilds.main === id
}

export function confirm(
  message: Message,
  user: DiscordUser,
  time: number = 7.2e6
): Promise<boolean | null> {
  const emojis = config.meta.confirmEmojis
  ;(async () => {
    try {
      for (const emoji of emojis) await react(message, emoji)
    } catch (_) {}
  })()

  return message
    .awaitReactions(
      (r, u) => {
        return u.id === user.id && emojis.includes(r.emoji.id || r.emoji.name)
      },
      { max: 1, time, errors: ['time'] }
    )
    .then(collected => collected.first())
    .then(r => {
      if (!r) return null
      return (r.emoji.id || r.emoji.name) === emojis[0]
    })
    .catch(() => {
      message.reactions.removeAll().catch(() => {})
      return null
    })
}

export function react(message: Message, emojiID: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const emoji = client.emojis.cache.get(emojiID) || emojiID

    fetch(
      `https://discord.com/api/v7/channels/${message.channel.id}/messages/${
        message.id
      }/reactions/${encodeURIComponent(
        typeof emoji === 'string' ? emoji : `${emoji.name}:${emoji.id}`
      )}/@me`,
      { method: 'PUT', headers: { Authorization: `Bot ${client.token}` } }
    )
      .then(res => {
        if (res.headers.get('content-type') === 'application/json') {
          return res.json()
        } else {
          return { retry_after: undefined }
        }
      })
      .then(res => {
        if (typeof res.retry_after === 'number') {
          setTimeout(() => resolve(react(message, emojiID)), res.retry_after)
        } else {
          resolve(res)
        }
      })
      .catch(reject)
  })
}

export function processPrefixes() {
  client.commands.forEach(c => {
    if (typeof c.aliases === 'string') c.aliases = [c.aliases]
    const prefix = c.custom.prefix || config.internal.prefix
    c.name = `${prefix}${c.name}`
    c.aliases = c.aliases.map(a => `${prefix}${a}`)
  })
}

export function getNounPluralForm(a: number) {
  if (a % 10 === 1 && a % 100 !== 11) {
    return 0
  } else if (a % 10 >= 2 && a % 10 <= 4 && (a % 100 < 10 || a % 100 >= 20)) {
    return 1
  }
  return 2
}

export function pluralNoun(num: number, ...forms: string[]) {
  if (forms.length === 1) throw new Error('Not enough forms')
  if (forms.length === 2) return num > 1 ? forms[1] : forms[0]
  return forms[getNounPluralForm(num)]
}

export function getReaction(
  message: Message,
  emojis: string | string[],
  users: DiscordUser | DiscordUser[],
  time: number = 7.2e6
) {
  if (!Array.isArray(users)) users = [users]
  if (!Array.isArray(emojis)) emojis = [emojis]
  ;(async () => {
    try {
      for (const emoji of emojis) await react(message, emoji)
    } catch (_) {}
  })()

  return getReactionStatic(message, emojis, users, time)
}

export function getReactionStatic(
  message: Message,
  emojis: string | string[],
  users: DiscordUser | DiscordUser[],
  time: number = 7.2e6
) {
  if (!Array.isArray(users)) users = [users]
  if (!Array.isArray(emojis)) emojis = [emojis]

  return message
    .awaitReactions(
      (r, u) => {
        if (!emojis.includes(r.emoji.id || r.emoji.name)) return false
        const ids = (users as DiscordUser[]).map(u => u.id)
        if (!ids.includes(u.id)) return false
        return true
      },
      { max: 1, time, errors: ['time'] }
    )
    .then(collected => collected.first())
    .then(r => {
      if (!r) return null
      return r
    })
    .catch(() => {
      message.reactions.removeAll().catch(() => {})
      return null
    })
}

export function resolveHex(hex: string): string | null {
  const match = hex.match(/^#((?:[0-f]{3}){1,2})$/)
  if (!match) return null

  hex = match[1]
  return hex.length === 3
    ? hex
        .split('')
        .map(c => c.repeat(2))
        .join('')
    : hex
}

export function checkTemps() {
  const interval = config.meta.checkInterval
  checkTemproles(interval)
  checkTemprooms(interval)
  checkPairroles(interval)
  setTimeout(() => checkTemps(), interval)
}

export function checkTemprooms(interval: number) {
  TempRoomModel.find({
    $and: [
      { endTick: { $ne: null } },
      { endTick: { $lt: Date.now() + interval } }
    ]
  })
    .then(docs => docs.map(doc => new TempRoom(doc)))
    .then(tempRooms => {
      tempRooms.forEach(tempRoom => {
        const until = (tempRoom.endTick as number) - Date.now()
        tempRoom.delete({ timeout: until })
      })
    })
}

export function checkTemproles(interval: number) {
  const time = Date.now() + interval
  TempRoleModel.find({
    $and: [{ endTick: { $ne: null } }, { endTick: { $lt: time } }]
  }).then(docs => {
    const guild = getMainGuild() as Guild
    for (const doc of docs) {
      const until = (doc.endTick as number) - Date.now()
      setTimeout(() => {
        const {
          temprole1d,
          temprole3d,
          temprole7d,
          temprole30d
        } = config.ids.goods
        if (
          [temprole1d, temprole3d, temprole7d, temprole30d].includes(doc.itemID)
        ) {
          const role = guild.roles.cache.get(doc.roleID)
          if (role) role.delete().catch(() => {})
        } else {
          guild.members
            .fetch(doc.userID)
            .then(member => member.roles.remove(doc.roleID).catch(() => {}))
            .catch(() => {})
        }
        TempRoleModel.deleteOne({ roleID: doc.roleID })
      }, until)
    }
  })
}

export function checkHiddenGenders() {
  const guild = getMainGuild() as Guild

  UserModel.find(
    { hiddenGenderEndDate: { $ne: null } },
    { userID: 1, hiddenGender: 1, hiddenGenderEndDate: 1 }
  )
    .lean()
    .exec()
    .then(docs => {
      docs.forEach(doc => {
        Timer.set(doc.hiddenGenderEndDate as number, () => {
          const url = `guilds/${guild.id}/members/${doc.userID}/roles/${
            [
              config.ids.roles.gender.unknown,
              config.ids.roles.gender.male,
              config.ids.roles.gender.female
            ][doc.hiddenGender as number]
          }`
          discordRetryHandler(url, {
            method: 'PUT',
            headers: { Authorization: `Bot ${client.token}` }
          })
        })
      })
    })
}

export function checkPairroles(interval: number) {
  const now = Date.now()
  const expirationTime = now + interval
  PairModel.find({
    $and: [
      { roleEndTick: { $ne: null } },
      { roleEndTick: { $lt: expirationTime } }
    ]
  })
    .then(docs => docs.map(doc => new Pair(doc)))
    .then(pairs => {
      pairs.forEach(pair => {
        const until = (pair.role.endTimestamp as number) - Date.now()
        setTimeout(() => pair.role.delete(), until)
      })
    })
}

export function repeat<T>(e: T, count: number): T[] {
  const arr: T[] = []
  for (let i = 0; i < count; i++) arr.push(e)
  return arr
}

export async function genActivationsMsg(user: DiscordUser) {
  const [temproleDocs, temproomData, pairDoc] = await Promise.all([
    TempRoleModel.find({ userID: user.id }).lean().exec(),
    TempRoom.get(user.id),
    Pair.find(user.id)
  ])

  const temproles = temproleDocs.map(doc => {
    return Object.assign({}, Object(doc), { mention: `<@&${doc.roleID}>` })
  })
  const temproomDocs = temproomData.map(doc => {
    return Object.assign({}, doc, { mention: `<#${doc.id}>` })
  })

  if (
    pairDoc &&
    pairDoc.roleEndTick != null &&
    pairDoc.roleEndTick > Date.now()
  ) {
    temproles.push({
      mention: `<@&${pairDoc.roleID}>`,
      itemID: -1,
      roleID: pairDoc.roleID,
      userID: Array.from(pairDoc.pair).join(','),
      endTick: pairDoc.roleEndTick,
      customMembers: [] as string[]
    })
  }

  const docs = temproles.concat(temproomDocs).sort((b, a) => {
    return a.endTick - b.endTick
  })

  return {
    embed: {
      color: config.meta.defaultColor,
      author: {
        name: user.tag,
        icon_url: user.displayAvatarURL({ dynamic: true })
      },
      title: 'Инвентарь пользователя',
      description: [
        'Предмет / Дата окончания',
        docs.length < 1
          ? 'Пусто'
          : docs
              .map(doc => ({
                id: doc.itemID,
                emoji:
                  doc.itemID === -1
                    ? client.emojis.cache.get('718639576406556712')
                    : Object.assign({}, goods, crystalGoods)
                        [doc.itemID].emojis.map(id => {
                          return client.emojis.cache.get(id)
                        })
                        .filter(Boolean)
                        .join('') ||
                      client.emojis.cache.get(config.emojis.empty) ||
                      '',
                mention: doc.mention,
                endDate: doc.endTick
                  ? moment(doc.endTick)
                      .tz(config.meta.defaultTimezone)
                      .locale('ru-RU')
                      .format('lll')
                  : undefined
              }))
              .map(item => {
                return `${`${item.emoji} `.trimLeft()}${item.mention} [ **${
                  item.endDate || 'Неизвестно'
                }** ]`
              })
              .join('\n')
      ].join('\n')
    }
  }
}

export async function genInventoryMsg(user: DiscordUser) {
  const userDoc = await User.get(user.id)
  const inv = Object.entries(userDoc.inventory)

  return {
    embed: {
      color: config.meta.defaultColor,
      author: {
        name: user.tag,
        icon_url: user.displayAvatarURL({ dynamic: true })
      },
      title: 'Инвентарь пользователя',
      description:
        inv.length < 1
          ? 'Пусто'
          : inv
              .map(([id, count]) => ({
                id,
                name: Object.assign({}, goods, crystalGoods)[id].name,
                emoji:
                  Object.assign({}, goods, crystalGoods)
                    [id].emojis.map(id => client.emojis.cache.get(id))
                    .filter(Boolean)
                    .join('') ||
                  client.emojis.cache.get(config.emojis.empty) ||
                  '',
                count
              }))
              .filter(item => item.count > 0)
              .map(item => {
                return repeat(
                  `${`${item.emoji} `.trimLeft()}${item.name}`,
                  item.count
                ).join('\n')
              })
              .join('\n')
    }
  }
}

export function splitMessage(
  text: string,
  { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}
) {
  if (Array.isArray(text)) text = text.join('\n')
  if (text.length <= maxLength) return [text]
  const splitText = text.split(char)
  if (splitText.some(chunk => chunk.length > maxLength)) {
    throw new RangeError('SPLIT_MAX_LEN')
  }
  const messages = []
  let msg = ''
  for (const chunk of splitText) {
    if (msg && (msg + char + chunk + append).length > maxLength) {
      messages.push(msg + append)
      msg = prepend
    }
    msg += (msg && msg !== prepend ? char : '') + chunk
  }
  return messages.concat(msg).filter(m => m)
}

export const deconstruct = (snowflake: string) => {
  // Discord epoch (2015-01-01T00:00:00.000Z)
  const EPOCH = 1420070400000
  const BINARY = idToBinary(snowflake).padStart(64, '0')
  return parseInt(BINARY.substring(0, 42), 2) + EPOCH
}
export function idToBinary(num: string) {
  let bin = ''
  let high = parseInt(num.slice(0, -10), 10) || 0
  let low = parseInt(num.slice(-10), 10)
  while (low > 0 || high > 0) {
    // tslint:disable-next-line:no-bitwise
    bin = String(low & 1) + bin
    low = Math.floor(low / 2)
    if (high > 0) {
      low += 5000000000 * (high % 2)
      high = Math.floor(high / 2)
    }
  }
  return bin
}

export function discordRetryHandler(
  input: RequestInfo,
  init?: RequestInit | undefined,
  tries: number = 0
): Promise<any> {
  return new Promise((resolve, reject) => {
    fetch(`https://discord.com/api/v8/${input}`, init)
      .then(res => {
        if (res.headers.get('content-type') === 'application/json') {
          return res.json()
        } else {
          return { retry_after: undefined }
        }
      })
      .then(res => {
        if (typeof res.retry_after === 'number') {
          if (tries + 1 > 1) return reject(new Error('Too many tries'))
          setTimeout(
            () => resolve(discordRetryHandler(input, init, tries + 1)),
            res.retry_after
          )
        } else {
          resolve(res)
        }
      })
      .catch(reject)
  })
}

export function resolveEmoji(emojiID: string) {
  if (emojiRegex.test(emojiID)) return emojiID

  const emoji =
    client.emojis.cache.get(emojiID) ||
    client.emojis.cache.get(config.emojis.empty) ||
    ''
  return `${emoji} `.trimLeft()
}

export function getReputationRank(reputation: number): string {
  const entries = Object.entries(config.repRanks).map(([k, v]) => [
    Number(k),
    v
  ])
  const positiveEntries = entries
    .filter(([r]) => r > 0)
    .sort((b, a) => (a[0] as number) - (b[0] as number))
  const negativeEntries = entries
    .filter(([r]) => r < 0)
    .sort((a, b) => (a[0] as number) - (b[0] as number))

  const positiveEntry = positiveEntries.find(([r]) => r <= reputation)
  const negativeEntry = negativeEntries.find(([r]) => r >= reputation)

  return (positiveEntry ||
    negativeEntry || [0, config.repRanks['0']])[1] as string
}

export async function calculateActivityRewards(
  member: GuildMember,
  user: {
    xp: number
    lvl: number
    gold: number
    goldChests: number
    itemChests: number
    lastChest: number
  },
  lastVAs: [VoiceActivity?, VoiceActivity?]
) {
  const lastActivityTime = lastVAs[0] ? lastVAs[0].diff : 0
  const activityTime = lastVAs[1] ? lastVAs[1].diff : 0
  const awardExp = Math.floor(
    ((activityTime + (lastActivityTime % 6e4)) / 6e4) *
      (Math.random() * (2 - 1 + 1) + 1)
  )
  // if (doc.clanID) {
  //   const clan = clanManager.get(doc.clanID)
  //   if(!clan) return
  //   const targetClanMember = clan.members.get(doc.userID)
  //   targetClanMember?.calculateClanExp(awardExp)
  // }
  const receivedGoldAmount = Math.floor(
    (activityTime + (lastActivityTime % 1.8e5)) / 1.8e5
  )

  const goldMultiplier = (Object.entries(
    config.meta.goldMultipliers
  ).find(multiplier => member.roles.cache.has(multiplier[0])) || [, 1])[1]

  const newUser = Object.assign(
    {
      goldChests: user.goldChests,
      itemChests: user.itemChests,
      lastChest: user.lastChest,
      gold: user.gold + receivedGoldAmount * goldMultiplier
    },
    awardXP(user, awardExp)
  )
  const receivedChestCount = Math.floor(
    (activityTime + (lastActivityTime % 4.32e7)) / 4.32e7
  )
  for (let i = 0; i < receivedChestCount; i++) {
    if (newUser.lastChest === config.ids.chests.item) {
      newUser.goldChests += 1
      newUser.lastChest = config.ids.chests.gold
    } else {
      newUser.itemChests += 1
      newUser.lastChest = config.ids.chests.item
    }
  }

  return newUser
}

export function getEmbedCode(attachment?: MessageAttachment) {
  if (!attachment) return null
  if (!attachment.attachment) return null

  const url = (attachment.attachment || { toString() {} }).toString() || ''
  const regex = /^https:\/\/cdn\.discordapp\.com\/attachments\/\d+\/\d+\/.+\.txt/

  if (!regex.test(url)) return null

  return fetch(url).then(res => res.text())
}

export function awardXP(user: { xp: number; lvl: number }, xpToAdd: number) {
  const newUser = { xp: user.xp, lvl: user.lvl }
  newUser.xp += xpToAdd
  let needxp = Math.round(
    1.4 * newUser.lvl ** 3 + 3.8 * newUser.lvl ** 2 + 2 * (newUser.lvl + 30)
  )
  if (newUser.xp >= needxp) {
    while (newUser.xp >= needxp) {
      newUser.lvl++
      newUser.xp -= needxp
      needxp = Math.round(
        1.4 * newUser.lvl ** 3 + 3.8 * newUser.lvl ** 2 + 2 * (newUser.lvl + 30)
      )
    }
  }
  return newUser
}

export async function setBanner() {
  const banner = await CanvasUtil.makeBanner()
  // const banner = await CanvasUtil.makeBanner2021()

  const guild = getMainGuild() as Guild
  const clientUser = client.user as ClientUser

  discordRetryHandler(`guilds/${guild.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      banner: `data:image/jpg;base64,${banner.toString('base64')}`
    }),
    headers: {
      authorization: `${clientUser.bot ? 'Bot ' : ''}${client.token}`,
      'content-type': 'application/json'
    }
  })
    .then(() => setTimeout(() => setBanner(), 6e4))
    .catch(() => setTimeout(() => setBanner(), 6e4))
}

export function setStatus() {
  const guild = getMainGuild() as Guild
  const clientUser = client.user as ClientUser
  clientUser
    .setActivity({
      name: `на ${guild.memberCount.toLocaleString('ru-RU')} участников`,
      type: 'WATCHING'
    })
    .catch(() => {})
}

export function resetPairtime() {
  const handler = async () => {
    const date = new Date()
    const prevSeason = new Date().setMonth(date.getMonth() - 3)

    const pairs = await Pair.findMany({
      createdTimestamp: { $lte: prevSeason }
    })
    await Promise.all(pairs.map(pair => pair.delete())).catch(() => {})

    PairModel.updateMany({}, { voiceTime: 0 })
  }
  new CronJob('0 0 0 1 * *', handler, null, true, 'Europe/Moscow')
}

export function checkPairs() {
  const handler = async () => {
    const cost = 2000

    const date = new Date()
    const prevMonth = new Date().setMonth(date.getMonth() - 1)

    const pairs = await Pair.findMany({ createdTimestamp: { $lte: prevMonth } })
    pairs.forEach(async pair => {
      const promises = Array.from(pair.pair).map(id => User.get(id))
      const users = await Promise.all(promises)

      const totalGold = users
        .map(u => u.gold)
        .reduce((acc, cur) => acc + cur, 0)
      if (totalGold < cost) return pair.delete()

      users.reduce((acc, user) => {
        const charge = Math.min(acc, user.gold)
        if (charge > 0) user.update({ gold: user.gold - charge })
        return acc - charge
      }, cost)
    })
  }
  new CronJob('0 0 0 1 * *', handler, null, true, 'Europe/Moscow')
}

export function monthlyTempRoomCheck() {
  const handler = async () => {
    const count = await TempRoomModel.find().lean().countDocuments().exec()
    const deleteCount = Math.floor(count / 3)
    if (deleteCount < 1) return

    const rooms = await TempRoomModel.find({})
      .lean()
      .sort({ voiceTime: 1 })
      .limit(deleteCount)
      .exec()
      .then(docs => docs.map(doc => new TempRoom(doc)))

    rooms.forEach(room => room.delete())
  }
  new CronJob('0 0 0 1 * *', handler, null, true, 'Europe/Moscow')
}

export async function weekActivityTop<
  T = { userID: string; voiceTime: number }
>(
  user: DiscordUser
): Promise<{ before: T[]; after: T[]; user: T; index: number }> {
  const now = Date.now()
  const prevWeekTime = now - 6.048e8
  const aggregationRes = await UserModel.collection
    .aggregate(
      [
        {
          $lookup: {
            from: 'voice_activities',
            let: { userID: '$userID' },
            pipeline: [
              {
                $addFields: {
                  leave_time: { $ifNull: ['$leave_time', now] },
                  join_time: {
                    $cond: {
                      if: { $lt: ['$join_time', prevWeekTime] },
                      then: prevWeekTime,
                      else: '$join_time'
                    }
                  }
                }
              },
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$user_id', '$$userID'] },
                      { $gt: ['$leave_time', prevWeekTime] }
                    ]
                  }
                }
              },
              {
                $project: {
                  time: {
                    $subtract: ['$leave_time', '$join_time']
                  }
                }
              }
            ],
            as: 'voice_time'
          }
        },
        {
          $project: {
            userID: 1,
            voiceTime: {
              $add: [{ $sum: '$voice_time.time' }, '$voiceTime']
            }
          }
        },
        { $sort: { voiceTime: -1 } },
        {
          $facet: {
            exceptUser: [{ $match: { $expr: { $ne: ['$userID', user.id] } } }],
            user: [{ $match: { $expr: { $eq: ['$userID', user.id] } } }]
          }
        },
        {
          $addFields: {
            user: {
              $ifNull: [
                { $arrayElemAt: ['$user', 0] },
                { user_id: user.id, voiceTime: 0 }
              ]
            }
          }
        },
        { $unwind: '$exceptUser' },
        {
          $facet: {
            before: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $gt: ['$exceptUser.voiceTime', '$user.voiceTime'] },
                      {
                        $and: [
                          {
                            $gte: ['$exceptUser.voiceTime', '$user.voiceTime']
                          },
                          { $lte: ['$exceptUser.userID', '$user.userID'] }
                        ]
                      }
                    ]
                  }
                }
              },
              { $replaceRoot: { newRoot: '$exceptUser' } },
              { $limit: 10 }
            ],
            after: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $lt: ['$exceptUser.voiceTime', '$user.voiceTime'] },
                      {
                        $and: [
                          {
                            $lte: ['$exceptUser.voiceTime', '$user.voiceTime']
                          },
                          { $gte: ['$exceptUser.userID', '$user.userID'] }
                        ]
                      }
                    ]
                  }
                }
              },
              { $replaceRoot: { newRoot: '$exceptUser' } },
              { $limit: 10 }
            ],
            user: [{ $match: {} }, { $replaceRoot: { newRoot: '$user' } }],
            index: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $gt: ['$exceptUser.voiceTime', '$user.voiceTime'] },
                      {
                        $and: [
                          {
                            $gte: ['$exceptUser.voiceTime', '$user.voiceTime']
                          },
                          { $lte: ['$exceptUser.userID', '$user.userID'] }
                        ]
                      }
                    ]
                  }
                }
              },
              { $count: 'count' }
            ]
          }
        },
        {
          $addFields: {
            user: { $arrayElemAt: ['$user', 0] },
            index: { $arrayElemAt: ['$index.count', 0] }
          }
        },
        { $addFields: { index: { $ifNull: ['$index', 0] } } }
      ],
      { allowDiskUse: true }
    )
    .toArray()

  const [res] = aggregationRes
  Object.assign(res, { user: new User(res.user || { userID: user.id }) })
  return res
}

export function updatePerms(
  channel: VoiceChannel,
  perms: { id: string; type: 0 | 1; allow: number; deny: number }[]
) {
  discordRetryHandler(`channels/${channel.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bot ${channel.client.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ permission_overwrites: perms })
  })
}

export function addPerms(
  channel: VoiceChannel,
  id: string,
  perms: { allow: number; deny: number }
) {
  const newPerms: {
    id: string
    type: 0 | 1
    allow: number
    deny: number
  }[] = []

  Array.from(channel.permissionOverwrites.values()).forEach(perm => {
    if (perm.id === id) return
    newPerms.push({
      id: perm.id,
      type: channel.guild.roles.cache.has(perm.id) ? 0 : 1,
      allow: perm.allow.bitfield,
      deny: perm.deny.bitfield
    })
  })

  const userPerms = channel.permissionOverwrites.get(id) || {
    allow: { bitfield: 0 },
    deny: { bitfield: 0 }
  }
  const type = channel.guild.roles.cache.has(id) ? 0 : 1
  const allow = (userPerms.allow.bitfield & ~perms.deny) | perms.allow
  const deny = (userPerms.deny.bitfield & ~perms.allow) | perms.deny

  if (allow !== 0 || deny !== 0) newPerms.push({ id, type, allow, deny })
  return updatePerms(channel, newPerms)
}

export function removePerms(
  channel: VoiceChannel,
  id: string,
  perms: { allow: number; deny: number }
) {
  const newPerms: {
    id: string
    type: 0 | 1
    allow: number
    deny: number
  }[] = []

  Array.from(channel.permissionOverwrites.values()).forEach(perm => {
    if (perm.id === id) return
    newPerms.push({
      id: perm.id,
      type: channel.guild.roles.cache.has(perm.id) ? 0 : 1,
      allow: perm.allow.bitfield,
      deny: perm.deny.bitfield
    })
  })

  const userPerms = channel.permissionOverwrites.get(id) || {
    allow: { bitfield: 0 },
    deny: { bitfield: 0 }
  }
  const type = channel.guild.roles.cache.has(id) ? 0 : 1
  const allow = userPerms.allow.bitfield & ~perms.allow
  const deny = userPerms.deny.bitfield & ~perms.deny

  if (allow !== 0 || deny !== 0) newPerms.push({ id, type, allow, deny })
  return updatePerms(channel, newPerms)
}

let lotteryRunning = false
export function runLottery(custom = true) {
  if (custom && lotteryRunning) return
  lotteryRunning = true

  const condition: MongooseFilterQuery<UserDoc> = {
    $and: [
      { [`inventory.${config.ids.goods.ticket}`]: { $ne: null } },
      { [`inventory.${config.ids.goods.ticket}`]: { $gt: 0 } }
    ]
  }

  UserModel.find(condition)
    .lean()
    .limit(20)
    .countDocuments()
    .exec()
    .then(async count => {
      if (count < 10) {
        lotteryRunning = false
        return
      }

      const docs = await UserModel.find(condition, {
        _id: 0,
        userID: 1,
        inventory: 1
      })
        .lean()
        .limit(10)
        .exec()
      const updates = docs.map(doc => ({
        filter: { userID: doc.userID },
        update: {
          $set: {
            inventory: Object.assign({}, doc.inventory, {
              [config.ids.goods.ticket]: Math.max(
                (doc.inventory[config.ids.goods.ticket] || 0) - 1,
                0
              )
            })
          }
        }
      }))

      UserModel.bulkWrite(updates.map(update => ({ updateOne: update })))

      const winnerID = docs[Math.floor(Math.random() * docs.length)].userID
      User.get(winnerID).then(user => user.update({ gold: user.gold + 1000 }))

      const channel = client.channels.cache.get(
        config.ids.channels.text.mainChat
      ) as TextChannel | undefined
      if (channel) {
        channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              title: '⠀⠀⠀⠀ЛОТЕРЕЯ | ETHEREAL⠀⠀⠀⠀',
              description:
                'Дамы и господа, занимайте свои места и приготовьте билеты, скоро начнётся лотерея!',
              image: {
                url:
                  'https://media.discordapp.net/attachments/787028836725555251/830206430748999750/Comp-1_00000.gif'
              }
            }
          })
          .catch(() => {})
        setTimeout(() => {
          channel
            .send({
              embed: {
                title: 'А наша лотерея подошла к концу!',
                description: `Победителем оказался <@${winnerID}>, поздравим счастливчика! \n> Вот твоя награда ${(1000).toLocaleString(
                  'ru-RU'
                )}${resolveEmoji(config.meta.emojis.cy).trim()}`,
                color: config.meta.defaultColor,
                image: {
                  url:
                    'https://media.discordapp.net/attachments/787028836725555251/830207556890656778/Comp-1_00000.gif'
                }
              }
            })
            .catch(() => {})

          runLottery(false)
        }, 3e5)
      }
    })
}

export function endGiveaways() {
  GiveawayModel.find({}, { _id: 0, snowflake: 1, end_date: 1 })
    .lean()
    .exec()
    .then(docs => {
      docs.forEach(doc => {
        Timer.set(doc.end_date * 1e3, () => endGiveaway(doc.snowflake))
      })
    })
}

export function endGiveaway(id: string) {
  const getWinners = async (message: Message, winnerCount: number) => {
    const guild = getMainGuild() as Guild

    const winners: string[] = []
    const reaction = message.reactions.cache.get('827482636863144016')
    if (!reaction) return winners

    const usersCol = await reaction.users.fetch()
    const usersSet = new Set(usersCol.keys())
    if (client.user) usersSet.delete(client.user.id)
    const users = Array.from(usersSet).filter(id => {
      const member = guild.members.cache.get(id)
      return member && member.voice.channel != null
    })
    for (let i = 0; i < winnerCount; i++) {
      winners.push(...users.splice(Math.floor(Math.random() * users.length), 1))
    }

    return winners
  }

  GiveawayModel.findOne({ snowflake: id })
    .lean()
    .exec()
    .then(async doc => {
      if (!doc) return

      GiveawayModel.deleteOne({ snowflake: id }).lean().exec()

      const channel = client.channels.cache.get(doc.channel_id) as TextChannel
      if (!channel) return

      const message = await channel.messages
        .fetch(doc.message_id)
        .catch(() => null)
      if (!message) return

      const [embed] = message.embeds
      if (!embed) return

      const fields = [
        embed.fields[0],
        { name: 'Итоги:', value: '```\nРОЗЫГРЫШ ОКОНЧЕН```', inline: true },
        {
          name: `Победител${doc.winner_count > 1 ? 'и' : 'ь'}:`,
          value:
            (doc.type === 0
              ? (await getWinners(message, doc.winner_count))
                  .map(id => `<@${id}>`)
                  .join('\n')
              : '```\n-```') || '\u200b',
          inline: true
        },
        embed.fields[3]
      ]

      message.delete().catch(() => {})
      message.channel
        .send({
          content: `<@&${config.ids.roles.giveaway}>`,
          embed: Object.assign({}, embed, { description: undefined, fields })
        })
        .catch(() => {})
    })
}