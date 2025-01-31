package com.tls.edututor.code.codedetail.entity;

import com.tls.edututor.code.codegroup.entity.CodeGroup;
import com.tls.edututor.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "CODE_DETAIL")
@SQLDelete(sql = "UPDATE CODE_DETAIL SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@AllArgsConstructor
public class CodeDetail extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "CODE_DETAIL_ID")
  private Integer codeDetailId;

  @Column(name = "CODE_DETAIL_VALUE")
  private Integer codeDetailValue;

  @Column(name = "COMMON_CODE_NAME")
  private String commonCodeName;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "CODE_GROUP_ID", nullable = false)
  private CodeGroup codeGroup;
}
