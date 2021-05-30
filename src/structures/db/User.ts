import UserModel, { IUser } from '../../models/raw/User'

export default class User {
  static DEFAULT_VALUES: Omit<Required<IUser>, 'userID'> = {
    clanID: null,
    status: null,
    roles: [],
    gameroles: true,
    reactionFlags: 0,
    hiddenGender: null,
    hiddenGenderEndDate: null,

    reputation: 0,
    repUsers: {},

    inventory: {},

    boostCount: 0,
    boostTimeout: 0,

    xp: 0,
    lvl: 1,

    background: 0,
    backgrounds: [],

    goldChests: 0,
    itemChests: 0,
    lastChest: 0,

    gold: 0,
    crystals: 0,

    messageCount: 0,
    voiceTime: 0,

    loveroomTime: 0,

    leaveTick: null,
    lastRepTick: null,
    lastMsgXpTick: null,
    lastTimelyTick: null
  }

  static async has(id: string) {
    const count = await UserModel.findOne({ userID: id })
      .lean()
      .countDocuments()
      .exec()
    return count > 0
  }

  static async get(id: string) {
    const existing = await this.find(id)
    if (existing) return existing
    const doc: IUser = { userID: id, ...User.DEFAULT_VALUES }
    return new User(doc)
  }

  static async find(id: string) {
    const existing = await UserModel.findOne({ userID: id }).lean().exec()
    if (!existing) return null
    return new User(existing)
  }

  static async delete(id: string) {
    return await UserModel.deleteOne({ userID: id }).lean().exec()
  }

  static async upsert(id: string, newData: Partial<IUser>) {
    const exists = await this.has(id)
    if (!exists) {
      const doc = Object.assign({ userID: id }, User.DEFAULT_VALUES, newData)
      return await UserModel.create(doc).then(() => {})
    }
    await UserModel.updateOne({ userID: id }, { $set: newData }).lean().exec()
  }

  id: string
  clanID: string | null = User.DEFAULT_VALUES.clanID
  status: string | null = User.DEFAULT_VALUES.status
  roles: string[] = User.DEFAULT_VALUES.roles
  gameroles: boolean = User.DEFAULT_VALUES.gameroles
  reactionFlags: number = User.DEFAULT_VALUES.reactionFlags
  hiddenGender: 1 | 2 | null = User.DEFAULT_VALUES.hiddenGender
  hiddenGenderEndDate: Date | null = User.DEFAULT_VALUES
    .hiddenGenderEndDate as null

  reputation: number = User.DEFAULT_VALUES.reputation
  repUsers: { [k: string]: number } = User.DEFAULT_VALUES.repUsers

  inventory: { [K: string]: number } = User.DEFAULT_VALUES.inventory

  boostCount: number = User.DEFAULT_VALUES.boostCount
  boostTimeout: number = User.DEFAULT_VALUES.boostTimeout

  xp: number = User.DEFAULT_VALUES.xp
  lvl: number = User.DEFAULT_VALUES.lvl

  background: number = User.DEFAULT_VALUES.background
  backgrounds: number[] = User.DEFAULT_VALUES.backgrounds

  goldChests: number = User.DEFAULT_VALUES.goldChests
  itemChests: number = User.DEFAULT_VALUES.itemChests
  lastChest: number = User.DEFAULT_VALUES.lastChest

  gold: number = User.DEFAULT_VALUES.gold
  crystals: number = User.DEFAULT_VALUES.crystals

  messageCount: number = User.DEFAULT_VALUES.messageCount
  voiceTime: number = User.DEFAULT_VALUES.voiceTime

  loveroomTime: number = User.DEFAULT_VALUES.loveroomTime

  leaveTick: number | null = User.DEFAULT_VALUES.leaveTick
  lastRepTick: number | null = User.DEFAULT_VALUES.lastRepTick
  lastMsgXpTick: number | null = User.DEFAULT_VALUES.lastMsgXpTick
  lastTimelyTick: number | null = User.DEFAULT_VALUES.lastTimelyTick

  constructor(data: { userID: string } & Partial<IUser>) {
    this.id = data.userID
    this.patch(data)
  }

  delete() {
    return User.delete(this.id)
  }

  update(newData: Partial<IUser>) {
    this.patch(newData)
    return User.upsert(this.id, this.raw())
  }

  fetch() {
    return User.get(this.id).then(data => this.patch(data.raw()))
  }

  patch(data: Partial<IUser>) {
    if (data.clanID !== undefined) this.clanID = data.clanID
    if (data.status !== undefined) this.status = data.status
    if (data.roles != undefined) this.roles = data.roles
    if (data.gameroles != undefined) this.gameroles = data.gameroles
    if (data.reactionFlags !== undefined) {
      this.reactionFlags = data.reactionFlags
    }
    if (data.reputation != undefined) this.reputation = data.reputation
    if (data.repUsers != undefined) this.repUsers = data.repUsers
    if (data.inventory != undefined) this.inventory = data.inventory
    if (data.boostCount != undefined) this.boostCount = data.boostCount
    if (data.boostTimeout != undefined) this.boostTimeout = data.boostTimeout
    if (data.xp != undefined) this.xp = data.xp
    if (data.lvl != undefined) this.lvl = data.lvl
    if (data.background != undefined) this.background = data.background
    if (data.backgrounds != undefined) this.backgrounds = data.backgrounds
    if (data.goldChests != undefined) this.goldChests = data.goldChests
    if (data.itemChests != undefined) this.itemChests = data.itemChests
    if (data.lastChest != undefined) this.lastChest = data.lastChest
    if (data.gold != undefined) this.gold = data.gold
    if (data.crystals != undefined) this.crystals = data.crystals
    if (data.messageCount != undefined) this.messageCount = data.messageCount
    if (data.voiceTime != undefined) this.voiceTime = data.voiceTime
    if (data.loveroomTime != undefined) this.loveroomTime = data.loveroomTime
    if (data.leaveTick !== undefined) this.leaveTick = data.leaveTick
    if (data.lastRepTick !== undefined) this.lastRepTick = data.lastRepTick
    if (data.lastMsgXpTick !== undefined) {
      this.lastMsgXpTick = data.lastMsgXpTick
    }
    if (data.lastTimelyTick !== undefined) {
      this.lastTimelyTick = data.lastTimelyTick
    }
    if (data.hiddenGender !== undefined) this.hiddenGender = data.hiddenGender
    if (data.hiddenGenderEndDate !== undefined) {
      this.hiddenGenderEndDate =
        data.hiddenGenderEndDate != null
          ? new Date(data.hiddenGenderEndDate)
          : null
    }
  }

  raw(): Required<IUser> {
    return {
      userID: this.id,
      clanID: this.clanID,
      status: this.status,
      roles: this.roles,
      gameroles: this.gameroles,
      reactionFlags: this.reactionFlags,
      hiddenGender: this.hiddenGender,
      hiddenGenderEndDate:
        this.hiddenGenderEndDate && this.hiddenGenderEndDate.getTime(),

      reputation: this.reputation,
      repUsers: this.repUsers,

      inventory: this.inventory,

      boostCount: this.boostCount,
      boostTimeout: this.boostTimeout,

      xp: this.xp,
      lvl: this.lvl,

      background: this.background,
      backgrounds: this.backgrounds,

      goldChests: this.goldChests,
      itemChests: this.itemChests,
      lastChest: this.lastChest,

      gold: this.gold,
      crystals: this.crystals,

      messageCount: this.messageCount,
      voiceTime: this.voiceTime,

      loveroomTime: this.loveroomTime,

      leaveTick: this.leaveTick,
      lastRepTick: this.lastRepTick,
      lastMsgXpTick: this.lastMsgXpTick,
      lastTimelyTick: this.lastTimelyTick
    }
  }
}
