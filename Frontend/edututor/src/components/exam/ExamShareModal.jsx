import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { getAllStudent } from '../../api/classroom/classroom.js';
import { Button, Label } from '../common/UserStyledComponents.js';
import { cancelShareTest, createShareTest } from '../../api/test-share/testShare.js';
import { showALert } from '../../utils/SwalAlert.js';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContainer = styled.div`
    background: white;
    border-radius: 8px;
    width: 400px;
    padding: 20px;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    color: #666;
`;

const ModalContent = styled.div`
    display: flex;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
`;

const Section = styled.div`
    width: 100%;
    padding: 20px;

    &:first-child {
        border-right: 1px solid #e0e0e0;
    }
`;

const Title = styled.h2`
    font-size: 1.2rem;
    margin: 0 0 15px 0;
`;

const StudentList = styled.div`
    max-height: 125px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-top: 10px;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const StudentItem = styled.label`
    padding: 10px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:last-child {
        border-bottom: none;
    }

    // 공유된 상태일 때의 스타일

    ${props => props.$isShared && `
        background-color: #f5f9ff;
    `}
    &:hover {
        background: ${props => props.$isShared ? '#e8f1ff' : '#f5f5f5'};
    }
`;

const Checkbox = styled.input`
    margin: 0;
`;

const SectionTitle = styled.h3`
    margin: 0 0 15px 0;
    font-size: 1rem;
    text-align: center;
    font-weight: bold;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 15px;
    width: 100%;

    button {
        flex: 1;
        min-width: 0;
    }
`;

const SharedBadge = styled.span`
    font-size: 0.75rem;
    color: #2196f3;
    margin-left: 8px;
    padding: 2px 6px;
    background: #e3f2fd;
    border-radius: 4px;
`;

const ExamShareModal = ({ isOpen, onClose, selectedTest }) => {
  const [studentInfo, setStudentInfo] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [previouslySharedStudents, setPreviouslySharedStudents] = useState([]);

  const isShared = (studentIsShared, unitId) => {
    return studentIsShared[unitId] || false;
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      const allStudentIds = studentInfo.map(student => {
        const isCurrentlyShared = student.isShared[selectedTest];
        if (isCurrentlyShared) {
          const message = {
            icon             : 'info',
            title            : '이미 공유된 학생이 포함되어 있습니다.',
            text             : '모두 다시 공유하시겠습니까?',
            confirmButtonText: '예',
            showCancelButton : true,
            cancelButtonText : '취소'
          };
          showALert(message)
            .then(result => {
              if (result.isConfirmed) return student.id;
            });
          return null;
        }
        return student.id;
      }).filter(id => id !== null);

      setSelectedStudents(allStudentIds);
    } else {
      setSelectedStudents([]);
    }
  };


  const handleStudentSelect = async (studentId) => {
    const isCurrentlyShared = studentInfo.find(student => student.id === studentId)?.isShared[selectedTest];

    if (isCurrentlyShared && !selectedStudents.includes(studentId)) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else if (isCurrentlyShared && selectedStudents.includes(studentId)) {
      const message = {
        icon             : 'warning',
        title            : '공유를 취소하시겠습니까?',
        text             : '학생의 과제 데이터는 유지됩니다.',
        showCancelButton : true,
        confirmButtonText: '취소하기',
        cancelButtonText : '닫기'
      };
      const result = await showALert(message);

      if (result.isConfirmed) setSelectedStudents(prev => prev.filter(id => id !== studentId));
    } else {
      setSelectedStudents(prev => {
        if (prev.includes(studentId)) return prev.filter(id => id !== studentId);
        else return [...prev, studentId];
      });
    }
  };

  const fetchAllStudent = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('info'));
      const result = await getAllStudent(userInfo.classroom.id);
      const key = Object.keys(result.data)[0];

      setStudentInfo(result.data[key] || []);
    } catch (error) {
      console.error('Failed to fetch students', error);
    }
  };

  const handleShare = async () => {
    const newlySelectedStudents = selectedStudents.filter(id => !previouslySharedStudents.includes(id));
    const studentsToCancel = previouslySharedStudents.filter(id => !selectedStudents.includes(id));

    try {
      await Promise.all([
        newlySelectedStudents.length > 0 && createShareTest({
          unitId   : selectedTest,
          studentId: newlySelectedStudents
        }),

        studentsToCancel.length > 0 && cancelShareTest({
          unitId   : selectedTest,
          studentId: studentsToCancel
        })
      ].filter(Boolean));

      if (newlySelectedStudents.length > 0 || studentsToCancel.length > 0) {
        const message = { icon: 'success', title: '시험 공유 상태가 업데이트되었습니다.' };
        showALert(message);
      }

      onClose();
      setSelectedStudents([]);
      fetchAllStudent();
    } catch (error) {
      console.error('Failed to update test sharing: ', error);

      const message = { icon: 'error', title: '시험 공유 업데이트 중 오류가 발생했습니다.' };
      showALert(message);
    }
  };

  useEffect(() => {
    if (studentInfo.length > 0 && selectedStudents.length === studentInfo.length) setSelectAll(true);
    else setSelectAll(false);
  }, [selectedStudents, studentInfo]);

  useEffect(() => {
    if (isOpen && selectedTest) {
      const sharedStudents = studentInfo
        .filter(student => student.isShared[selectedTest])
        .map(student => student.id);

      setSelectedStudents(sharedStudents);
      setPreviouslySharedStudents(sharedStudents);
    }
  }, [isOpen, selectedTest, studentInfo]);

  useEffect(() => {
    fetchAllStudent();
  }, []);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={() => {
      onClose();
      setSelectedStudents([]);
    }}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <Title>공유하기</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalContent>
          <Section>
            <SectionTitle>과제 공유 대상 선택</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                id="select-all"
              />
              <Label htmlFor="select-all" style={{ margin: '0 5px', fontSize: '13px' }}>전체 선택</Label>
            </div>
            <StudentList>
              {studentInfo.length > 0 ? (
                studentInfo.map(student => {
                  const isAlreadyShared = isShared(student.isShared, selectedTest);
                  return (
                    <StudentItem
                      key={student.id}
                      $isShared={isAlreadyShared}
                    >
                      <Checkbox
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentSelect(student.id)}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {student.username}
                          <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '4px' }}>
                ({student.loginId})
              </span>
                          {isAlreadyShared && (
                            <SharedBadge>
                              공유됨
                            </SharedBadge>
                          )}
                        </div>
                      </div>
                    </StudentItem>
                  );
                })
              ) : (
                <p>학생 목록이 없습니다.</p>
              )}
            </StudentList>
            <ButtonContainer>
              <Button
                onClick={handleShare}
                disabled={!selectedTest || selectedStudents.length === 0 && previouslySharedStudents.length === 0}
                $primary
              >
                공유하기
              </Button>
              <Button $karina onClick={onClose}>
                취소
              </Button>
            </ButtonContainer>
          </Section>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};


export default ExamShareModal;