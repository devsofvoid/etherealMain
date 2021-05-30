import * as moment from 'moment-timezone'
import { Message } from 'discord.js'

import Command, { CommandParams } from '../../structures/Command'
import User from '../../structures/db/User'
import Timer from '../../utils/Timer'

import { config } from '../../main'
import { getReaction, resolveEmoji } from '../../utils/util'

const roles = [
  config.ids.roles.gender.unknown,
  config.ids.roles.gender.male,
  config.ids.roles.gender.female
]

export default class HideGenderCommand extends Command {
  get options() {
    return { name: 'гендер' }
  }

  async execute(message: Message, _args: string[], { member }: CommandParams) {
    const sendError = (content: string) => {
      message.channel
        .send(content)
        .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
        .catch(() => {})
    }

    const profile = await User.get(message.author.id)
    if (profile.hiddenGenderEndDate) {
      message.channel
        .send({
          embed: {
            color: config.meta.defaultColor,
            description: `Активное скрытие гендера до ${moment(
              profile.hiddenGenderEndDate.getTime()
            )
              .tz('Europe/Moscow')
              .locale('ru')
              .format('L HH:mm')}`
          }
        })
        .catch(() => {})
      return
    }

    const genderIndex = roles.findIndex(id => member.roles.cache.has(id))
    if (genderIndex < 0) return sendError('Нечего скрывать!')

    const rates = [
      { emoji: '🟢', duration: 2.592e9, durationStr: '30 дней', price: 2500 },
      { emoji: '🔵', duration: 5.184e9, durationStr: '60 дней', price: 4500 }
    ]

    const msg = await message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: '━・СКРЫТЬ ГЕНДЕР',
          thumbnail: {
            url: message.author.displayAvatarURL({ dynamic: true })
          },
          description: `<@${message.author.id}>, на сколько Вы хотите купить скрытие гендера?`,
          fields: rates.map(r => ({
            name: r.emoji,
            value: `${r.durationStr}. Цена: **${r.price.toLocaleString(
              'ru-RU'
            )}**${resolveEmoji(config.meta.emojis.cy).trim()}`
          }))
        }
      })
      .catch(() => null)
    if (!msg) return

    const reaction = await getReaction(
      msg,
      rates.map(r => r.emoji).concat([config.emojis.fail.id]),
      message.author
    )

    msg.delete().catch(() => {})
    if (!reaction) return

    const emojiID = reaction.emoji.id || reaction.emoji.name
    const choice = rates.find(r => r.emoji === emojiID)
    if (!choice) return

    if (profile.gold < choice.price) return sendError('Недостаточно средств')

    const endDate = Date.now() + choice.duration
    profile.update({
      gold: profile.gold - choice.price,
      hiddenGender: genderIndex as 1 | 2,
      hiddenGenderEndDate: endDate
    })

    Timer.set(endDate, () => member.roles.add(roles[genderIndex]))

    const newRoles = new Set(member.roles.cache.keys())
    roles.forEach(id => newRoles.delete(id))

    member.roles.set(Array.from(newRoles)).catch(() => {})

    message.channel.send({
      embed: {
        color: config.meta.defaultColor,
        thumbnail: { url: member.user.displayAvatarURL({ dynamic: true }) },
        title: `СКРЫТ ГЕНДЕР ━ ${member.displayName}`,
        description: `<a:Shiny_Star:803329355827904574>Поздравляю!\n<:invisible:691712892923543593>Вы успешно скрыли гендер на ${choice.durationStr}.`
      }
    })
  }
}
