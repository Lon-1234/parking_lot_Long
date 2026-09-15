package com.lon;

import com.baomidou.mybatisplus.generator.FastAutoGenerator;
import com.baomidou.mybatisplus.generator.config.OutputFile;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;

import java.nio.file.Paths;
import java.util.Collections;

public class CodeDb {
    public static void main(String[] args) {
        FastAutoGenerator.create("jdbc:mysql://localhost:3306/long_parking_lite?serverTimezone=UTC&characterEncoding=UTF-8", "root", "1234")
                .globalConfig(builder -> builder
                        .author("Long")
                        .outputDir(Paths.get(System.getProperty("user.dir")) + "/src/main/java")
                        .commentDate("yyyy-MM-dd")
                )
                .packageConfig(builder -> builder
                        .parent("com.lon")
                        .entity("entity")
                        .mapper("mapper")
                        .xml("mapper")   // XML 所在的包（相对 resources）
                        // 关键：单独指定各类文件的输出路径
                        .pathInfo(Collections.singletonMap(
                                        OutputFile.xml,
                                        Paths.get(System.getProperty("user.dir")) + "/src/main/resources/mapper"
                        ))
                )
                .strategyConfig(builder -> builder
                        .controllerBuilder().disable()
                        .serviceBuilder().disable()
                        .entityBuilder()
                        .enableLombok()
                        .enableFileOverride()
                )
                .templateEngine(new FreemarkerTemplateEngine())
                .execute();
    }
}
