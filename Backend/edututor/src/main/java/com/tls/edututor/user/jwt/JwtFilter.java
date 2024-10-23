package com.tls.edututor.user.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
    Cookie[] cookies = request.getCookies();
    String accessToken = "";

    if (cookies == null) {
      filterChain.doFilter(request, response);
      return;
    }

    for (Cookie cookie : cookies) {
      if (cookie.getName().startsWith("access"))
        accessToken = cookie.getValue();
    }


  }
}