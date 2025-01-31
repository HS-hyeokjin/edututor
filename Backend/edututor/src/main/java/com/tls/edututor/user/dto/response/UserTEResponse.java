package com.tls.edututor.user.dto.response;

import com.tls.edututor.classroom.dto.response.ClassroomResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class UserTEResponse {
  private Long id;
  private String loginId;
  private String username;
  private String email;
  private String phoneNum;
  private ClassroomResponse classroom;
  private String role;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private Boolean isDeleted;
}
