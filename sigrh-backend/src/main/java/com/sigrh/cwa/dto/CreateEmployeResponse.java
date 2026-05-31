package com.sigrh.cwa.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data @AllArgsConstructor @Builder
public class CreateEmployeResponse {
    private EmployeDTO employe;
    private String tempPassword;
    private String message;
}
