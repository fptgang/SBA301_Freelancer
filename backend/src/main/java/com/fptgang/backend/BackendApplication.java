package com.fptgang.backend;

import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.ZoneOffset;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {

	public static void main(String[] args) {
//		DateTimeUtil.validateTimeZone();
		TimeZone.setDefault(TimeZone.getTimeZone(ZoneOffset.of("+7")));
		SpringApplication.run(BackendApplication.class, args);
	}

}
