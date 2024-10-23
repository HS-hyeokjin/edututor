package com.tls.edututor.exam.testpaper.dto.request;

import com.tls.edututor.exam.question.dto.request.QuestionRegisterRequest;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TestPaperRegisterRequest {
  private Long unitId;
  private String title;
  private List<QuestionRegisterRequest> questions;
}
