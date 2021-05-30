import TempRoom from './TempRoom'

class RoomLinkedRole {
  constructor(public room: TempRoom) {}

  get id() {
    return this.room.linkedRoleID
  }
}

export default RoomLinkedRole
