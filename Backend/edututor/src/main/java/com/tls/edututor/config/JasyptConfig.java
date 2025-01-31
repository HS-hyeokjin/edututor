package com.tls.edututor.config;

import com.ulisesbocchio.jasyptspringboot.annotation.EnableEncryptableProperties;
import org.jasypt.encryption.StringEncryptor;
import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableEncryptableProperties
public class JasyptConfig {

  private static final String JASYPT_PASSWORD_ENV_VAR = "JASYPT_ENCRYPTOR_PASSWORD";

  private String PASSWORD;

  public JasyptConfig() {
    this.PASSWORD = System.getenv(JASYPT_PASSWORD_ENV_VAR);
    if (this.PASSWORD == null) {
      throw new IllegalStateException("암호 설정 되지 않음");
    }
  }

  @Bean("jasyptStringEncryptor")
  public StringEncryptor stringEncryptor() {
    PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
    SimpleStringPBEConfig config = new SimpleStringPBEConfig();
    config.setPassword(PASSWORD);
    config.setPoolSize("1");
    config.setAlgorithm("PBEWithMD5AndDES");
    config.setStringOutputType("base64");
    config.setKeyObtentionIterations("1000");
    config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
    encryptor.setConfig(config);
    return encryptor;
  }
}
