import { Document, model, Schema } from 'mongoose'

const name = 'voice_activities'
export interface IVoiceActivity {
  user_id: string
  join_time: number
  leave_time: number | null
}
const schema = new Schema({
  user_id: { type: String, required: true },
  join_time: { type: Number, required: true },
  leave_time: { type: Number, default: null }
})

export type VoiceActivityDoc = IVoiceActivity & Document
const VoiceActivityModel = model<VoiceActivityDoc>(name, schema)
export default VoiceActivityModel
