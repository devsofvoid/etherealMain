import { Document, model, Schema } from 'mongoose'

const name = 'giveaways'
export interface IGiveaway {
  snowflake: string
  end_date: number
  channel_id: string
  message_id: string
  type: number,
  winner_count: number
}
const schema = new Schema({
  snowflake: { type: String, required: true },
  end_date: { type: Number, required: true },
  channel_id: { type: String, required: true },
  message_id: { type: String, required: true },
  type: { type: Number, required: true },
  winner_count: { type: Number, required: true }
})

export type GiveawayDoc = IGiveaway & Document
const GiveawayModel = model<GiveawayDoc>(name, schema)
export default GiveawayModel
