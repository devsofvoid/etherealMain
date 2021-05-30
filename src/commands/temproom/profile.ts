import { Message, VoiceChannel } from 'discord.js'

import Command from '../../structures/Command'
import TempRoleModel from '../../models/raw/TempRole'
import TempRoomModel, { ITempRoom } from '../../models/raw/TempRoom'
import client, { cachedRooms, config } from '../../main'
import {
  parseFilteredTimeString,
  resolveChannelID,
  resolveRoleID
} from '../../utils/util'

export default class TemproomProfileCommand extends Command {
  get options() {
    return { name: 'pinfo', aliases: ['инфокомната'] }
  }

  async execute(message: Message, args: string[]) {
    const mentionArg = args.join(' ')
    if (mentionArg.length < 1) return

    const id = resolveChannelID(mentionArg) || resolveRoleID(mentionArg)
    if (!id) return
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

    const aggregationResult = await TempRoomModel.collection
      .aggregate(
        [
          {
            $project: {
              _id: 0,
              searchID: id,
              roomID: 1,
              userID: 1,
              voiceTime: 1,
              linkedRoleID: 1
            }
          },
          { $sort: { voiceTime: -1 } },
          {
            $facet: {
              docs: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $ne: ['$roomID', '$searchID'] },
                        { $ne: ['$linkedRoleID', '$searchID'] }
                      ]
                    }
                  }
                }
              ],
              room: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $eq: ['$roomID', '$searchID'] },
                        { $eq: ['$linkedRoleID', '$searchID'] }
                      ]
                    }
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              docs: {
                $cond: {
                  if: { $eq: [{ $size: '$docs' }, 0] },
                  then: [{}],
                  else: '$docs'
                }
              }
            }
          },
          { $addFields: { room: { $arrayElemAt: ['$room', 0] } } },
          { $addFields: { room: { $ifNull: ['$room', {}] } } },
          { $unwind: '$docs' },
          {
            $facet: {
              room: [{ $replaceRoot: { newRoot: '$room' } }],
              index: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $gt: ['$docs.voiceTime', '$room.voiceTime'] },
                        {
                          $and: [
                            { $gte: ['$docs.voiceTime', '$room.voiceTime'] },
                            { $lte: ['$docs.roomID', '$room.roomID'] }
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
              room: { $arrayElemAt: ['$room', 0] },
              index: { $arrayElemAt: ['$index.count', 0] }
            }
          },
          { $addFields: { index: { $ifNull: ['$index', 0] } } }
        ],
        { allowDiskUse: true }
      )
      .toArray()

    const index: number = aggregationResult[0].index
    const rawRoom: ITempRoom = aggregationResult[0].room

    const channel = client.channels.cache.get(rawRoom.roomID) as VoiceChannel
    if (!channel) return

    const role = rawRoom.linkedRoleID
      ? await TempRoleModel.findOne({ roleID: rawRoom.linkedRoleID })
          .lean()
          .exec()
      : null
    const memberCount = role
      ? (role.customMembers || []).length + 1
      : Array.from(channel.permissionOverwrites.values()).filter(
          o => o.type === 'member'
        ).length

    message.channel.send({
      embed: {
        color: config.meta.defaultColor,
        title: 'Профиль комнаты',
        fields: [
          {
            name: 'Комната:',
            value: `\`\`\`\n${channel.name}\`\`\`` || '\u200b',
            inline: true
          },
          { name: 'Владелец', value: `<@${rawRoom.userID}>`, inline: true },
          {
            name: 'Участников:',
            value: `\`\`\`\n${memberCount.toLocaleString('ru-RU')}\`\`\``,
            inline: true
          },
          {
            name: 'Роль',
            value: role ? `<@&${role.roleID}>` : '```\nОтсутствует```',
            inline: true
          },
          {
            name: 'Онлайн:',
            value: `\`\`\`\n${parseFilteredTimeString(
              rawRoom.voiceTime || 0
            )}\`\`\``,
            inline: true
          },
          {
            name: 'Место в топе:',
            value: `\`\`\`\n${(index + 1).toLocaleString('ru-RU')}\`\`\``,
            inline: true
          },
          {
            name: 'ID:',
            value: `\`\`\`\n${rawRoom.roomID}\`\`\``,
            inline: false
          }
        ],
        image: {
          url:
            'https://images-ext-2.discordapp.net/external/h6Xs333ySHjPIvm4tqSndRZlCWmGK8VS_9vNbSCSvYk/%3Fwidth%3D971%26height%3D486/https/media.discordapp.net/attachments/728574817804222475/827238372832575538/13b643122e6cde5c26d461dea77f1ba5.gif'
        }
      }
    })
  }
}
