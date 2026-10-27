package com.daypilot.settings;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateSettingsRequest(
        @NotBlank @Size(max = 64) String timezone) {
}