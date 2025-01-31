package com.tls.edututor.user.dto.request;

import com.tls.edututor.classroom.dto.request.ClassroomRequest;
import com.tls.edututor.classroom.entity.Classroom;
import com.tls.edututor.school.entity.School;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UserSURequest {
  private String username;
  private String loginId;
  private String password;
  private School school;
  private ClassroomRequest classroom;
  private String type;
}
