import { useState } from 'react';
import UserJoinForm from '../../components/user/UserJoinForm.jsx';
import SchoolSearchModal from '../../components/user/SchoolSearchModal.jsx';
import { checkDuplicateId, teacherJoin } from '../../api/user/user.js';
import { useNavigate } from 'react-router-dom';
import { showALert } from '../../utils/SwalAlert.js';


const initForm = {
  username         : '',
  loginId          : '',
  password         : '',
  confirmPassword  : '',
  email            : '',
  emailDomain      : '',
  emailDomainSelect: '직접 입력', // 기본값 설정
  phoneFirst       : '010',
  phoneMiddle      : '',
  phoneLast        : '',
  birthYear        : '',
  birthMonth       : '',
  birthDay         : '',
  schoolType       : '초등'
};


const initErrors = {
  phoneMiddle     : false,
  phoneLast       : false,
  birthYear       : false,
  birthMonth      : false,
  birthDay        : false,
  birthDateInvalid: false,
  loginId         : false,
  password        : false,
  passwordMatch   : false
};

const initSchool = {
  id        : '',
  type      : '',
  name      : '',
  officeCode: '',
  address   : ''
};

const initClassroom = {
  classroomName: '',
  year         : '',
  grade        : ''
};

const UserJoin = () => {
  const [form, setForm] = useState(initForm);
  const [selectedSchool, setSelectedSchool] = useState(initSchool);
  const [classroom, setClassroom] = useState(initClassroom);
  const [errors, setErrors] = useState(initErrors);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [lastDay, setLastDay] = useState('');

  const navigate = useNavigate();

  /* input 값 변경 */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'loginId') {
      setIsIdChecked(false);
      setIdCheckMessage('');
    }

    if (['loginId', 'password', 'confirmPassword'].includes(name)) validateInput(name, value);
    if (name === 'password' || name === 'confirmPassword') handleconfirmPassword(name, value);
  };

  const validateInput = (name, value) => {
    switch (name) {
      case 'loginId':
        // 값이 있을 때만 검사
        if (value) {
          const loginIdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
          setErrors(prev => ({
            ...prev,
            loginId: !loginIdRegex.test(value)
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            loginId: false
          }));
        }
        break;

      case 'password':
        if (value) {
          const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{9,20}$/;
          setErrors(prev => ({
            ...prev,
            password: !passwordRegex.test(value)
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            password: false
          }));
        }
        break;
    }
  };

  /* 아이디 중복체크 */
  const handleCheckDuplicatedId = async () => {
    if (!form.loginId) {
      const message = { icon: 'warning', title: '아이디를 입력해주세요.' };
      showALert(message);
      return;
    }

    if (form.loginId.length < 6) {
      const message = { icon: 'warning', title: '아이디가 너무 짧습니다.' };
      showALert(message);
      return;
    }

    if (form.loginId.length > 20) {
      const message = { icon: 'warning', title: '아이디를 줄여주세요.' };
      showALert(message);
      return;
    }

    try {
      const result = await checkDuplicateId(form.loginId);
      if (result.status === 204) {
        setIsIdChecked(true);
        setIdCheckMessage('사용 가능한 아이디 입니다.');
      } else {
        setIsIdChecked(false);
        setIdCheckMessage('이미 사용중이 아이디입니다.');
      }

    } catch (error) {
      console.error('Failed to duplicated id check: ', error);
      setIsIdChecked(false);
      setIdCheckMessage('중복 확인 중 오류가 발생하였습니다.');
    }

    try {
      await checkDuplicateId(form.loginId);
    } catch (error) {
      const result = error.response.data;
      if (result.status === 204) {
        setIsIdChecked(true);
        setIdCheckMessage('사용 가능한 아이디 입니다.');
      } else if (result.status === 400) {
        setIsIdChecked(false);
        setIdCheckMessage('이미 사용중이 아이디입니다.');
      } else {
        setIsIdChecked(false);
        setIdCheckMessage('중복 확인 중 오류가 발생하였습니다.');
      }
    }
  };

  /* 이메일 처리 */
  const handleEmailDomain = (e) => {
    const { name, value } = e.target;

    if (name === 'emailDomainSelect') {
      setForm(prev => ({
        ...prev,
        emailDomainSelect: value,
        emailDomain      : value === '직접 입력' ? '' : value
      }));
    } else {
      setForm(prev => ({
        ...prev,
        emailDomain      : value,
        emailDomainSelect: ''
      }));
    }

  };

  /* 숫자만 입력 가능한 필드 처리 */
  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    const hasNonNumber = /[^0-9]/.test(value);
    const numberOnly = value.replace(/[^0-9]/g, '');

    setErrors(prev => ({
      ...prev,
      [name]: hasNonNumber
    }));

    setForm(prev => ({
      ...prev,
      [name]: numberOnly
    }));

    if (name.startsWith('birth')) {
      const formData = {
        ...form,
        [name]: numberOnly
      };

      if (formData.birthYear || formData.birthMonth || formData.birthDay) {
        let year = parseInt(formData.birthYear) || 0;
        let month = parseInt(formData.birthMonth) || 0;
        let day = parseInt(formData.birthDay) || 0;

        if (name === 'birthYear') year = parseInt(numberOnly) || 0;
        if (name === 'birthMonth') month = parseInt(numberOnly) || 0;
        if (name === 'birthDay') day = parseInt(numberOnly) || 0;

        const currentYear = new Date().getFullYear();
        const isValidYear = year >= 1900 && year <= currentYear;
        const isValidMonth = month >= 1 && month <= 12;

        let isValidDay = true;
        if (year > 0 || month > 0 || day > 0) {
          const lastDayOfMonth = new Date(year, month, 0).getDate();
          isValidDay = day >= 1 && day <= lastDayOfMonth;
          setLastDay(lastDayOfMonth);
        }

        // 각각의 유효성 상태를 따로 저장
        setErrors(prev => ({
          ...prev,
          birthYearInvalid : year > 0 && !isValidYear,
          birthMonthInvalid: month > 0 && !isValidMonth,
          birthDayInvalid  : day > 0 && !isValidDay
        }));
      }
    }
  };

  /* 비밀번호 확인 */
  const handleconfirmPassword = (name, value) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{9,20}$/;

    if (name === 'password') {
      if (value) {
        setErrors(prev => ({
          ...prev,
          password     : !passwordRegex.test(value),
          passwordMatch: form.confirmPassword !== '' && value !== form.confirmPassword
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          password     : false,
          passwordMatch: false
        }));
      }
    } else if (name === 'confirmPassword') {
      if (value) {
        setErrors(prev => ({
          ...prev,
          passwordMatch: form.password !== value
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          passwordMatch: false
        }));
      }
    }
  };

  /* input type에 따른 handler 선택 */
  const getInputHandler = (e) => {
    const { name } = e.target;
    if (['phoneMiddle', 'phoneLast', 'birthYear', 'birthMonth', 'birthDay'].includes(name)) {
      return handleNumberInput(e);
    }

    if (['emailDomain', 'emailDomainSelect'].includes(name)) {
      return handleEmailDomain(e);
    }

    return handleInputChange(e);
  };

  /* 회원가입 전 검사 */
  const validateForm = () => {
    // 아이디 중복 체크 확인
    if (!isIdChecked) {
      const message = { icon: 'warning', title: '아이디 중복확인을 해주세요.' };
      showALert(message);
      return false;
    }

    if (form.emailDomainSelect === '직접 입력' && !form.emailDomain) {
      const message = { icon: 'warning', title: '이메일 도메인을 입력해주세요.' };
      showALert(message);
      return false;
    }

    // 패스워드 일치 확인
    if (errors.passwordMatch) {
      const message = { icon: 'warning', title: '비밀번호가 일치하지 않습니다.' };
      showALert(message);
      return false;
    }

    if (form.phoneMiddle.length !== 4 || form.phoneLast.length !== 4) {
      const message = { icon: 'warning', title: '휴대폰 번호를 정확히 입력해주세요.' };
      showALert(message);
      return false;
    }

    // 기타 유효성 검사
    if (errors.loginId || errors.password) {
      const message = { icon: 'warning', title: '입력한 정보를 다시 확인해주세요.' };
      showALert(message);
      return false;
    }

    /* 생년월일 검사 */
    const year = parseInt(form.birthYear);
    const month = parseInt(form.birthMonth);
    const day = parseInt(form.birthDay);

    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      const message = { icon: 'warning', title: '올바른 연도를 입력해주세요.' };
      showALert(message);
      return false;
    }

    if (month < 1 || month > 12) {
      const message = { icon: 'warning', title: '올바른 월을 입력해주세요 (1-12)' };
      showALert(message);
      return false;
    }

    const lastDayOfMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > lastDayOfMonth) {
      const message = { icon: 'warning', title: `올바른 일을 입력해주세요 (1-${lastDayOfMonth}` };
      showALert(message);
      return false;
    }

    if (!form.username || !form.loginId || !form.password || !form.confirmPassword ||
      !form.email || !form.phoneMiddle || !form.phoneLast ||
      !form.birthYear || !form.birthMonth || !form.birthDay ||
      !selectedSchool.name || !classroom.year || !classroom.grade || !classroom.classroomName) {
      const message = { icon: 'warning', title: '모든 필수 항목을 입력해주세요.' };
      showALert(message);
      return false;
    }

    return true;
  };

  const handleSchoolSearch = () => {
    setIsSearchModalOpen(true);
  };

  const handleSelectSchool = (schoolData) => {
    setSelectedSchool(prev => ({
      ...prev,
      id        : schoolData['SD_SCHUL_CODE'],
      type      : schoolData['SCHUL_KND_SC_NM'],
      name      : schoolData['SCHUL_NM'],
      officeCode: schoolData['ATPT_OFCDC_SC_CODE'],
      address   : schoolData['ORG_RDNMA']
    }));

    setIsSearchModalOpen(false);

  };

  const handleCreateClassroom = (e) => {
    const { name, value } = e.target;
    setClassroom(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 전송 전 유효성 검사
    if (!validateForm()) return;

    // 전송
    const submitData = {
      username: form.username,
      loginId : form.loginId,
      password: form.password,
      email   : `${form.email}@${form.emailDomain || form.emailDomainSelect}`,
      phoneNum: `${form.phoneFirst}-${form.phoneMiddle}-${form.phoneLast}`,
      birthDay: `${form.birthYear}-${String(form.birthMonth).padStart(2, '0')}-${String(form.birthDay).padStart(2, '0')}`,

      school: {
        type      : selectedSchool.type,
        name      : selectedSchool.name,
        officeCode: selectedSchool.officeCode,
        address   : selectedSchool.address
      },

      classroom: {
        classroomName: classroom.classroomName,
        year         : classroom.year,
        grade        : classroom.grade
      },
      type     : 'TE'
    };

    try {
      const result = await teacherJoin(submitData);

      if (result.status === 204) {
        navigate('/login');
      }
      if (result.status === 400) {
        const message = { icon: 'warning', title: result.message };
        showALert(message);
      }
    } catch (error) {
      console.error('Failed to join: ', error.response?.data?.message || '회원가입 처리 중 오류가 발생했습니다.');
    }


  };
  return (
    <>
      <UserJoinForm errors={errors} form={form} getInputHandler={getInputHandler}
                    handleSchoolSearch={handleSchoolSearch} selectedSchool={selectedSchool}
                    handleCheckDuplicatedId={handleCheckDuplicatedId} isIdChecked={isIdChecked}
                    idCheckMessage={idCheckMessage}
                    handleCreateClassroom={handleCreateClassroom} classroom={classroom}
                    handleSubmit={handleSubmit} lastDay={lastDay}
      />
      <SchoolSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)}
                         onSelectSchool={handleSelectSchool}
      />
    </>
  );
};

export default UserJoin;