package com.fptgang.backend.controller;

import com.fptgang.backend.config.HirableConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("api/hirable-config")
public class HirableConfigController {

    private final HirableConfig hirableConfig;

    @Autowired
    public HirableConfigController(HirableConfig hirableConfig) {
        this.hirableConfig = hirableConfig;
    }

    @GetMapping("/hirable/config")
    public HirableConfig getHirableConfig() {
        return hirableConfig;  // Send the configuration back as JSON
    }
}
