package com.itsm.backend.dto;

import com.itsm.backend.domain.enums.NoteType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddNoteRequest {
    @NotBlank private String content;
    private NoteType noteType = NoteType.COMMENT;
    private boolean visibleToEmployee = true;
}
