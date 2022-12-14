import {createRouter, createWebHistory} from 'vue-router'
import PkIndexView from "@/views/pk/PkIndexView";
import RankListIndexView from "@/views/ranklist/RankListIndexView";
import RecordIndexView from "@/views/record/RecordIndexView";
import UserBotIndexView from "@/views/user/bot/UserBotIndexView";
import NotFound from "@/views/error/NotFound";
import UserAccountLoginView from "@/views/user/account/UserAccountLoginView";
import UserAccountRegisterView from "@/views/user/account/UserAccountRegisterView";
import store from "@/store";
import RecordContentView from "@/views/record/RecordContentView";

const routes = [
    {
        path: "/",
        name: "home",
        redirect: "/pk/",
        meta:{
            //是否需要授权
            requestAuth:true,
        }
    },
    {
        path: "/pk/",
        name: "pk_index",
        component: PkIndexView,
        meta:{
            requestAuth:true,
        }
    },
    {
        path: "/record/",
        name: "record_index",
        component: RecordIndexView,
        meta:{
            requestAuth:true,
        }
    },
    {
        path:"/record/:recordId/",
        name: "record_content",
        component: RecordContentView,
        meta:{
            requestAuth:true,
        }
    },
    {
        path: "/ranklist/",
        name: "ranklist_index",
        component: RankListIndexView,
        meta:{
            requestAuth:true,
        }
    },
    {
        path: "/user/bot/",
        name: "user_bot_index",
        component: UserBotIndexView,
        meta:{
            requestAuth:true,
        }
    },
    {
        path:"/user/account/login/",
        name: "user_account_login",
        component: UserAccountLoginView,
        meta:{
            requestAuth:false,
        }
    },
    {
        path:"/user/account/register/",
        name: "user_account_register",
        component: UserAccountRegisterView,
        meta:{
            requestAuth:false,
        }
    },
    {
        path: "/404/",
        name: "404",
        component: NotFound,
        meta:{
            requestAuth:false,
        }
    },
    {
        path:"/:catchAll(.*)",
        redirect:"/404/",
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

//在路由跳转之前执行的函数
router.beforeEach((to,from,next) => {
    //判断是否需要授权 以及当前的登陆状态
    if(to.meta.requestAuth && !store.state.user.is_login){
        next({name:"user_account_login"});//跳转到登陆页面
    }else{
        next();//放行
    }
})

export default router
