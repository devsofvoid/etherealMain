import { MongoModel, Document, Mongo } from 'discore.js'

import db from '../utils/db'

const colName = 'reaction_uses'

export interface IReactionUse {
  user_id: string
  date: number
}
export type ReactionUseDoc = IReactionUse & Document
db.addModel(colName, {
  user_id: { type: Mongo.Types.String, default: undefined },
  date: { type: Mongo.Types.Number, default: undefined }
})

const ReactionUse = db.getCollection(colName) as MongoModel<ReactionUseDoc>

export default ReactionUse
