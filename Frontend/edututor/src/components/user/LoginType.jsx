import {
  Button,
  Container,
  FormSection,
  LoginTypeBox,
  LoginTypeContainer
} from '../common/UserStyledComponents.js';
import teacher from '../../assets/icon/teacher.png';
import student from '../../assets/icon/student.png';
import { useState } from 'react';

const LoginType = () => {
  const [selectedType, setSelectedType] = useState('teacher');

  return (
    <>
      <Container>
        <FormSection>
          <LoginTypeContainer>
            <LoginTypeBox
              $active={selectedType === 'teacher'}
              $type="teacher"
              onClick={() => setSelectedType('teacher')}
            >
              <div className="image-container">
                <img src={teacher} alt="선생님 이미지" />
              </div>
              <div className="button-container">
                <Button $primary>로그인</Button>
              </div>
            </LoginTypeBox>

            <LoginTypeBox
              $active={selectedType === 'student'}
              $type="student"
              onClick={() => setSelectedType('student')}
            >
              <div className="image-container">
                <img src={student} alt="학생 이미지" />
              </div>
              <div className="button-container">
                <Button $karina>로그인</Button>
              </div>
            </LoginTypeBox>
          </LoginTypeContainer>
        </FormSection>
      </Container>
    </>
  );
};

export default LoginType;