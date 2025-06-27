import React, { useState } from 'react';

const SignupForm = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    isDoctor: false,
    hospitalName: '',
    hospitalAddress: '',
    specialization: '',
    verificationMethod: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return false;
    }
    
    if (formData.password.length < 8) {
      setMessage('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }

    if (formData.isDoctor) {
      if (!formData.hospitalName || !formData.hospitalAddress || !formData.verificationMethod) {
        setMessage('병원/클리닉 소유자인 경우 모든 필수 정보를 입력해주세요.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: 실제 API 호출로 변경
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData)
      // });

      // 임시로 성공 메시지 표시
      setTimeout(() => {
        console.log('회원가입 데이터:', formData);
        setMessage('회원가입이 완료되었습니다! 관리자 승인 후 로그인이 가능합니다.');
        setIsSubmitting(false);
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          onToggleForm();
        }, 3000);
      }, 1000);

    } catch (error) {
      setMessage('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">회원가입</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('완료') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">기본 정보</h3>
          
          <div>
            <input
              type="text"
              name="name"
              placeholder="이름"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <input
              type="password"
              name="password"
              placeholder="비밀번호 (8자 이상)"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="비밀번호 확인"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="전화번호"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* 의사 여부 확인 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">의료진 정보</h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isDoctor"
              checked={formData.isDoctor}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              disabled={isSubmitting}
            />
            <span className="ml-2 text-sm text-gray-700">병원/클리닉 소유자이신가요?</span>
          </div>
        </div>

        {/* 의사인 경우 추가 정보 */}
        {formData.isDoctor && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">병원/클리닉 정보</h3>
            
            <div>
              <input
                type="text"
                name="hospitalName"
                placeholder="병원/클리닉 상호명"
                value={formData.hospitalName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required={formData.isDoctor}
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <textarea
                name="hospitalAddress"
                placeholder="병원/클리닉 주소"
                value={formData.hospitalAddress}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                required={formData.isDoctor}
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <input
                type="text"
                name="specialization"
                placeholder="진료과목 (예: 내과, 외과, 소아과 등)"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required={formData.isDoctor}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                신원 확인 방법
              </label>
              <select
                name="verificationMethod"
                value={formData.verificationMethod}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required={formData.isDoctor}
                disabled={isSubmitting}
              >
                <option value="">선택해주세요</option>
                <option value="business_license">사업자등록증</option>
                <option value="medical_license">의료기관 개설신고증</option>
                <option value="doctor_id">의사신분증</option>
                <option value="other">기타 서류</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>안내:</strong> 병원/클리닉 소유자 확인을 위해 관련 서류를 업로드해주세요. 
                승인 후 관리자 권한이 부여됩니다.
              </p>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ${
            isSubmitting 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? '처리 중...' : '회원가입'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={onToggleForm}
            className="text-blue-600 hover:text-blue-700 font-medium transition duration-200"
            disabled={isSubmitting}
          >
            로그인하기
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm; 