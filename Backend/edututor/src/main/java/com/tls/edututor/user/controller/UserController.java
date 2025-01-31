package com.tls.edututor.user.controller;

import com.tls.edututor.common.api.CommonApiResponse;
import com.tls.edututor.user.dto.request.UserSURequest;
import com.tls.edututor.user.dto.request.UserTERequest;
import com.tls.edututor.user.dto.response.UserResponse;
import com.tls.edututor.user.dto.response.UserSUResponse;
import com.tls.edututor.user.dto.response.UserTEResponse;
import com.tls.edututor.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@Slf4j
public class UserController {

  private final UserService userService;

  @GetMapping
  public CommonApiResponse<?> getAllUser(
          Authentication authentication,
          @RequestParam(required = false, defaultValue = "0", value = "page") int page) {
    UserResponse allUser = userService.findAllUser(authentication, page);

    return CommonApiResponse.createSuccess("조회 성공", allUser);
  }

  @GetMapping("/{userId}")
  public CommonApiResponse<?> getUserById(@PathVariable("userId") Long userId) {
    Object user = userService.findUser(userId);

    if (user instanceof UserTEResponse teacher) return CommonApiResponse.createSuccess("선생님 반환", teacher);
    if (user instanceof UserSUResponse student) return CommonApiResponse.createSuccess("학생 반환", student);

    throw new IllegalArgumentException("없는 유저입니다.");
  }

  @GetMapping("/ids/{loginId}")
  public CommonApiResponse<?> checkLoginId(@PathVariable("loginId") String loginId) {
    boolean isAvailable = userService.checkJoinAvailable(loginId);
    if (isAvailable) return CommonApiResponse.createBadRequest("중복된 아이디");
    else return CommonApiResponse.createNoContent("회원가입 가능");
  }

  @PostMapping("/teachers")
  public CommonApiResponse<?> createTeacher(@RequestBody UserTERequest request) {
    userService.saveTeacher(request);
    return CommonApiResponse.createNoContent("회원가입이 완료되었습니다.");
  }

  @PutMapping("/teachers")
  public CommonApiResponse<?> addInfo(@RequestBody UserTERequest request, HttpServletRequest req) {
    userService.updateInfo(request, req);
    return CommonApiResponse.createNoContent("회원가입이 완료되었습니다.");
  }

  @PostMapping("/students")
  public CommonApiResponse<?> createStudent(@RequestBody UserSURequest request, Authentication authentication) {
    userService.saveStudent(request, authentication);
    return CommonApiResponse.createNoContent("학생 등록이 완료되었습니다.");
  }

  @RequestMapping(path = "/students/{studentId}", method = {RequestMethod.PUT, RequestMethod.PATCH})
  public CommonApiResponse<?> updateStudent(@RequestBody UserSURequest request, @PathVariable("studentId") Long id) {
    userService.updateStudent(request, id);
    return CommonApiResponse.createNoContent("학생 수정이 완료되었습니다.");
  }

  @DeleteMapping("/students/{studentId}")
  public CommonApiResponse<?> deleteStudent(@PathVariable("studentId") Long id) {
    userService.deleteStudent(id);
    return CommonApiResponse.createNoContent("학생 계정 삭제가 완료되었습니다.");
  }

  @DeleteMapping("/teachers/{teacherId}")
  public CommonApiResponse<?> deleteTeacher(@PathVariable("teacherId") Long id) {
    userService.deleteTeacher(id);
    return CommonApiResponse.createNoContent("학생 계정 삭제가 완료되었습니다.");
  }

  @PatchMapping("/teachers")
  public CommonApiResponse<?> updateUser(@RequestBody UserTERequest request, Authentication authentication) {
    userService.updateUser(request, authentication);
    return CommonApiResponse.createNoContent("정보 수정이 완료되었습니다.");
  }

}
