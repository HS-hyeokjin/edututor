import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { publicApi } from '../../api/axios';
import '../../assets/css/CourseDetailPage.css';
import { showALert } from '../../utils/SwalAlert.js';
import Loading from '../../components/common/Loading.jsx';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    publicApi.get(`/course/${courseId}`)
      .then((response) => {
        setCourseData(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setError('데이터를 가져오는 데 실패했습니다.');
        setLoading(false);
      });
  }, [courseId]);

  const registerMaterial = (unitId) => {
    navigate(`/admin/create-material?unitId=${unitId}`);
  };

  const viewMaterial = (materialId) => {
    navigate(`/admin/materials/${materialId}`);
  };

  const registerTestPaper = (unitId) => {
    navigate(`/admin/create-test-paper?unitId=${unitId}`);
  };

  const viewTestPaper = (testPaper) => {
    if (testPaper && (testPaper.id || testPaper.testPaperId)) {
      const testPaperId = testPaper.id || testPaper.testPaperId;
      navigate(`/admin/test-paper-detail/${testPaperId}`);
    } else {
      const message = { icon: 'warning', title: '시험지 ID가 존재하지 않습니다.' };
      showALert(message);
    }
  };

  const goToEditPage = () => {
    navigate(`/admin/course/edit/${courseId}`);
  };

  if (loading) return <p><Loading /></p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="course-detail-page">
      <h1>과정 상세</h1>
      {courseData && (
        <div>
          <h3>과정명 : {courseData.courseName || 'N/A'}</h3>


          {courseData.sections.length > 0 ? (
            courseData.sections.map((section) => (
              <div key={section.sectionId} className="section">
                <p>단원명: {section.content}</p>

                {section.units.length > 0 ? (
                    section.units.map((unit) => (
                        <div key={unit.unitId} className="unit">
                          <p>차수: {unit.content}</p>

                          {/* 버튼들을 하단에 배치하기 위한 컨테이너 */}
                          <div className="buttons-container">
                            {unit.materials.length > 0 ? (
                                unit.materials.map((material) => (
                                    <button
                                        key={material.materialId}
                                        onClick={() => viewMaterial(material.materialId)}
                                        className="view-button"
                                    >
                                      학습자료 보기
                                    </button>
                                ))
                            ) : (
                                <button onClick={() => registerMaterial(unit.unitId)} className="add-button">
                                  학습자료 등록
                                </button>
                            )}

                            {unit.testPaper ? (
                                <button onClick={() => viewTestPaper(unit.testPaper)} className="view-button">
                                  시험지 보기
                                </button>
                            ) : (
                                <button onClick={() => registerTestPaper(unit.unitId)} className="add-button">
                                  시험지 등록
                                </button>
                            )}
                          </div>
                        </div>
                    ))
                ) : (
                    <p className="no-data">차수 없음</p>
                )}

              </div>
            ))
          ) : (
            <p className="no-data">단원이 없음</p>
          )}
          <button onClick={goToEditPage} className="edit-button">수정하기</button>

        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
