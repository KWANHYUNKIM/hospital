package com.bippobippo.hospital.controller.common;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HomeController {

    @GetMapping("/")
    @ResponseBody
    public String home() {
        return "Welcome to Hospital API";
    }

    @GetMapping("/login")
    @ResponseBody
    public String login() {
        return "Login page - API is working!";
    }
} 