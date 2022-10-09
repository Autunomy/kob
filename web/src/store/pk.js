export default {
    state: {
        status: "matching",//当前状态  matching表示匹配界面 playing表示对战界面
        socket: null,//连接
        opponent_username: "",//用户名
        opponent_photo: "",//用户头像
        gamemap:null,
    },
    getters: {},
    mutations: {
        updateSocket(state,socket){
            state.socket = socket;
        },
        updateOpponent(state,opponent) {
            state.opponent_username = opponent.username;
            state.opponent_photo = opponent.photo;
        },
        updateStatus(state,status){
            state.status = status;
        },
        updateGamemap(state,gamemap){
            state.gamemap = gamemap;
        }
    },
    actions: {},
    modules: {}
}