package com.kob.matchingsystem.service.impl.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;

@Component
public class MatchingPool extends Thread{
    public static List<Player> players = new ArrayList<>();
    private ReentrantLock lock = new ReentrantLock();
    private static RestTemplate restTemplate;
    private static final String startGameUrl = "http://localhost:3000/pk/start/game/";

    @Autowired
    public void setRestTemplate(RestTemplate restTemplate){
        MatchingPool.restTemplate = restTemplate;
    }

    //添加玩家
    public void addPlayer(Integer userId,Integer rating){
        lock.lock();
        try {
            players.add(new Player(userId,rating,0));
        }finally {
            lock.unlock();
        }
    }

    //删除玩家
    public void removePlayer(Integer userId){
        lock.lock();
        try {
            List<Player> newplayers = new ArrayList<>();
            for (Player player : players) {
                if(!player.getUserId().equals(userId)){
                    newplayers.add(player);
                }
            }
            players = newplayers;
        }finally {
            lock.unlock();
        }
    }

    //将所有玩家的等待时间+1
    private void increaseWaitingTime(){
        for (Player player : players) {
            player.setWaitingTime(player.getWaitingTime()+1);
        }
    }


    //返回a和b的匹配结果
    private void sendResult(Player a,Player b){
        System.out.println("send result" + a + " " + b);

        MultiValueMap<String,String> data = new LinkedMultiValueMap<>();
        data.add("a_id",a.getUserId().toString());
        data.add("b_id",b.getUserId().toString());
        restTemplate.postForObject(startGameUrl,data,String.class);
    }

    //判断两个玩家是否匹配
    private boolean checkMatched(Player a,Player b){
        int ratingDelta = Math.abs(a.getRating() - b.getRating());
        int waitingTime = Math.min(a.getWaitingTime(),b.getWaitingTime());
        return ratingDelta <= waitingTime*10;
    }

    //尝试匹配所有的玩家
    private void matchPlayers(){
        System.out.println("match players" + players.toString());
        //表示用户是否使用过
        boolean[] used = new boolean[players.size()];
        for(int i=0;i<players.size();++i){
            if(used[i]) continue;
            for(int j=i+1;j<players.size();++j){
                if(used[j]) continue;
                Player a = players.get(i),b = players.get(j);
                if(checkMatched(a,b)){
                    used[i] = true;
                    used[j] = true;
                    sendResult(a,b);
                    break;
                }
            }
        }

        List<Player> newPlayers = new ArrayList<>();
        for (int i=0;i<players.size();++i) {
            if(!used[i]){
                newPlayers.add(players.get(i));
            }
        }
        players = newPlayers;
    }


    @Override
    public void run() {
        while(true){
            try {
                Thread.sleep(1000);
                lock.lock();
                try {
                    increaseWaitingTime();
                    matchPlayers();
                }finally {
                    lock.unlock();
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
                break;
            }
        }
    }
}
