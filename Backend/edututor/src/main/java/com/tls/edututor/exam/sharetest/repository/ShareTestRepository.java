package com.tls.edututor.exam.sharetest.repository;

import com.tls.edututor.exam.sharetest.entity.ShareTest;
import com.tls.edututor.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShareTestRepository extends JpaRepository<ShareTest, Long> {

  List<ShareTest> findAllByUser(User user);

  Optional<ShareTest> findByUserIdAndTestPaperId(Long userId, Long testPaperId);

  long countByTestPaperId(Long testPaperId);

  Page<ShareTest> findByUserId(Long userId, Pageable pageable);

}



