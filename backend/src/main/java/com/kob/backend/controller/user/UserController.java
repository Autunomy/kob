package com.kob.backend.controller.user;

import com.kob.backend.mapper.UserMapper;
import com.kob.backend.pojo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    UserMapper userMapper;

    @GetMapping("/all")
    public List<User> getAll(){
        List<User> users = userMapper.selectList(null);
        return users;
    }

    @GetMapping("/{userId}")
    public User getUser(@PathVariable Integer userId){
        return userMapper.selectById(userId);
    }

}
