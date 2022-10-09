<template>
    <PlayGround v-if="$store.state.pk.status === 'playing'"/>
    <MatchGround v-if="$store.state.pk.status === 'matching'"/>
</template>

<script>
import PlayGround from "@/components/PlayGround";
import MatchGround from "@/components/MatchGround";
import {onMounted,onUnmounted} from "vue";
import {useStore} from "vuex";

export default {
    name: "PkIndexView",
    components: {
        PlayGround,
        MatchGround,
    },
    setup(){
        const store = useStore();
        const socketUrl = `ws://localhost:3000/websocket/${store.state.user.token}`;


        let socket = null;

        onMounted(() => {

            store.commit("updateOpponent",{
                username:"我的对手",
                photo:"https://cdn.acwing.com/media/article/image/2022/08/09/1_1db2488f17-anonymous.png"
            })

            socket = new WebSocket(socketUrl);

            socket.onopen = () => {
                console.log("connected!");
                store.commit("updateSocket",socket);
            }

            socket.onmessage = (msg) => {
                const data = JSON.parse(msg.data);
                if(data.event === "start-matching"){//匹配成功
                    store.commit("updateOpponent",{
                        username:data.opponent_username,
                        photo:data.opponent_photo,
                    });
                    //匹配成功之后过两秒然后跳转到地图页面
                    setTimeout(() => {
                        store.commit("updateStatus","playing");
                    },2000);
                    store.commit("updateGamemap",data.gamemap);
                }
            }

            socket.onclose = () => {
                console.log("disconnected!");
            }
        })


        onUnmounted(() => {
            socket.close();
            store.commit("updateStatus","matching");
        })
    },

}
</script>

<style scoped>

</style>