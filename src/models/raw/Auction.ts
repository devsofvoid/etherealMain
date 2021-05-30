import { Document, model, Schema } from 'mongoose'

const name = 'auction'
export interface IAuction {
    userId: string
    roleId: string
    price: number
    blackList: string[]
}
const schema = new Schema({
    userId: { type: String, required: true },
    roleId: { type: String, required: true },
    price: { type: Number, required: true },
    blackList: { type: Array, default: [] }
})

export type AuctionDoc = IAuction & Document
const AuctionModel = model<AuctionDoc>(name, schema)
export default AuctionModel
