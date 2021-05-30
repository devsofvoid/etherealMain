import {
  User as DiscordUser,
  Guild,
  GuildMember,
  Message,
  MessageEmbedOptions
} from 'discord.js'

import Command from '../structures/Command'
import * as Util from '../utils/util'
import { config } from '../main'

import reactions, { ReactionInfo } from '../reactions'
import ReactionUse from '../models/ReactionUse'
import User from '../structures/db/User'

// const minPrice = config.meta.minReactionPrice
// const maxPrice = config.meta.maxReactionPrice
// const priceDiff = maxPrice - minPrice

function formatReplyTemplate(
  reply: string,
  author: DiscordUser,
  target?: DiscordUser
) {
  return reply
    .replace(/{author}/g, String(author))
    .replace(/{target}/g, String(target || 'Неизвестный'))
}

function reactionCommand(info: ReactionInfo) {
  return class ReactionCommand extends Command {
    get options() {
      return { name: info.name, aliases: info.aliases }
    }

    get cOptions() {
      return { guildOnly: true, global: true }
    }

    async execute(message: Message, args: string[]) {
      const guild = message.guild as Guild

      const packs = {
        [0b0001]: '<:packlove:786918337103659019> Возлюбленный пак',
        [0b0010]: '<:packtarget:786924129495941130> Недружелюбный пак',
        [0b0100]: '<:packnewyear:786919654084837397> Новогодний пак'
      }

      const userDoc = await User.get(message.author.id)
      if ((userDoc.reactionFlags & info.flag) !== info.flag) {
        message.channel.send({
          embed: {
            color: config.meta.defaultColor,
            description: `Для использования данной реакции тебе необходимо приобрести ${
              packs[info.flag as keyof typeof packs] || '???'
            }`,
            footer: {
              text: 'Чтобы купить пак реакций, используй команду !паки'
            }
          }
        })
        return
      }

      const now = Date.now() / 1e3
      await ReactionUse.insertOne({ user_id: message.author.id, date: now })

      await ReactionUse.deleteMany(use => {
        return typeof use.date !== 'number' || use.date < now - 6e2
      })
      const uses = await ReactionUse.filter(use => {
        return use.user_id === message.author.id
      })
      if (uses.length > 2) {
        message.channel
          .send({
            embed: {
              color: config.meta.defaultColor,
              description: '> Подожди сэмпай немного..'
            }
          })
          .then(msg => msg.delete({ timeout: 5e3 }))
          .catch(() => {})
        return
      }

      // if (userDoc.gold < maxPrice) {
      //   message.channel
      //     .send({
      //       embed: {
      //         color: config.meta.defaultColor,
      //         description: 'Недостаточно средств'
      //       }
      //     })
      //     .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
      //     .catch(() => {})
      //   return
      // }

      const targetMember = (await Util.resolveMember(
        args[0],
        guild
      )) as GuildMember
      if (!info.singleReplies && !targetMember) {
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

      let confirmMsg
      const isDouble = info.doubleReplies && targetMember
      if (isDouble) {
        if (message.author.id === targetMember.id) {
          message.channel
            .send({
              embed: {
                color: config.meta.defaultColor,
                description: 'Делай это с другими, а не с самим собой!'
              }
            })
            .then(msg => msg.delete({ timeout: config.meta.errorMsgDeletion }))
            .catch(() => {})
          return
        }

        if (info.confirmReplies && info.confirmReplies.length > 0) {
          const confirmReplies = info.confirmReplies.length
          const confirmReplyIndex = Math.floor(Math.random() * confirmReplies)
          const confirmReplyTemplate = info.confirmReplies[confirmReplyIndex]
          const confirmReply = formatReplyTemplate(
            confirmReplyTemplate,
            message.author,
            (targetMember || {}).user
          )

          confirmMsg = await message.channel
            .send(String(targetMember), {
              embed: {
                color: config.meta.defaultColor,
                title: `Реакция: ${info.name.toLowerCase()}`,
                description: [
                  confirmReply,
                  '',
                  '**Внимательно подумай над предложением!**'
                ].join('\n'),
                footer: {
                  text: message.author.username,
                  icon_url: message.author.displayAvatarURL({ dynamic: true })
                },
                timestamp: Date.now()
              }
            })
            .catch(() => {})
          if (!confirmMsg) return

          const reaction = await Util.confirm(
            confirmMsg,
            targetMember.user,
            3e5
          )
          confirmMsg.reactions.removeAll().catch(() => {})
          if (!reaction) {
            confirmMsg
              .edit('', {
                embed: {
                  color: config.meta.defaultColor,
                  title: `Реакция: ${info.name}`,
                  description: `${targetMember} проигнорировал(-а) тебя`,
                  footer: {
                    text: message.author.username,
                    icon_url: message.author.displayAvatarURL({ dynamic: true })
                  },
                  timestamp: Date.now()
                }
              })
              .catch(() => {})
            return
          }
        }
      }

      // const price = Math.floor(Math.random() * (priceDiff + 1)) + minPrice
      // userDoc.gold -= price
      // userDoc.save()

      const replies = (isDouble
        ? info.doubleReplies
        : info.singleReplies) as string[]

      const image = info.images[Math.floor(Math.random() * info.images.length)]
      const replyTemplate = replies[Math.floor(Math.random() * replies.length)]

      const reply = formatReplyTemplate(
        replyTemplate,
        message.author,
        (targetMember || {}).user
      )

      const embed: MessageEmbedOptions = {
        color: config.meta.defaultColor,
        title: `Реакция: ${info.name.toLowerCase()}`,
        description: reply,
        footer: {
          text: message.author.tag,
          // text: `${message.author.tag} • стоимость ${price.toLocaleString(
          //   'ru-RU'
          // )} ${Util.pluralNoun(price, 'золото', 'золота', 'золота')}`,
          icon_url: message.author.displayAvatarURL({ dynamic: true })
        },
        timestamp: Date.now()
      }

      if (image) embed.image = { url: image }

      if (confirmMsg) confirmMsg.edit('', { embed }).catch(() => {})
      else message.channel.send({ embed }).catch(() => {})
    }
  }
}

const commands = reactions.map(info => reactionCommand(info))

class ReactionsCommand extends Command {
  get options() {
    return { name: 'реакции' }
  }

  async execute(message: Message) {
    // message.author
    //   .send({
    //     embed: {
    //       color: config.meta.defaultColor,
    //       title: '              Все доступные реакции',
    //       // description:
    //       //   '```fix\nРеакция на одного              Реакция для двоих\n```\n```diff\n!смущаюсь — Смущаться    ╏  !погладить @user — приголубить\n!радуюсь — Радоваться    ╏  !кусь @user — укусить \n!сплю — Спать            ╏  !ласкать @user — приласкать\n!курю — Курить           ╏  !любовь @user — пристрастие\n!плачу — Плакать         ╏  !обнять @user — облапить\n!смеюсь — Смееятся       ╏  !поцеловать @user — коснуться\n!пью чай — Пить чай      ╏  !тык @user — дотронуться\n!танец — Танцевать       ╏  !ударить @user — задеть\n!грусть — Грустить       ╏  !выстрелить @user — нажать курок\n!шок — Потрясение        ╏  !лизнуть @user — облизать\n!еда - Кушать еду        ╏  !секс @user — половая активность \n!бежать — Убегать        ╏  !пощечина @user — удар\n```'
    //       fields: [
    //         {
    //           name: 'Реакция на одного',
    //           value: `\`\`\`diff\n${reactions
    //             .filter(r => 'singleReplies' in r)
    //             .map(r => {
    //               return `!${r.name}${
    //                 r.description ? ` — ${r.description}` : ''
    //               }`
    //             })
    //             .join('\n')}\`\`\``,
    //           inline: true
    //         },
    //         {
    //           name: 'Реакции на двоих',
    //           value: `\`\`\`diff\n${reactions
    //             .filter(r => 'doubleReplies' in r)
    //             .map(r => {
    //               return `!${r.name} @user${
    //                 r.description ? ` — ${r.description}` : ''
    //               }`
    //             })
    //             .join('\n')}\`\`\``,
    //           inline: true
    //         }
    //       ]
    //     }
    //   })
    //   .catch(() => {})
    const userDoc = await User.get(message.author.id)

    message.channel
      .send({
        embed: {
          color: config.meta.defaultColor,
          title: 'Список паков реакций',
          description: [
            `${reactions
              .filter(r => {
                return (r.flag & userDoc.reactionFlags) === r.flag
              })
              .map(r => r.name)
              .join(', ')}`,
            `<:packfull:786925354564583425> Весь пак реакций ${
              (userDoc.reactionFlags & 0b0111) === 0b0111
                ? '<a:ET_verification:698596668769173645>'
                : '<a:ET_fail:698590387002146816>'
            }`,
            `<:packlove:786918337103659019> Возлюбленный пак ${
              (userDoc.reactionFlags & 0b0001) === 0b0001
                ? '<a:ET_verification:698596668769173645>'
                : '<a:ET_fail:698590387002146816>'
            }`,
            `<:packtarget:786924129495941130> Недружелюбный пак ${
              (userDoc.reactionFlags & 0b0010) === 0b0010
                ? '<a:ET_verification:698596668769173645>'
                : '<a:ET_fail:698590387002146816>'
            }`,
            `<:packnewyear:786919654084837397> Новогодний пак ${
              (userDoc.reactionFlags & 0b0100) === 0b0100
                ? '<a:ET_verification:698596668769173645>'
                : '<a:ET_fail:698590387002146816>'
            }`,
            '<:smile:786931419250556929>Пак реакций <a:ET_verification:698596668769173645>'
          ].join('\n\n')
        }
      })
      .catch(() => {})
  }
}

class BuyPackCommand extends Command {
  get options() {
    return { name: 'паки' }
  }

  async execute(message: Message) {
    const info: { [K: string]: { flags: number; price: number } } = {
      '786918337103659019': { flags: 0b0001, price: 500 },
      '786924129495941130': { flags: 0b0010, price: 600 },
      '786919654084837397': { flags: 0b0100, price: 700 }
    }

    const userDoc = await User.get(message.author.id)
    info['786925354564583425'] = {
      flags: reactions.reduce((acc, r) => acc | r.flag, 0),
      price:
        [
          ...new Set(
            reactions
              .filter(r => (r.flag & userDoc.reactionFlags) < 1)
              .map(r => {
                const reactionInfo = Object.values(info).find(i => {
                  return i.flags === r.flag
                })
                const { price } = reactionInfo || { price: 0 }
                return price
              })
          )
        ].reduce((acc, price) => acc + price, 0) * 0.9
    }

    const msg = await message.channel
      .send({
        embed: {
          title: '```⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Магазин реакций⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀```',
          // description:
          //   '**№**⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀**Товар**⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀**Цена**\n<:one:749659635241320448><:packfull:786925354564583425>Весь пак реакций ⠀⠀⠀⠀⠀⠀Цена: 2500${resolveEmoji(config.meta.emojis.cy).trim()}\n<:two:749660008882372679><:packlove:786918337103659019>Возлюбленный пак ⠀⠀⠀⠀⠀⠀Цена: 500${resolveEmoji(config.meta.emojis.cy).trim()}\n<:three:749660111693152376><:packtarget:786924129495941130>Недружелюбный пак ⠀⠀⠀⠀⠀⠀Цена: 600${resolveEmoji(config.meta.emojis.cy).trim()}\n<:four:749660320410239083><:packnewyear:786919654084837397>Новогодний пак ⠀⠀⠀⠀⠀⠀Цена: 700${resolveEmoji(config.meta.emojis.cy).trim()}\n<:five:749660509736927282><:smile:786931419250556929>Пак реакций ⠀⠀⠀⠀⠀⠀Доступен всем',
          color: config.meta.defaultColor,
          fields: [
            {
              name: '№⠀⠀⠀⠀⠀⠀⠀⠀Товар',
              value:
                '<:one:749659635241320448><:packfull:786925354564583425>Весь пак реакций\n<:two:749660008882372679><:packlove:786918337103659019> Возлюбленный пак\n<:three:749660111693152376><:packtarget:786924129495941130> Недружелюбный пак\n<:four:749660320410239083><:packnewyear:786919654084837397> Новогодний пак\n<:five:749660509736927282><:smile:786931419250556929> Пак реакций',
              inline: true
            },
            {
              name: 'Цена',
              value: `${info['786925354564583425'].price.toLocaleString(
                'ru-RU'
              )}${Util.resolveEmoji(
                config.meta.emojis.cy
              ).trim()}\n500${Util.resolveEmoji(
                config.meta.emojis.cy
              ).trim()}\n600${Util.resolveEmoji(
                config.meta.emojis.cy
              ).trim()}\n700${Util.resolveEmoji(
                config.meta.emojis.cy
              ).trim()}\nДоступен всем`,
              inline: true
            }
          ]
        }
      })
      .catch(() => null)
    if (!msg) return

    const emojis = [
      Object.keys(info).slice(-1)[0],
      ...Object.keys(info).slice(0, -1)
    ]

    const reaction = await Util.getReaction(msg, emojis, [message.author])
    if (!reaction) return msg.delete().catch(() => {})

    const reactionInfo =
      info[(reaction.emoji.id || reaction.emoji.name) as keyof typeof info]
    if (!reactionInfo) return

    msg.reactions.removeAll().catch(() => {})

    if ((userDoc.reactionFlags & reactionInfo.flags) === reactionInfo.flags) {
      return msg
        .edit({
          embed: {
            color: config.meta.defaultColor,
            description: 'У вас уже имеется данный пак реакций'
          }
        })
        .then(() => msg.delete({ timeout: 5e3 }))
        .catch(() => {})
    }

    if (userDoc.gold < reactionInfo.price) {
      return msg
        .edit({
          embed: {
            color: config.meta.defaultColor,
            description: 'Недостаточно средств'
          }
        })
        .then(() => msg.delete({ timeout: 5e3 }))
        .catch(() => {})
    }

    userDoc.update({
      gold: userDoc.gold - reactionInfo.price,
      reactionFlags: userDoc.reactionFlags | reactionInfo.flags
    })

    msg
      .edit({
        embed: {
          color: config.meta.defaultColor,
          description: 'Пак реакций успешно приобретен!'
        }
      })
      .then(() => msg.delete({ timeout: 5e3 }))
      .catch(() => {})
  }
}

export = [...commands, ReactionsCommand, BuyPackCommand]
