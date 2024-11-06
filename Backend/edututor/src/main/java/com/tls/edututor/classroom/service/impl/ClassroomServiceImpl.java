package com.tls.edututor.classroom.service.impl;

import com.tls.edututor.classroom.dto.request.ClassroomRequest;
import com.tls.edututor.classroom.entity.Classroom;
import com.tls.edututor.classroom.repository.ClassroomRepository;
import com.tls.edututor.classroom.service.ClassroomService;
import com.tls.edututor.exam.sharetest.entity.ShareTest;
import com.tls.edututor.exam.sharetest.repository.ShareTestRepository;
import com.tls.edututor.user.dto.response.UserSTResponse;
import com.tls.edututor.user.entity.User;
import com.tls.edututor.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ClassroomServiceImpl implements ClassroomService {

  private final ClassroomRepository classroomRepository;
  private final UserRepository userRepository;
  private final ShareTestRepository shareTestRepository;

  @Override
  public List<UserSTResponse> getAllStudent(Long classroomId, boolean isDeleted) {
    List<User> students = userRepository.findByClassroomIdAndRoleAndIsDeleted(classroomId, "SU", false);

    if (students.isEmpty()) {
      log.info("classroom Id {}의 학생이 없습니다.", classroomId);
      return Collections.emptyList();
    }

    /*return students.stream()
            .map(student -> UserSTResponse.builder()
                    .id(student.getId())
                    .loginId(student.getLoginId())
                    .username(student.getUsername())
                    .build())
            .collect(Collectors.toList());*/

    return students.stream()
            .map(student -> {
              Map<Long, Boolean> studentSharedTests = new HashMap<>();
              List<ShareTest> sharedTests = shareTestRepository.findAllByUserAndIsDeleted(student, false);

              for (ShareTest shareTest : sharedTests) studentSharedTests.put(shareTest.getTestPaper().getId(), true);

              return UserSTResponse.builder()
                      .id(student.getId())
                      .loginId(student.getLoginId())
                      .username(student.getUsername())
                      .isShared(studentSharedTests)
                      .build();
            })
            .collect(Collectors.toList());
  }

  @Override
  public UserSTResponse getStudent(Long classroomId, Long studentId) {
    Classroom classroom = classroomRepository.findById(classroomId).orElseThrow();
    User user = userRepository.findByIdAndClassroomAndIsDeleted(studentId, classroom, false).orElseThrow(() -> new UsernameNotFoundException("없는 학생입니다."));

    UserSTResponse student = UserSTResponse.builder()
            .id(user.getId())
            .loginId(user.getLoginId())
            .username(user.getUsername())
            .build();

    return student;
  }

  @Override
  @Transactional
  public Long save(ClassroomRequest request) {
    Classroom classroom = Classroom.withDto()
            .request(request)
            .build();
    return classroomRepository.save(classroom).getId();
  }
}
