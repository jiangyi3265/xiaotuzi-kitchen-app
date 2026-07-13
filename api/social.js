import { get, post } from '@/utils/request.js'
import config from '@/config/index.js'
const P=config.apiPrefix
export const apiGroupCreate=data=>post(P+'/social/group/create',data)
export const apiGroupJoin=data=>post(P+'/social/group/join',data)
export const apiGroupDetail=id=>get(P+'/social/group/'+id)
export const apiMyGroupRooms=()=>get(P+'/social/group/my')
export const apiGroupQrCode=id=>get(P+'/social/group/qrcode/'+id)
export const apiGroupAddItem=data=>post(P+'/social/group/item',data)
export const apiGroupFinish=id=>post(P+'/social/group/finish/'+id)
export const apiCoupleCreate=data=>post(P+'/social/couple/create',data)
export const apiCoupleJoin=data=>post(P+'/social/couple/join',data)
export const apiCoupleDetail=()=>get(P+'/social/couple')
export const apiCoupleSetItem=data=>post(P+'/social/couple/item',data)
export const apiCoupleAnniversary=data=>post(P+'/social/couple/anniversary',data)
export const apiCoupleUnbind=()=>post(P+'/social/couple/unbind')
export const apiCoupleLeaderboard=()=>get(P+'/social/couple/leaderboard')
export const apiSocialNotifications=()=>get(P+'/social/notifications')
export const apiSocialNotificationsRead=()=>post(P+'/social/notifications/read',{})
