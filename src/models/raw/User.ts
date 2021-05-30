import { Document, model, Schema } from 'mongoose'

const name = 'users'
export interface IUser {
  userID: string
  clanID: string | null
  status: string | null
  roles: string[]
  gameroles: boolean
  reactionFlags: number
  hiddenGender: 1 | 2 | null
  hiddenGenderEndDate: number | null

  reputation: number
  repUsers: { [k: string]: number } | {}

  inventory: { [K: string]: number }

  boostCount: number
  boostTimeout: number

  xp: number
  lvl: number

  background: number
  backgrounds: number[]

  goldChests: number
  itemChests: number
  lastChest: number

  gold: number
  crystals: number

  messageCount: number
  voiceTime: number

  loveroomTime: number

  leaveTick: number | null
  lastRepTick: number | null
  lastMsgXpTick: number | null
  lastTimelyTick: number | null
}
const schema = new Schema({
  userID: { type: String, required: true, unique: true },
  clanID: { type: String, default: null },
  status: { type: String, default: null },
  roles: { type: Array, required: true },
  gameroles: { type: Boolean, required: true },
  reactionFlags: { type: Number, required: true },
  hiddenGender: { type: Number, default: null },
  hiddenGenderEndDate: { type: Number, default: null },

  reputation: { type: Number, required: true },
  repUsers: { type: Object, required: true },

  inventory: { type: Object, required: true },

  boostCount: { type: Number, required: true },
  boostTimeout: { type: Number, required: true },

  xp: { type: Number, required: true },
  lvl: { type: Number, required: true },

  background: { type: Number, required: true },
  backgrounds: { type: Array, required: true },

  goldChests: { type: Number, required: true },
  itemChests: { type: Number, required: true },
  lastChest: { type: Number, required: true },

  gold: { type: Number, required: true },
  crystals: { type: Number, required: true },

  messageCount: { type: Number, required: true },
  voiceTime: { type: Number, required: true },
  voiceActivity: { type: Array, required: true },

  loveroomTime: { type: Number, required: true },

  leaveTick: { type: Number, default: null },
  lastRepTick: { type: Number, default: null },
  lastMsgXpTick: { type: Number, default: null },
  lastTimelyTick: { type: Number, default: null }
})

export type UserDoc = IUser & Document
const UserModel = model<UserDoc>(name, schema)
export default UserModel
