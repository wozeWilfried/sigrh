package com.sigrh.cwa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
    private String username;
    private Long employeId;
}
