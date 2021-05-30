import { Document, model, Schema } from 'mongoose'

const name = 'pairs'
export interface IPair {
  createdTimestamp: number
  roomID: string
  pair: [string, string]
  roleCount: number
  roleID: string | null
  roleEndTick: number | null
  voiceTime: number
  description: string | null
}
const schema = new Schema({
  createdTimestamp: { type: Number, required: true },
  roomID: { type: String, required: true },
  pair: { type: Array, required: true },
  roleCount: { type: Number, required: true },
  roleID: { type: String, default: null },
  roleEndTick: { type: Number, default: null },
  voiceTime: { type: Number, required: true },
  description: { type: String, default: null }
})

export type PairDoc = IPair & Document
const PairModel = model<PairDoc>(name, schema)
export default PairModel
