package com.tls.edututor.exam.question.dto.response;

import com.tls.edututor.exam.option.dto.response.OptionResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QuestionResponse {
  private Long id;
  private String content;
  private String commentary;
  private List<OptionResponse> options;

}