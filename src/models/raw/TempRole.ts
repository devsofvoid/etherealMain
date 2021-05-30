import { Document, model, Schema } from 'mongoose'

const name = 'temproles'
export interface ITempRole {
  userID: string
  roleID: string
  itemID: number
  endTick: number | null
  soldTimes: number,
  customMembers: string[] | null
  linkedRoomID: string | null
}
const schema = new Schema({
  userID: { type: String, required: true },
  roleID: { type: String, required: true },
  itemID: { type: Number, required: true },
  endTick: { type: Number, default: null },
  soldTimes: { type: Number, default: 0 },
  customMembers: { type: Array, default: null },
  linkedRoomID: { type: String, default: null }
})

export type TempRoleDoc = ITempRole & Document
const TempRoleModel = model<TempRoleDoc>(name, schema)
export default TempRoleModel
