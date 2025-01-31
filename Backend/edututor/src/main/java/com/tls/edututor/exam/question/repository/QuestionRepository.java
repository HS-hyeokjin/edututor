package com.tls.edututor.exam.question.repository;

import com.tls.edututor.exam.question.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
  List<Question> findByTestPaperId(Long testPaperId);

  long countByTestPaperId(Long testPaperId);
}