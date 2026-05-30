package com.sigrh.cwa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String role;
    private String username;
    private Long employeId;
    private Long departementId;
}
