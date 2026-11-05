package com.itsm.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class FeedbackRequest {
    @Min(1) @Max(5)
    private int rating;
    private String comment;
}
