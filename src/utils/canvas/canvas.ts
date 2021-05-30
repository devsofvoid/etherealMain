import fetch from 'node-fetch'

import * as path from 'path'

import { GuildMember } from 'discord.js'
import { readFileSync } from 'fs'
import { Image, registerFont, CanvasRenderingContext2D } from 'canvas'
import {
  measureText,
  // fillTextWithTwemoji,
  strokeTextWithTwemoji
} from 'node-canvas-with-twemoji'

import fs from '../fs'
import ObjectUtil from '../object'
// import emojiRegex from '../emojiRegex'
import CanvasBanner from './Banner'
import CanvasProfile from './Profile'
import CanvasBanner2021 from './Banner2021'

const fonts = [
  { path: './assets/banner/font.ttf', family: 'banner', style: 'normal' },
  { path: './assets/profile/font.ttf', family: 'profile', style: 'normal' },
  {
    path: './assets/profile/font_bold.ttf',
    family: 'profile_bold',
    style: 'normal'
  },
  {
    path: './assets/profile/font_black.ttf',
    family: 'profile_black',
    style: 'normal'
  },
  {
    path: './assets/profile/font_extrabold.ttf',
    family: 'profile_extrabold',
    style: 'normal'
  },
  {
    path: './assets/banner2021/font.ttf',
    family: 'banner2021',
    style: 'normal'
  }
]
const globalFonts = fs
  .readdir('./assets/profile/fonts')
  .map(f => `./assets/profile/fonts/${f}`)
globalFonts.forEach(font => {
  registerFont(path.join(process.cwd(), font), { family: 'globalFonts' })
})
fonts.forEach(font => {
  registerFont(path.resolve(process.cwd(), font.path), { family: font.family })
})

class CanvasUtil {
  private static imagePaths = {
    banner: { background: './assets/banner/background.png' },
    profile: {
      static: './assets/profile/static.png',
      dynamic: {
        xp: './assets/profile/dynamic/xp.png',
        rep: './assets/profile/dynamic/rep.png',
        pair: './assets/profile/dynamic/pair.png',
        repLow: './assets/profile/dynamic/rep_low.png',
        clanName: './assets/profile/dynamic/clan_name.png',
        clanIcon: './assets/profile/dynamic/clan_icon.png',
        crown: './assets/profile/dynamic/crown.png'
      },
      overlays: {
        avatar: './assets/profile/overlays/avatar.png',
        clanIcon: './assets/profile/overlays/clan_icon.png'
      },
      background: './assets/profile/background.png',
      // backgrounds: fs
      //   .readdir('./assets/profile/backgrounds')
      //   .map(f => `./assets/profile/backgrounds/${f}`)
      //   .sort((a, b) => {
      //     return (
      //       Number(a.split('/').pop()!.split('.png')[0]) -
      //       Number(b.split('/').pop()!.split('.png')[0])
      //     )
      //   }),
      stroke: './assets/profile/stroke.png'
    },
    banner2021: {
      static: './assets/banner2021/static.png',
      dynamic: {
        minArrow: './assets/banner2021/dynamic/min_arrow.png',
        hourArrow: './assets/banner2021/dynamic/hour_arrow.png'
      }
    }
  }

  private static _images = {
    banner: {
      background: CanvasUtil.loadImage(CanvasUtil.imagePaths.banner.background)
    },
    profile: {
      static: CanvasUtil.loadImage(CanvasUtil.imagePaths.profile.static),
      dynamic: {
        xp: CanvasUtil.loadImage(CanvasUtil.imagePaths.profile.dynamic.xp),
        rep: CanvasUtil.loadImage(CanvasUtil.imagePaths.profile.dynamic.rep),
        pair: CanvasUtil.loadImage(CanvasUtil.imagePaths.profile.dynamic.pair),
        repLow: CanvasUtil.loadImage(
          CanvasUtil.imagePaths.profile.dynamic.repLow
        ),
        clanName: CanvasUtil.loadImage(
          CanvasUtil.imagePaths.profile.dynamic.clanName
        ),
        clanIcon: CanvasUtil.loadImage(
          CanvasUtil.imagePaths.profile.dynamic.clanIcon
        ),
        crown: CanvasUtil.loadImage(CanvasUtil.imagePaths.profile.dynamic.crown)
      },
      overlays: {
        avatar: CanvasUtil.loadImage(
          CanvasUtil.imagePaths.profile.overlays.avatar
        )
      },
      background: CanvasUtil.loadImage(
        CanvasUtil.imagePaths.profile.background
      ),
      stroke: CanvasUtil.loadImage(CanvasUtil.imagePaths.profile.stroke)
      // backgrounds: Promise.all(
      //   CanvasUtil.imagePaths.profile.backgrounds.map(p => {
      //     return CanvasUtil.loadImage(p)
      //   })
      // )
    },
    banner2021: {
      static: CanvasUtil.loadImage(CanvasUtil.imagePaths.banner2021.static),
      dynamic: {
        minArrow: CanvasUtil.loadImage(
          CanvasUtil.imagePaths.banner2021.dynamic.minArrow
        ),
        hourArrow: CanvasUtil.loadImage(
          CanvasUtil.imagePaths.banner2021.dynamic.hourArrow
        )
      }
    }
  }

  public static images = ObjectUtil.promiseAll(CanvasUtil._images)

  public static readImage(src: string) {
    return readFileSync(path.join(process.cwd(), src))
  }

  public static loadImage(src: string | Buffer): Promise<Image> {
    return new Promise(async (resolve, reject) => {
      if (typeof src === 'string') {
        if (src.startsWith('http')) {
          src = await fetch(src).then(res => res.buffer())
        } else {
          src = this.readImage(src)
        }
      }

      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = e => reject(e)
      img.src = src
    })
  }

  public static parseFont(font: string) {
    const match = font.match(/^(\d+)px\s(.+)$/)
    if (!match) return null

    return {
      size: Number(match[1]),
      family: match[2]
    }
  }

  public static font(font: { size: number; family: string }) {
    return `${font.size}px ${font.family}`
  }

  public static fillText(
    ctx: CanvasRenderingContext2D,
    text: string,
    w: number,
    h: number,
    maxWidth?: number
  ) {
    return new Promise(resolve => {
      if (maxWidth) {
        let font = this.parseFont(ctx.font)
        if (font) {
          let measure = this.measureText(ctx, text)

          while (measure.width > maxWidth) {
            font.size -= 1
            ctx.font = this.font(font)
            measure = this.measureText(ctx, text)
          }
        }
      }

      resolve(ctx.fillText(text, w, h))
      // if (emojiRegex.test(text)) resolve(fillTextWithTwemoji(ctx, text, w, h))
      // else resolve(ctx.fillText(text, w, h))
    })
  }

  public static strokeText(
    ctx: CanvasRenderingContext2D,
    text: string,
    w: number,
    h: number
  ) {
    return strokeTextWithTwemoji(ctx, text, w, h)
  }

  public static measureText(ctx: CanvasRenderingContext2D, text: string) {
    return measureText(ctx, text)
  }

  public static shadow(
    ctx: CanvasRenderingContext2D,
    options: {
      blur?: number
      color?: string
      distance?: number
      angle?: number
    } = {}
  ) {
    const blur = options.blur || 0
    const color = options.color || '#000'
    const angle = (options.angle || 0) - 90
    const distance = options.distance || 0

    const x = Math.sin(Math.PI * (angle / 180)) * distance
    const y = Math.cos(Math.PI * (angle / 180)) * distance

    ctx.shadowBlur = blur / 4
    ctx.shadowColor = color
    ctx.shadowOffsetX = x
    ctx.shadowOffsetY = y
  }

  public static makeBanner() {
    return new CanvasBanner() as Promise<Buffer>
  }

  public static makeProfile(member: GuildMember) {
    return new CanvasProfile(member) as Promise<Buffer>
  }
  public static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    if (width < 2 * radius) radius = width / 2
    if (height < 2 * radius) radius = height / 2
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + width, y, x + width, y + height, radius)
    ctx.arcTo(x + width, y + height, x, y + height, radius)
    ctx.arcTo(x, y + height, x, y, radius)
    ctx.arcTo(x, y, x + width, y, radius)
    ctx.closePath()
    return this
  }

  public static makeBanner2021() {
    return new CanvasBanner2021() as Promise<Buffer>
  }
}

export default CanvasUtil
