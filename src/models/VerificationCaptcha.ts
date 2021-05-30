import { MongoModel, Document, Mongo } from 'discore.js'

import db from '../utils/db'

const colName = 'verification_captchas'

export interface IVerificationCaptcha {
  user_id: string
  message_id: string
  captcha: string
  status: 0 | 1
  date: number
}
export type VerificationCaptchaDoc = IVerificationCaptcha & Document
db.addModel(colName, {
  user_id: { type: Mongo.Types.String, default: undefined },
  message_id: { type: Mongo.Types.String, default: undefined },
  captcha: { type: Mongo.Types.String, default: undefined },
  status: { type: Mongo.Types.Number, default: 0 },
  date: { type: Mongo.Types.Number, default: undefined }
})

const VerificationCaptcha = db.getCollection(
  colName
) as MongoModel<VerificationCaptchaDoc>

export default VerificationCaptcha
