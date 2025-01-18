package com.fptgang.backend;

import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
//		DateTimeUtil.validateTimeZone();
		SpringApplication.run(BackendApplication.class, args);
	}

}
