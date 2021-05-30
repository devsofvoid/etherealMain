import { Document, model, Schema } from 'mongoose'

const name = 'hiddenRoles'
export interface IHiddenRoles {
    userId: string
    roleId: string
}
const schema = new Schema({
    userId: { type: String, required: true },
    roleId: { type: String, required: true }
})

export type HiddenRolesDoc = IHiddenRoles & Document
const HiddenRolesModel = model<HiddenRolesDoc>(name, schema)
export default HiddenRolesModel
