package com.kob.matchingsystem.service;

public interface MatchingService {
    String addPlayer(Integer userId,Integer rating,Integer botId);//添加玩家

    String removePlayer(Integer userId);//删除一个玩家
}
