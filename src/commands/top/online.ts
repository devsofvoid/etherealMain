import {
  User as DiscordUser,
  Message,
  MessageEmbedOptions,
  VoiceChannel
} from 'discord.js'

import Command from '../../structures/Command'

import * as Util from '../../utils/util'
import client, { cachedRooms, config } from '../../main'
import UserModel from '../../models/raw/User'
import PairModel from '../../models/raw/Pair'
import TempRoomModel from '../../models/raw/TempRoom'
import VoiceActivityModel from '../../models/raw/VoiceActivity'

export class TextTopCommand extends Command {
  get options() {
    return { name: 'топ текстовый' }
  }

  execute(message: Message) {
    UserModel.collection
      .aggregate(
        [
          { $project: { _id: 0, userID: 1, messageCount: 1 } },
          { $sort: { messageCount: -1 } },
          { $limit: 5 }
        ],
        { allowDiskUse: true }
      )
      .toArray()
      .then(docs => {
        return docs.map(d => ({
          user: client.users.cache.get(d.userID) as DiscordUser,
          doc: d
        }))
      })
      .then(data => {
        const embed: MessageEmbedOptions = {
          color: config.meta.defaultColor,
          description: '```\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀     [Общий топ]```',
          image: { url: 'https://i.imgur.com/Gu1Kdv2.gif' }
        }

        embed.fields = data
          .map((d, i) => {
            return [
              {
                name: '```⠀#.⠀```',
                value: `\`\`\`\n${i + 1}.\`\`\``,
                inline: true
              },
              {
                name: '```⠀⠀⠀⠀⠀⠀⠀НИК⠀⠀⠀⠀⠀⠀⠀```',
                value: `\`\`\`\n${d.user ? d.user.tag : d.doc.userID}\`\`\``,
                inline: true
              },
              {
                name: '```⠀⠀⠀СООБЩЕНИЙ⠀⠀⠀```',
                value: `\`\`\`\n${d.doc.messageCount.toLocaleString(
                  'ru-RU'
                )}\`\`\``,
                inline: true
              }
            ]
          })
          .reduce((acc, c) => acc.concat(c), [])

        message.channel.send({ embed }).catch(() => {})
      })
  }
}

export class VoiceActivityTopCommand extends Command {
  get options() {
    return { name: 'топ общий' }
  }

  execute(message: Message) {
    const now = Date.now()
    UserModel.collection
      .aggregate(
        [
          {
            $lookup: {
              from: 'voice_activities',
              let: { userID: '$userID' },
              pipeline: [
                { $match: { $expr: { $eq: ['$user_id', '$$userID'] } } },
                {
                  $addFields: { leave_time: { $ifNull: ['$leave_time', now] } }
                },
                {
                  $project: {
                    _id: 0,
                    diff: { $subtract: ['$leave_time', '$join_time'] }
                  }
                }
              ],
              as: 'activity'
            }
          },
          { $unwind: '$activity' },
          { $addFields: { voiceTime: { $ifNull: ['$voiceTime', 0] } } },
          {
            $group: {
              _id: '$userID',
              userID: { $first: '$userID' },
              voiceTime: { $sum: '$activity.diff' }
            }
          },
          { $sort: { voiceTime: -1 } },
          { $limit: 5 }
        ],
        { allowDiskUse: true }
      )
      .toArray()
      .then(docs => {
        return docs.map(d => ({
          user: client.users.cache.get(d.userID),
          doc: d
        }))
      })
      .then(data => {
        const embed: MessageEmbedOptions = {
          color: config.meta.defaultColor,
          description: '```\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀     [Общий топ]```',
          image: { url: 'https://i.imgur.com/Gu1Kdv2.gif' }
        }

        embed.fields = data
          .map((d, i) => [
            {
              name: '```⠀#.⠀```',
              value: `\`\`\`\n${i + 1}.\`\`\``,
              inline: true
            },
            {
              name: '```⠀⠀⠀⠀⠀⠀⠀НИК⠀⠀⠀⠀⠀⠀⠀```',
              value: `\`\`\`\n${d.user ? d.user.tag : d.doc.userID}\`\`\``,
              inline: true
            },
            {
              name: '```⠀⠀⠀⠀⠀ВРЕМЯ⠀⠀⠀⠀⠀```',
              value: `\`\`\`\n${Util.parseFilteredTimeString(
                d.doc.voiceTime
              )}\`\`\``,
              inline: true
            }
          ])
          .reduce((acc, c) => acc.concat(c), [])

        message.channel.send({ embed }).catch(() => {})
      })
  }
}

export class WeekActivityTopCommand extends Command {
  get options() {
    return { name: 'топ недельный' }
  }

  execute(message: Message) {
    const now = Date.now()
    const prevWeekTime = now - 6.048e8
    VoiceActivityModel.collection
      .aggregate(
        [
          {
            $addFields: {
              join_time: {
                $cond: {
                  if: { $lt: ['$join_time', prevWeekTime] },
                  then: prevWeekTime,
                  else: '$join_time'
                }
              },
              leave_time: { $ifNull: ['$leave_time', now] }
            }
          },
          { $match: { $expr: { $gt: ['$leave_time', prevWeekTime] } } },
          {
            $project: {
              _id: 0,
              user_id: 1,
              diff: { $subtract: ['$leave_time', '$join_time'] }
            }
          },
          { $match: { $expr: { $gte: ['$diff', 1000] } } },
          {
            $group: {
              _id: '$user_id',
              user_id: { $first: '$user_id' },
              diff: { $sum: '$diff' }
            }
          },
          { $sort: { diff: -1 } },
          { $limit: 5 }
        ],
        { allowDiskUse: true }
      )
      .toArray()
      .then(docs => {
        return docs.map(d => ({
          user: client.users.cache.get(d.user_id),
          doc: d
        }))
      })
      .then(data => {
        const embed: MessageEmbedOptions = {
          color: config.meta.defaultColor,
          description: '```\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀     [Недельный топ]```',
          image: { url: 'https://i.imgur.com/Gu1Kdv2.gif' }
        }

        embed.fields = data
          .map((d, i) => [
            {
              name: '```⠀#.⠀```',
              value: `\`\`\`\n${i + 1}.\`\`\``,
              inline: true
            },
            {
              name: '```⠀⠀⠀⠀⠀⠀⠀НИК⠀⠀⠀⠀⠀⠀⠀```',
              value: `\`\`\`\n${d.user ? d.user.tag : d.doc.user_id}\`\`\``,
              inline: true
            },
            {
              name: '```⠀⠀⠀⠀⠀ВРЕМЯ⠀⠀⠀⠀⠀```',
              value: `\`\`\`\n${Util.parseFilteredTimeString(
                d.doc.diff
              )}\`\`\``,
              inline: true
            }
          ])
          .reduce((acc, c) => acc.concat(c), [])

        message.channel.send({ embed }).catch(() => {})
      })
  }
}

export class PairTopCommand extends Command {
  get options() {
    return { name: 'топ любовный' }
  }

  execute(message: Message) {
    PairModel.find()
      .sort({ voiceTime: -1 })
      .limit(5)
      .lean()
      .exec()
      .then(docs => {
        return docs.map(d => ({
          room: client.channels.cache.get(d.roomID) as VoiceChannel,
          doc: d
        }))
      })
      .then(data => {
        const embed: MessageEmbedOptions = {
          color: config.meta.defaultColor,
          description: '```\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀     [Любовный топ]```',
          image: { url: 'https://i.imgur.com/Gu1Kdv2.gif' }
        }

        embed.fields = data
          .map((d, i) => {
            return [
              {
                name: '```⠀#.⠀```',
                value: `\`\`\`\n${i + 1}.\`\`\``,
                inline: true
              },
              {
                name: '```⠀⠀⠀⠀⠀⠀⠀ПАРА⠀⠀⠀⠀⠀⠀⠀```',
                value: `\`\`\`\n${d.room ? d.room.name : d.doc.roomID}\`\`\``,
                inline: true
              },
              {
                name: '```⠀⠀⠀⠀⠀ВРЕМЯ⠀⠀⠀⠀⠀```',
                value: `\`\`\`\n${Util.parseFilteredTimeString(
                  d.doc.voiceTime * 1e3
                )}\`\`\``,
                inline: true
              }
            ]
          })
          .reduce((acc, c) => acc.concat(c), [])

        message.channel.send({ embed }).catch(() => {})
      })
  }
}

export class RoomTopCommand extends Command {
  get options() {
    return { name: 'топ комнаты' }
  }

  async execute(message: Message) {
    const operations = Array.from(cachedRooms)
      .map(([key, value]) => ({
        id: key,
        time: Date.now() - value
      }))
      .map(room => ({
        filter: { roomID: room.id },
        update: [
          { $addFields: { voiceTime: { $ifNull: ['$voiceTime', 0] } } },
          { $set: { voiceTime: { $add: ['$voiceTime', room.time] } } }
        ]
      }))
      .map(updateOne => ({ updateOne }))
    await TempRoomModel.bulkWrite(operations)
    Array.from(cachedRooms.keys()).forEach(k => cachedRooms.set(k, Date.now()))

    TempRoomModel.find()
      .sort({ voiceTime: -1 })
      .limit(5)
      .lean()
      .exec()
      .then(docs => {
        return docs.map(d => ({
          room: client.channels.cache.get(d.roomID) as VoiceChannel,
          doc: d
        }))
      })
      .then(data => {
        const embed: MessageEmbedOptions = {
          color: config.meta.defaultColor,
          description: '```\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀     [Комнатный топ]```',
          image: { url: 'https://i.imgur.com/Gu1Kdv2.gif' }
        }

        embed.fields = data
          .map((d, i) => {
            return [
              {
                name: '```⠀#.⠀```',
                value: `\`\`\`\n${i + 1}.\`\`\``,
                inline: true
              },
              {
                name: '```⠀⠀⠀⠀⠀⠀КОМНАТА⠀⠀⠀⠀⠀⠀```',
                value: `\`\`\`\n${d.room.name || d.doc.roomID}\`\`\``,
                inline: true
              },
              {
                name: '```⠀⠀⠀⠀⠀ВРЕМЯ⠀⠀⠀⠀⠀```',
                value: `\`\`\`\n${Util.parseFilteredTimeString(
                  d.doc.voiceTime
                )}\`\`\``,
                inline: true
              }
            ]
          })
          .reduce((acc, c) => acc.concat(c), [])

        message.channel.send({ embed }).catch(() => {})
      })
  }
}
