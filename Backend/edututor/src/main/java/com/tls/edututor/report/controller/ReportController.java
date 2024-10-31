package com.tls.edututor.report.controller;

import com.tls.edututor.common.api.CommonApiResponse;
import com.tls.edututor.report.dto.response.TestPaperDetailResponse;
import com.tls.edututor.report.dto.response.TestPaperResponse2;
import com.tls.edututor.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/report")
public class ReportController {
  private final ReportService reportService;

  @GetMapping
  public CommonApiResponse<Page<TestPaperResponse2>> getTestPapers(Authentication authentication,
                                                                   @PageableDefault Pageable pageable) {
    return CommonApiResponse.createSuccess("리포트 리스트 조회!", reportService.getTestPapers(authentication, pageable));
  }

  @GetMapping("/{testPaperId}")
  public CommonApiResponse<TestPaperDetailResponse> getTestPaperDetail(@PathVariable Long testPaperId) {
    return CommonApiResponse.createSuccess("리포트 상세페이지 조회!", reportService.getTestPaperDetail(testPaperId));
  }
}