import { Message, Permissions, SnowflakeUtil, TextChannel } from 'discord.js'

import client from '../main'
import Command from '../structures/Command'
import GiveawayModel from '../models/raw/Giveaway'
import Timer from '../utils/Timer'

import { config } from '../main'
import { endGiveaway } from '../utils/util'

function awaitMessage(channel: TextChannel, userID: string) {
  return new Promise<Message | null>(resolve => {
    const filter = (m: Message) => m.author.id === userID
    const collector = channel.createMessageCollector(filter, {
      idle: 6e4,
      max: 1
    })
    collector.on('collect', message => resolve(message))
    collector.on('end', () => resolve(null))
  })
}

export default class GiveStartCommand extends Command {
  get cOptions() {
    return { suppressArgs: true, allowedPerms: Permissions.FLAGS.ADMINISTRATOR }
  }

  async execute(message: Message, args: string[]) {
    const sendError = (content: any) => {
      message.channel
        .send(content)
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
    }

    let lastMsgPromise: Promise<Message | null>
    const deleteLastMessage = () => {
      lastMsgPromise.then(msg => msg && msg.delete().catch(() => {}))
    }

    const ask = (content: string) => {
      return new Promise<Message | null>(resolve => {
        lastMsgPromise = message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: content
            }
          })
          .catch(() => null)
        return awaitMessage(message.channel as TextChannel, message.author.id)
          .then(msg => (msg && msg.delete().catch(() => {}), resolve(msg)))
          .catch(() => resolve(null))
      }).then(msg => {
        deleteLastMessage()
        if (!msg) return null
        return msg ? msg.content : null
      })
    }

    const text = args.join(' ')

    const reward = await ask('Укажите призы следующим сообщением')
    if (!reward) return

    const winnerCountMsg = await ask(
      'Укажите кол-во участников следующим сообщением'
    )
    if (!winnerCountMsg) return

    const winnerCount = Number(winnerCountMsg.replace(/\D/g, ''))
    if (!Number.isInteger(winnerCount) || winnerCount < 1) {
      return sendError('Некорректное кол-во победителей')
    }

    const timeMsg = await ask('Укажите время следующим сообщением')
    if (!timeMsg) return

    const timeRegex = /^(\d{1,2}:\d{1,2})(?:\s(\d{1,2})\.(\d{1,2})\.(\d{4}))?$/
    const timeMatch = timeRegex.exec(timeMsg)
    if (!timeMatch) return sendError('Некорректное время')

    const utcNow = new Date()
    utcNow.setMinutes(utcNow.getMinutes() + utcNow.getTimezoneOffset())

    const formatTimeComponent = (t: string | number) => `0${t}`.slice(-2)

    const endDate = new Date(
      `${
        timeMatch[2]
          ? Array.from(timeMatch).slice(2).reverse().join('-')
          : `${utcNow.getFullYear()}-${formatTimeComponent(
              utcNow.getMonth() + 1
            )}-${formatTimeComponent(utcNow.getDate())}`
      }T${timeMatch[1].split(':').map(formatTimeComponent).join(':')}+03:00`
    )
    if (endDate.getTime() < Date.now()) {
      endDate.setDate(endDate.getDate() + 1)
    }
    const endTime = endDate.getTime()
    if (Number.isNaN(endTime)) return sendError('Некорректное время')

    const giveawayChannel = client.channels.cache.get(
      config.ids.channels.text.giveaways
    ) as TextChannel
    if (!giveawayChannel) return

    const msg = await giveawayChannel
      .send({
        content: `<@&${config.ids.roles.giveaway}>`,
        embed: {
          color: config.meta.defaultColor,
          title: `РОЗЫГРЫШ・${reward.toUpperCase()}`,
          description: `**${
            text ||
            'Для участия нужно нажать на <:partypopper:827482636863144016> и находиться в любом голосовом канале этого сервера с включенным микрофоном!'
          }**`,
          fields: [
            {
              name: 'Условия:',
              value: `\`\`\`\n${
                text ||
                'Для участия нужно нажать на реакцию и зайти в любой голосовой канал этого сервера с включенным микрофоном.'
              }\`\`\``,
              inline: false
            },
            {
              name: 'Итоги:',
              value: `\`\`\`\n${timeMatch[0]}\`\`\``,
              inline: true
            },
            {
              name: `Победител${winnerCount > 1 ? 'и' : 'ь'}:`,
              value: `\`\`\`\n${winnerCount.toLocaleString('ru-RU')}\`\`\``,
              inline: true
            },
            { name: 'Призы:', value: `\`\`\`\n${reward}\`\`\``, inline: true }
          ],
          image: {
            url:
              'https://media.discordapp.net/attachments/761284646260310106/827486765928808478/konkurs.gif'
          },
          footer: { text: 'Участвовать можно только с 1 аккаунта!' }
        }
      })
      .catch(() => null)
    if (!msg) return
    if (!text) msg.react('827482636863144016').catch(() => {})

    const snowflake = SnowflakeUtil.generate()

    GiveawayModel.create({
      snowflake,
      channel_id: msg.channel.id,
      end_date: Math.floor(endTime / 1e3),
      message_id: msg.id,
      type: text.length < 1 ? 0 : 1,
      winner_count: winnerCount
    })

    Timer.set(endTime, () => endGiveaway(snowflake))
  }
}
