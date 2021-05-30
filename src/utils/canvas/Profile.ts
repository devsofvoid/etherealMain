import * as moment from 'moment-timezone'
import { GuildMember } from 'discord.js'
import { Canvas, createCanvas, Image } from 'canvas'

import * as Util from '../../utils/util'
import client, { config } from '../../main'
import CanvasUtil from './canvas'
import User from '../../structures/db/User'
import Pair from '../../structures/db/pair/Pair'
import TempRoom from '../../structures/db/tempRoom/TempRoom'

const crownRoles = [
  '739918620796125245',
  '740312785967251467',
  '744794061600456784',
  '741599274579525662',
  '744794551260282911',
  '730204566594912397',
  '747168601940688976',
  '741216969164062792'
]

export default class CanvasProfile {
  constructor(member: GuildMember) {
    return CanvasUtil.images.then(async images => {
      const [profile, pair] = await Promise.all([
        User.get(member.id),
        Pair.find(member.id)
      ])
      const bg = images.profile.background
      const canvas = createCanvas(bg.width, bg.height)
      const ctx = canvas.getContext('2d')
      const fillText = CanvasUtil.fillText.bind(CanvasUtil, ctx)
      // Background
      ctx.drawImage(bg, 0, 0)

      //#region Crown
      if (crownRoles.some(id => member.roles.cache.has(id))) {
        ctx.drawImage(images.profile.dynamic.crown, 0, 0)
      }
      //#endregion

      //#region Avatar
      const avatarURL = member.user.displayAvatarURL({
        size: 256,
        format: 'png',
        dynamic: false
      })
      const avatarImage = await CanvasUtil.loadImage(avatarURL).catch(() => {})
      if (avatarImage) {
        const avatar = await CanvasProfile.makeAvatar(avatarImage)
        ctx.drawImage(avatar, 0, 0)
      }
      //#endregion

      // Static
      ctx.drawImage(images.profile.static, 0, 0)

      //#region Global
      ctx.textBaseline = 'middle'
      //#endregion

      //#region Tag
      ctx.font = '24px profile_bold, globalFonts'
      ctx.textAlign = 'start'
      ctx.fillStyle = '#ebebeb'

      CanvasUtil.shadow(ctx, {
        blur: 8,
        color: 'rgba(0,0,0,0.4)',
        angle: 135,
        distance: 4
      })
      await fillText(member.user.tag, 168, 258, 300)
      //#endregion

      //#region Join date
      const tz = config.meta.defaultTimezone
      const joinMoment = moment(member.joinedTimestamp).tz(tz)
      const joinString = joinMoment.locale('ru-RU').format('L')

      ctx.font = '22px profile_bold, globalFonts'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#e7e7e7'

      CanvasUtil.shadow(ctx)
      await fillText(joinString, 140, 65, 150)
      //#endregion

      const topInfo = await Util.weekActivityTop(member.user)

      //#region Voice Time
      const timeString = Util.parseFilteredTimeString(topInfo.user.voiceTime)

      ctx.font = '22px profile_bold, globalFonts'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#e7e7e7'

      CanvasUtil.shadow(ctx)
      await fillText(timeString, 150, 104, 120)
      //#endregion

      //#region Pair
      if (pair) {
        const pairID = pair.getPair(member.id)
        const pairUser = pairID ? await client.users.fetch(pairID) : null

        if (pairUser) {
          ctx.drawImage(images.profile.dynamic.pair, 0, 0)

          ctx.font = '24px profile_bold, globalFonts'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#ebebeb'
          CanvasUtil.shadow(ctx, {
            blur: 8,
            color: 'rgba(0,0,0,0.4)',
            angle: 120,
            distance: 2
          })
          await fillText(pairUser.username, 170, 402, 140)
        }
      }
      //#endregion

      //#region Voice Position
      const voicePos = topInfo.index + 1
      const voicePosString = voicePos.toLocaleString('ru-RU')

      ctx.font = '22px profile_bold, globalFonts'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#e7e7e7'

      CanvasUtil.shadow(ctx)
      await fillText(voicePosString, 495, 402, 90)
      //#endregion

      //#region Level
      const lvlString = profile.lvl.toLocaleString('ru-RU')
      ctx.font = '54px profile_bold, globalFonts'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#e7e7e7'

      CanvasUtil.shadow(ctx)
      await fillText(lvlString, 523, 77, 70)
      //#endregion

      //#region Reputation
      const rep = profile.reputation
      ctx.drawImage(
        rep < 0 ? images.profile.dynamic.repLow : images.profile.dynamic.rep,
        0,
        0
      )

      ctx.font = '22px profile_bold, globalFonts'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#e7e7e7'

      CanvasUtil.shadow(ctx)
      await fillText(rep.toLocaleString('ru-RU'), 495, 348, 100)
      //#endregion

      //#region Xp
      const need = Math.round(
        1.4 * profile.lvl ** 3 + 3.8 * profile.lvl ** 2 + 2 * (profile.lvl + 30)
      )
      const xpBarWidth = 3.3 * (profile.xp / (need / 100))
      CanvasUtil.roundRect(
        ctx,
        55,
        330,
        xpBarWidth < 20 ? 20 : xpBarWidth,
        37,
        50
      )
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.fill()

      ctx.drawImage(images.profile.dynamic.xp, 0, 0)
      //#endregion

      //#region Clan
      // const clanID = profile.clanID
      // if (typeof clanID === 'string') {
      //   const clan = clanManager.get(clanID)
      //   if (clan) {
      //     const clanIconURL = clan.flag
      //     if (clanIconURL) {
      //       const clanIconImage = await CanvasUtil.loadImage(
      //         clanIconURL
      //       ).catch(() => {})
      //       if (clanIconImage) {
      //         const clanIcon = await CanvasProfile.makeClanIcon(clanIconImage)
      //         ctx.drawImage(clanIcon, 0, 0)
      //       }
      //     }
      //     ctx.drawImage(images.profile.dynamic.clanName, 0, 0)

      //     ctx.font = '24px profile_extrabold, globalFonts'
      //     ctx.textAlign = 'center'
      //     ctx.fillStyle = '#ebebeb'

      //     CanvasUtil.shadow(ctx, {
      //       blur: 8,
      //       color: 'rgba(0,0,0,0.7)',
      //       angle: 120,
      //       distance: 4
      //     })
      //     fillText(clan.name, 218, 213, 200)
      //   }
      // }
      //#endregion

      //#region Inventory
      ctx.textAlign = 'center'
      ctx.fillStyle = '#fff'
      ctx.textBaseline = 'middle'

      const tempRooms = await TempRoom.get(member.id)
      const tempRoom = tempRooms[0]

      const inventoryPromises = [
        [
          0,
          profile.goldChests + profile.itemChests,
          profile.inventory[config.ids.goods.ticket],
          profile.inventory[config.ids.goods.temprole7d],
          profile.inventory[config.ids.goods.temprole30d],
          tempRoom ? tempRoom.slots - config.meta.temproomSlots : 0
        ],
        [
          profile.inventory[config.ids.goods.oneNitro30d],
          profile.inventory[config.ids.goods.hero],
          (profile.inventory[config.ids.goods.temproom7d] || 0) +
            (profile.inventory[config.ids.goods.temproom30d] || 0),
          profile.inventory[config.ids.goods.temprole3d],
          profile.inventory[config.ids.goods.temprole1d],
          profile.inventory[config.ids.goods.loveroomRole]
        ]
      ].map((arr, y) => {
        const promises = arr.map(async (count, x) => {
          ctx.font = '22px profile_bold, globalFonts'
          await fillText(
            (count || 0).toLocaleString('ru-RU'),
            117 + x * 82,
            521 + y * 42,
            25
          )
        })
        return Promise.all(promises)
      })

      await Promise.all(inventoryPromises)
      //#endregion

      //#region Stroke
      ctx.drawImage(images.profile.stroke, 0, 0)
      //#endregion

      return canvas.toBuffer()
    })
  }

  static makeAvatar(avatar: Image) {
    return new this.Avatar(avatar) as Promise<Canvas>
  }

  static makeClanIcon(icon: Image) {
    return new this.ClanIcon(icon) as Promise<Canvas>
  }

  static get ClanIcon() {
    return class CanvasClanIcon {
      constructor(icon: Image) {
        return CanvasUtil.images.then(images => {
          const overlay: Image = images.profile.overlays.clanIcon
          const canvas = createCanvas(overlay.width, overlay.height)
          const ctx = canvas.getContext('2d')

          ctx.drawImage(overlay, 0, 0)
          ctx.globalCompositeOperation = 'source-in'
          ctx.drawImage(icon, 170, 192, 40, 40)

          return canvas
        })
      }
    }
  }

  static get Avatar() {
    return class CanvasAvatar {
      constructor(avatar: Image) {
        return CanvasUtil.images.then(images => {
          const overlay: Image = images.profile.overlays.avatar
          const canvas = createCanvas(overlay.width, overlay.height)
          const ctx = canvas.getContext('2d')

          ctx.drawImage(overlay, 0, 0)
          ctx.globalCompositeOperation = 'source-in'
          ctx.drawImage(avatar, 58, 184, 100, 100)

          return canvas
        })
      }
    }
  }
}
