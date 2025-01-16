package com.fptgang.backend;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.utility.DockerImageName;

@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

	@Bean
	@ServiceConnection
	public MySQLContainer<?> mysqlContainer() {
		return new MySQLContainer<>(DockerImageName.parse("mysql:latest"))
				.withExposedPorts(3306)
				.withReuse(true);
	}


}
