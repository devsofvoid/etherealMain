import client, { config } from '../../../main'
import TempRoomModel, {
  ITempRoom,
  TempRoomDoc
} from '../../../models/raw/TempRoom'
import RoomLinkedRole from './RoomLinkedRole'
import { discordRetryHandler } from '../../../utils/util'
import { MongooseFilterQuery } from 'mongoose'

export default class TempRoom {
  static DEFAULT_VALUES: Omit<
    Required<ITempRoom>,
    'userID' | 'roomID' | 'itemID'
  > = {
    slots: config.meta.temproomSlots,
    endTick: null,
    voiceTime: 0,
    linkedRoleID: null
  }

  static create(
    data: {
      userID: string
      roomID: string
      itemID: number
      endTick: number | null
    } & Partial<ITempRoom>
  ) {
    const docData: ITempRoom = Object.assign({}, TempRoom.DEFAULT_VALUES, data)
    TempRoomModel.create(docData)
  }

  // static async has(id: string) {
  //   const count = await TempRoomModel.findOne({ roomID: id })
  //     .lean()
  //     .countDocuments()
  //     .exec()
  //   return count > 0
  // }

  static async get(userID: string) {
    const docs = await TempRoomModel.find({ userID }).lean().exec()
    return docs.map(doc => new TempRoom(doc))
  }

  static find(id: string) {
    return TempRoom.fetchOne({ roomID: id })
  }

  static async fetchOne(condition: MongooseFilterQuery<TempRoomDoc>) {
    const doc = await TempRoomModel.findOne(condition).lean().exec()
    return doc ? new TempRoom(doc) : null
  }

  static async delete(id: string) {
    const tempRoom = await this.find(id)
    if (!tempRoom) return
    await tempRoom.delete()
  }

  static async update(id: string, newData: Partial<ITempRoom>) {
    await TempRoomModel.updateOne({ roomID: id }, { $set: newData })
      .lean()
      .exec()
  }

  id: string
  userID: string
  itemID: number
  endTick: number | null = TempRoom.DEFAULT_VALUES.endTick
  slots: number = TempRoom.DEFAULT_VALUES.slots
  voiceTime: number = TempRoom.DEFAULT_VALUES.voiceTime
  linkedRoleID: string | null
  linkedRole: RoomLinkedRole

  constructor(
    data: {
      userID: string
      roomID: string
      itemID: number
    } & Partial<ITempRoom>
  ) {
    this.id = data.roomID
    this.userID = data.userID
    this.itemID = data.itemID
    this.linkedRoleID = data.linkedRoleID || null
    this.linkedRole = new RoomLinkedRole(this)
    this.patch(data)
  }

  async delete(options?: { timeout?: number }) {
    const handler = async () => {
      discordRetryHandler(`channels/${this.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bot ${client.token}` }
      })
      await TempRoomModel.deleteOne({ roomID: this.id }).lean().exec()
    }

    if (options && options.timeout != null) {
      await new Promise((resolve, reject) => {
        setTimeout(() => handler().then(resolve, reject), options.timeout)
      })
    } else {
      await handler()
    }
  }

  update(newData: Partial<ITempRoom>) {
    return TempRoom.update(this.id, Object.assign(this.raw(), newData))
  }

  patch(data: Partial<ITempRoom>) {
    if (data.endTick !== undefined) this.endTick = data.endTick
    if (data.slots != null) this.slots = data.slots
    if (data.voiceTime != null) this.voiceTime = data.voiceTime
    if (data.linkedRoleID !== undefined) this.linkedRoleID = data.linkedRoleID
  }

  raw(): Required<ITempRoom> {
    return {
      endTick: this.endTick,
      itemID: this.itemID,
      roomID: this.id,
      slots: this.slots,
      userID: this.userID,
      voiceTime: this.voiceTime,
      linkedRoleID: this.linkedRole.id
    }
  }
}
