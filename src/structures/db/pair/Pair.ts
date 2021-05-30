import { MongooseFilterQuery } from 'mongoose'

import PairModel, { IPair } from '../../../models/raw/Pair'
import PairRole from './PairRole'
import PairRoom from './PairRoom'
import client from '../../../main'
import { discordRetryHandler } from '../../../utils/util'

export default class Pair {
  static DEFAULT_VALUES: Omit<
    Required<IPair>,
    'roomID' | 'pair' | 'createdTimestamp'
  > = {
    roleCount: 0,
    roleID: null,
    roleEndTick: null,
    voiceTime: 0,
    description: null
  }

  static create(
    data: { roomID: string; pair: [string, string] } & Partial<IPair>
  ) {
    const docData: IPair = Object.assign(
      { createdTimestamp: Date.now() },
      Pair.DEFAULT_VALUES,
      data
    )
    PairModel.create(docData)
  }

  // static async has(id: string) {
  //   const count = await PairModel.findOne({
  //     $or: [{ roomID: id }, { pair: id }]
  //   })
  //     .lean()
  //     .countDocuments()
  //     .exec()
  //   return count > 0
  // }

  static find(id: string) {
    return Pair.fetchOne({ $or: [{ roomID: id }, { pair: id }] })
  }

  static async fetchOne(condition: MongooseFilterQuery<IPair>) {
    const doc = await PairModel.findOne(condition);
    return doc ? new Pair(doc) : null
  }

  static async findMany(condition: MongooseFilterQuery<IPair>) {
    const rawDocs = await PairModel.find(condition);
    return rawDocs.map(doc => new Pair(doc))
  }

  static async delete(id: string) {
    const pair = await this.find(id)
    if (!pair) return
    await pair.delete()
  }

  static async update(id: string, newData: Partial<IPair>) {
    await PairModel.updateOne(
      { $or: [{ roomID: id }, { pair: id }] },
      { $set: newData }
    )
      .lean()
      .exec()
  }

  createdAt: Date
  pair: ReadonlySet<string>
  roomID: string
  roleCount: number = Pair.DEFAULT_VALUES.roleCount
  roleEndTick: number | null = Pair.DEFAULT_VALUES.roleEndTick
  roleID: string | null = Pair.DEFAULT_VALUES.roleID
  voiceTime: number = Pair.DEFAULT_VALUES.voiceTime
  role: PairRole
  room: PairRoom
  description: string | null = Pair.DEFAULT_VALUES.description

  constructor(
    data: {
      createdTimestamp: number
      pair: string[]
      roomID: string
    } & Partial<IPair>
  ) {
    this.createdAt = new Date(data.createdTimestamp)
    this.pair = new Set(data.pair)
    this.roomID = data.roomID
    this.role = new PairRole(this)
    this.room = new PairRoom(this)
    this.patch(data)
  }

  get createdTimestamp() {
    return this.createdAt.getTime()
  }

  getPair(userID: string) {
    return Array.from(this.pair).find(id => id !== userID)
  }

  async delete() {
    this.role.delete()

    discordRetryHandler(`channels/${this.room.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bot ${client.token}` }
    })

    await PairModel.deleteOne({ roomID: this.roomID }).lean().exec()
  }

  update(newData: Partial<IPair>) {
    return Pair.update(this.roomID, Object.assign(this.raw(), newData))
  }

  patch(data: Partial<IPair>) {
    if (data.roleCount != null) this.roleCount = data.roleCount
    if (data.roleEndTick !== undefined) this.roleEndTick = data.roleEndTick
    if (data.roleID !== undefined) this.roleID = data.roleID
    if (data.voiceTime != null) this.voiceTime = data.voiceTime
    if (data.description !== undefined) this.description = data.description
  }

  raw(): Required<IPair> {
    return {
      createdTimestamp: this.createdTimestamp,
      pair: Array.from(this.pair) as [string, string],
      roomID: this.roomID,
      roleCount: this.roleCount,
      roleEndTick: this.roleEndTick,
      roleID: this.roleID,
      voiceTime: this.voiceTime,
      description: this.description
    }
  }
}
