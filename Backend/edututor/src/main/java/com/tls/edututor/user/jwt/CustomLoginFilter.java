package com.tls.edututor.user.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tls.edututor.user.dto.response.CustomUser;
import com.tls.edututor.user.entity.Refresh;
import com.tls.edututor.user.service.RefreshService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
public class CustomLoginFilter extends UsernamePasswordAuthenticationFilter {

  private final RefreshService refreshService;
  private final AuthenticationManager authenticationManager;
  private final JwtUtil jwtUtil;
  private final ObjectMapper objectMapper;

  @Override
  public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
    try {
      Map map = objectMapper.readValue(request.getInputStream(), Map.class);

      String loginId = map.get("loginId").toString();
      String password = map.get("password").toString();
      String type = map.get("type").toString();
      UsernamePasswordAuthenticationToken token =
              new UsernamePasswordAuthenticationToken(loginId, password, null);

      token.setDetails(Map.of("loginType", type));

      return authenticationManager.authenticate(token);
    } catch (IOException e) {
      throw new AuthenticationServiceException("로그인 요청 처리 중 오류가 발생했습니다.", e);
    }
  }

  @Override
  protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
    CustomUser customUser = (CustomUser) authResult.getPrincipal();
    Map<String, String> details = (Map<String, String>) authResult.getDetails();

    String id = String.valueOf(customUser.getId());
    String loginId = customUser.getLoginId();
    String loginType = details.get("loginType");

    Map<String, Object> claims = new HashMap<>();
    claims.put("id", id);
    claims.put("loginId", loginId);
    claims.put("username", customUser.getUsername());
    claims.put("email", customUser.getEmail());
    List<String> roles = customUser.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());
    claims.put("roles", String.join(",", roles));

    if (!roles.get(0).equals(loginType)) throw new InternalAuthenticationServiceException("AUTH004");

    String accessToken = jwtUtil.createToken("access", claims, 1000 * 60 * 60L); // 1시간
    String refreshToken = jwtUtil.createToken("refresh", claims, 1000 * 60 * 60 * 24L); // 24시간

    addRefreshEntity(loginId, refreshToken, 1000 * 60 * 60 * 24L);

    response.setStatus(HttpServletResponse.SC_OK);
    response.setContentType("application/json; charset=utf-8");

    // 수동으로 Set-Cookie 헤더에 SameSite=None; Secure 설정 추가
    addCookieWithSameSite(response, "access", accessToken, 60 * 60); // accessToken 1시간 유지
    addCookieWithSameSite(response, "refresh", refreshToken, 24 * 60 * 60); // refreshToken 24시간 유지

    Map<String, Object> data = new HashMap<>();
    data.put("classroom", customUser.getClassroom());
    data.put("role", roles.get(0));
    data.put("username", customUser.getUsername());
    response.getWriter().write(objectMapper.writeValueAsString(data));
  }

  private void addCookieWithSameSite(HttpServletResponse response, String name, String value, int maxAge) {
    String cookieValue = String.format("%s=%s; Max-Age=%d; Path=/; HttpOnly; SameSite=None; Secure", name, value, maxAge);
    response.addHeader("Set-Cookie", cookieValue);
  }

  private void addRefreshEntity(String loginId, String refreshToken, long expiredMs) {
    Date date = new Date(System.currentTimeMillis() + expiredMs);

    Refresh refresh = Refresh.builder()
            .loginId(loginId)
            .refreshToken(refreshToken)
            .expiration(date.toString())
            .build();

    refreshService.saveRefreshToken(refresh);
  }

  private Cookie createCookie(String key, String value) {
    Cookie cookie = new Cookie(key, value);
    if (key.startsWith("refresh")) cookie.setMaxAge(24 * 60 * 60); // 토큰을 만들때와 동일하게
    else if (key.startsWith("access")) cookie.setMaxAge(60 * 60);

    cookie.setPath("/");
    cookie.setHttpOnly(true);

    return cookie;
  }

  @Override
  protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType("application/json;charset=UTF-8");
    Map<String, Object> errorResponse = new HashMap<>();

    if (failed instanceof InternalAuthenticationServiceException) {
      String errorMessage = failed.getMessage();
      if (errorMessage != null && errorMessage.contains("AUTH001")) {
        errorResponse.put("code", "AUTH001");
        errorResponse.put("message", "존재하지 않는 아이디입니다.");
      } else if (errorMessage != null && errorMessage.contains("AUTH004")) {
        errorResponse.put("code", "AUTH004");
        errorResponse.put("message", "잘못된 계정 유형입니다.");
      } else {
        errorResponse.put("code", "AUTH003");
        errorResponse.put("message", "로그인에 실패하였습니다.");
      }
    } else if (failed instanceof BadCredentialsException) {
      errorResponse.put("code", "AUTH002");
      errorResponse.put("message", "비밀번호가 일치하지 않습니다.");
    } else {
      errorResponse.put("code", "AUTH003");
      errorResponse.put("message", "로그인에 실패하였습니다.");
    }

    response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
  }
}
