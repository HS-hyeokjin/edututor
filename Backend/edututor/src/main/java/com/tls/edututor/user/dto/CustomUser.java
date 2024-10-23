package com.tls.edututor.user.dto;

import com.tls.edututor.code.CodeDetailRepository;
import com.tls.edututor.code.codedetail.entity.CodeDetail;
import com.tls.edututor.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
public class CustomUser implements UserDetails {

  private final User user;
  private final CodeDetailRepository codeDetailRepository;

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    if(user.getPhoneNum() != null && user.getBirthDay() != null) {
      CodeDetail te = codeDetailRepository.findRoleById("TE").orElseThrow();
      return List.of(new SimpleGrantedAuthority(te.getId()));
    }else{
      CodeDetail su = codeDetailRepository.findRoleById("SU").orElseThrow();
      return List.of(new SimpleGrantedAuthority(su.getId()));
    }
  }

  @Override
  public String getPassword() {
    return user.getPassword();
  }

  @Override
  public String getUsername() {
    return user.getEmail();
  }

  public Long getId() {
    return user.getId();
  }
}