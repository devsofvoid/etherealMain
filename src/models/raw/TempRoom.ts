import { Document, model, Schema } from 'mongoose'

const name = 'temprooms'
export interface ITempRoom {
  userID: string
  roomID: string
  itemID: number
  slots: number
  endTick: number | null
  voiceTime: number
  linkedRoleID: string | null
}
const schema = new Schema({
  userID: { type: String, required: true },
  roomID: { type: String, required: true },
  itemID: { type: Number, required: true },
  slots: { type: Number, required: true },
  endTick: { type: Number, default: null },
  voiceTime: { type: Number, required: true },
  linkedRoleID: { type: String, default: null }
})

export type TempRoomDoc = ITempRoom & Document
const TempRoomModel = model<TempRoomDoc>(name, schema)
export default TempRoomModel
