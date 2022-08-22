import { SocketUser } from "./models/SocketUser";

export var users:{[key:number]:string} = {}
export var socketIdToUserMap:{[key:string]:number} = {}

export const removeUser = (socketId:string) =>{
    const userId:number = socketIdToUserMap[socketId];
    delete users[userId];
    delete socketIdToUserMap[socketId]
    console.log("user removed with id : " + socketId)
}
