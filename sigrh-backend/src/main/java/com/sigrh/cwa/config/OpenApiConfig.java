package com.sigrh.cwa.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        OpenAPI openAPI = new OpenAPI()
            .info(new Info()
                .title("SIGRH API - Système de Gestion des Ressources Humaines")
                .version("1.0.0")
                .description("API complète pour la gestion des employés, congés, présences et paies")
                .contact(new Contact()
                    .name("SIGRH Team")
                    .email("contact@sigrh.com")));
        
        openAPI.addSecurityItem(new SecurityRequirement().addList("Bearer JWT"));
        
        Components components = new Components();
        components.addSecuritySchemes("Bearer JWT", 
            new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Authentification JWT Bearer"));
        openAPI.setComponents(components);
        
        return openAPI;
    }
}
