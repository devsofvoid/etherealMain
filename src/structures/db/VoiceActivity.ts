import UserModel from '../../models/raw/User'
import VoiceActivityModel, {
  IVoiceActivity
} from '../../models/raw/VoiceActivity'

type Required<O> = { [K in keyof O]: O[K] }

type VACondition = { userID: string; joinTime: number }

export default class VoiceActivity {
  static DEFAULT_VALUES: Omit<
    Required<IVoiceActivity>,
    'user_id' | 'join_time'
  > = {
    leave_time: null
  }

  static async has(condition: VACondition) {
    const count = await VoiceActivityModel.findOne({
      user_id: condition.userID,
      join_time: condition.joinTime
    })
      .lean()
      .countDocuments()
      .exec()
    return count > 0
  }

  static async clean() {
    const docs = await VoiceActivityModel.collection
      .aggregate(
        [
          {
            $addFields: {
              leave_time: { $ifNull: ['$leave_time', new Date().getTime()] }
            }
          },
          {
            $match: {
              $expr: { $lt: ['$leave_time', new Date().getTime() - 6.048e8] }
            }
          },
          { $project: { user_id: 1, join_time: 1, leave_time: 1 } }
        ],
        { allowDiskUse: true }
      )
      .toArray()

    const users = new Map<string, number>()
    for (const doc of docs) {
      const existing = users.get(doc.user_id) || 0
      users.set(doc.user_id, existing + (doc.leave_time - doc.join_time))
    }

    const bulkUpdate = Array.from(users).map(u => ({
      filter: { userID: u[0] },
      update: {
        $set: { voiceTime: { $add: [{ $ifNull: ['$voiceTime', 0] }, u[1]] } }
      }
    }))
    await UserModel.bulkWrite(bulkUpdate.map(updateOne => ({ updateOne })))

    const bulkDelete = docs
      .map(d => ({
        user_id: d.user_id,
        join_time: d.join_time
      }))
      .map(deleteOne => ({ deleteOne }))
    await VoiceActivityModel.bulkWrite(bulkDelete)
  }

  static async get(id: string) {
    await VoiceActivity.clean()
    const voiceActivity = await VoiceActivityModel.find(
      { user_id: id },
      { _id: 0, user_id: 1, join_time: 1, leave_time: 1 }
    )
      .sort({ join_time: 1 })
      .lean()
      .exec()
    return voiceActivity.map(va => new VoiceActivity(va))
  }

  static async getLast(id: string, count: number = 1) {
    await VoiceActivity.clean()
    const voiceActivity = await VoiceActivityModel.find(
      { user_id: id },
      { _id: 0, user_id: 1, join_time: 1, leave_time: 1 }
    )
      .sort({ join_time: -1 })
      .limit(count)
      .lean()
      .exec()
    return voiceActivity.map(va => new VoiceActivity(va))
  }

  static async create(data: { userID: string; joinTime?: number }) {
    const exists = await VoiceActivityModel.findOne({
      user_id: data.userID,
      leave_time: null
    })
    if (exists) return
    await VoiceActivityModel.create({
      user_id: data.userID,
      join_time: typeof data.joinTime === 'number' ? data.joinTime : Date.now(),
      leave_time: null
    })
  }

  static async upsert(condition: VACondition, newData: { leaveTime: number }) {
    const exists = await this.has(condition)
    if (!exists) {
      const doc = Object.assign(
        { user_id: condition.userID, join_time: condition.joinTime },
        VoiceActivity.DEFAULT_VALUES,
        { leave_time: newData.leaveTime }
      )
      return await VoiceActivityModel.create(doc).then(() => {})
    }
    await VoiceActivityModel.updateOne(
      { user_id: condition.userID, join_time: condition.joinTime },
      { $set: { leave_time: newData.leaveTime } }
    )
      .lean()
      .exec()
  }

  userID: string
  rawJoinTime: number
  rawLeaveTime: number | null

  constructor(data: IVoiceActivity) {
    this.userID = data.user_id
    this.rawJoinTime = data.join_time
    this.rawLeaveTime =
      data.leave_time || VoiceActivity.DEFAULT_VALUES.leave_time
  }

  get joinTime() {
    const prevWeekTime = Date.now() - 6.048e8
    if (this.rawJoinTime < prevWeekTime) return prevWeekTime
    return this.rawJoinTime
  }

  get leaveTime() {
    return this.rawLeaveTime == null ? Date.now() : this.rawLeaveTime
  }

  get diff() {
    return Math.max(this.leaveTime - this.joinTime, 0)
  }

  update(newData: { leaveTime: number }) {
    return VoiceActivity.upsert(
      { userID: this.userID, joinTime: this.rawJoinTime },
      Object.assign(this.raw(), newData)
    )
  }

  delete() {
    return VoiceActivityModel.deleteOne({
      user_id: this.userID,
      join_time: this.rawJoinTime
    })
  }

  raw(): Required<IVoiceActivity> {
    return {
      user_id: this.userID,
      join_time: this.rawJoinTime,
      leave_time: this.rawLeaveTime
    }
  }
}
