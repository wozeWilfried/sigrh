package com.sigrh.cwa.dto;

import lombok.Data;

@Data
public class LogoutRequest {
    private String accessToken;
    private String refreshToken;
}
