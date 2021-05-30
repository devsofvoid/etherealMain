import { Message, MessageReaction, TextChannel, MessageEmbed } from 'discord.js'
import { IimgRequest, ImgRequest } from '../utils/db'
import { config } from '../main'
import { Discord, Event } from 'discore.js'
import { resolveMember } from '../utils/util'
import User from '../structures/db/User'
const verifyEmojis = [config.emojis.verification.id, config.emojis.fail.id]
const allowedRoles = [
  config.ids.roles.owner,
  config.ids.roles.orion,
  config.ids.roles.sirius,
  config.ids.roles.astral
]
async function ManageReaction(
  reaction: MessageReaction,
  user: Discord.User,
  post: IimgRequest
) {
  const guild = reaction.message.guild
  switch (reaction.emoji.id) {
    case verifyEmojis[0]:
      if (post) {
        const msgEmbed: { [key: string]: any } =
          reaction.message.embeds[0] || {}
        delete msgEmbed.type
        if (msgEmbed.author) delete msgEmbed.author.proxy_icon_url
        if (msgEmbed.footer) delete msgEmbed.footer.proxy_icon_url
        if (msgEmbed.image) {
          delete msgEmbed.image.width
          delete msgEmbed.image.height
          delete msgEmbed.image.proxy_url
        }
        if (msgEmbed.thumbnail) {
          delete msgEmbed.thumbnail.width
          delete msgEmbed.thumbnail.height
          delete msgEmbed.thumbnail.proxy_url
        }

        const channel = guild?.channels.cache.get(
          config.postSend[post.type]
        ) as TextChannel
        const message = reaction.message
        const embed = new MessageEmbed(msgEmbed)
        const msg = await channel.send(embed).catch(() => {})
        if (!msg) return
        msg.react(config.postEmojis[post.type])
        const member = await resolveMember(post.userID)
        if (!member) return
        const userDB = await User.get(member.id)
        const reward = Math.floor(Math.random() * (60 - 20 + 1)) + 20
        member
          .send(
            new MessageEmbed({
              title: '```Ваш пост успешно опубликован!```',
              description: '> Ты вознагражден(а) за хорошую подборку контента!',
              color: 3092790,
              footer: {
                text: `${
                  member.user.tag || member.user.username
                } • ты получил(а) ${reward} золота`,
                iconURL: member.user.displayAvatarURL({ dynamic: true })
              }
            })
          )
          .catch(() => {})

        message.edit(null, {
          embed: {
            ...msgEmbed,
            footer: {
              text: `Предложение принято пользовтелем ${
                user.tag || user.username
              }`
            }
          }
        })
        await message.reactions.removeAll()
        ImgRequest.deleteOne({ _id: post._id })
        userDB.update({ gold: userDB.gold + reward })
      }
      break
    case verifyEmojis[1]:
      if (post) {
        ImgRequest.deleteOne({ _id: post._id })
        reaction.message.delete().catch(() => {})
      }
      break
  }

  return
}
export class ImgRequestVerify extends Event {
  get options() {
    return { name: 'raw' }
  }

  run(packet: { [key: string]: any }) {
    if (!['MESSAGE_REACTION_ADD'].includes(packet.t)) return

    const channel = this.client.channels.cache.get(
      packet.d.channel_id
    ) as TextChannel
    channel.messages
      .fetch(packet.d.message_id)
      .then(async (message: Message) => {
        const emoji = packet.d.emoji.id
          ? packet.d.emoji.id
          : packet.d.emoji.name
        const reaction = message.reactions.cache.get(emoji)
        if (!reaction) return
        const user = message.guild?.members.cache.get(packet.d.user_id)?.user
        if (!user) return
        if (reaction) reaction.users.cache.set(packet.d.user_id, user)

        if (packet.t === 'MESSAGE_REACTION_ADD') {
          const guild = reaction.message.guild
          const staff = guild?.members.cache.get(user.id)
          if (
            verifyEmojis.some(e => e == reaction.emoji.id) &&
            allowedRoles.some(r => staff?.roles.cache.has(r))
          ) {
            const post = await ImgRequest.findOne({
              msgID: reaction.message.id
            })
            if (post) await ManageReaction(reaction, user, post)
          }
        }
        // if (packet.t === 'MESSAGE_REACTION_REMOVE') {
        //     ManageReaction(reaction, user)
        // }
      })
  }
}
