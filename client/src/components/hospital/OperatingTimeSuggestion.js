import React, { useState, useEffect } from "react";
import { getApiUrl } from '../../utils/api';

const OperatingTimeSuggestion = ({ hospitalId, hospitalName, currentTimes }) => {
  const [showForm, setShowForm] = useState(false);
  const [suggestion, setSuggestion] = useState({
    reason: "",
    suggestedTimes: {
      trmtMonStart: "",
      trmtMonEnd: "",
      trmtTueStart: "",
      trmtTueEnd: "",
      trmtWedStart: "",
      trmtWedEnd: "",
      trmtThuStart: "",
      trmtThuEnd: "",
      trmtFriStart: "",
      trmtFriEnd: "",
      trmtSatStart: "",
      trmtSatEnd: "",
      noTrmtSun: "휴무",
      noTrmtHoli: "휴무",
      lunchWeek: ""
    }
  });

  // currentTimes가 times 객체 안에 있을 수 있으므로 처리
  const times = currentTimes?.times || currentTimes || {};

  // 컴포넌트가 마운트되거나 currentTimes가 변경될 때 제안된 영업시간을 현재 값으로 초기화
  useEffect(() => {
    if (times) {
      setSuggestion(prev => ({
        ...prev,
        suggestedTimes: {
          trmtMonStart: formatTimeForInput(times.trmtMonStart) || "",
          trmtMonEnd: formatTimeForInput(times.trmtMonEnd) || "",
          trmtTueStart: formatTimeForInput(times.trmtTueStart) || "",
          trmtTueEnd: formatTimeForInput(times.trmtTueEnd) || "",
          trmtWedStart: formatTimeForInput(times.trmtWedStart) || "",
          trmtWedEnd: formatTimeForInput(times.trmtWedEnd) || "",
          trmtThuStart: formatTimeForInput(times.trmtThuStart) || "",
          trmtThuEnd: formatTimeForInput(times.trmtThuEnd) || "",
          trmtFriStart: formatTimeForInput(times.trmtFriStart) || "",
          trmtFriEnd: formatTimeForInput(times.trmtFriEnd) || "",
          trmtSatStart: formatTimeForInput(times.trmtSatStart) || "",
          trmtSatEnd: formatTimeForInput(times.trmtSatEnd) || "",
          noTrmtSun: times.noTrmtSun || "휴무",
          noTrmtHoli: times.noTrmtHoli || "휴무",
          lunchWeek: times.lunchWeek || ""
        }
      }));
    }
  }, [times]);

  const handleInputChange = (field, value) => {
    setSuggestion(prev => ({
      ...prev,
      suggestedTimes: {
        ...prev.suggestedTimes,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/api/hospital/suggest-operating-time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hospitalId,
          hospitalName,
          suggestion: suggestion.reason,
          // 현재 영업시간 데이터
          trmtMonStart: times?.trmtMonStart || "",
          trmtMonEnd: times?.trmtMonEnd || "",
          trmtTueStart: times?.trmtTueStart || "",
          trmtTueEnd: times?.trmtTueEnd || "",
          trmtWedStart: times?.trmtWedStart || "",
          trmtWedEnd: times?.trmtWedEnd || "",
          trmtThuStart: times?.trmtThuStart || "",
          trmtThuEnd: times?.trmtThuEnd || "",
          trmtFriStart: times?.trmtFriStart || "",
          trmtFriEnd: times?.trmtFriEnd || "",
          trmtSatStart: times?.trmtSatStart || "",
          trmtSatEnd: times?.trmtSatEnd || "",
          noTrmtSun: times?.noTrmtSun || "휴무",
          noTrmtHoli: times?.noTrmtHoli || "휴무",
          lunchWeek: times?.lunchWeek || "",
          // 제안된 영업시간 데이터
          suggestedTrmtMonStart: formatTimeForServer(suggestion.suggestedTimes.trmtMonStart),
          suggestedTrmtMonEnd: formatTimeForServer(suggestion.suggestedTimes.trmtMonEnd),
          suggestedTrmtTueStart: formatTimeForServer(suggestion.suggestedTimes.trmtTueStart),
          suggestedTrmtTueEnd: formatTimeForServer(suggestion.suggestedTimes.trmtTueEnd),
          suggestedTrmtWedStart: formatTimeForServer(suggestion.suggestedTimes.trmtWedStart),
          suggestedTrmtWedEnd: formatTimeForServer(suggestion.suggestedTimes.trmtWedEnd),
          suggestedTrmtThuStart: formatTimeForServer(suggestion.suggestedTimes.trmtThuStart),
          suggestedTrmtThuEnd: formatTimeForServer(suggestion.suggestedTimes.trmtThuEnd),
          suggestedTrmtFriStart: formatTimeForServer(suggestion.suggestedTimes.trmtFriStart),
          suggestedTrmtFriEnd: formatTimeForServer(suggestion.suggestedTimes.trmtFriEnd),
          suggestedTrmtSatStart: formatTimeForServer(suggestion.suggestedTimes.trmtSatStart),
          suggestedTrmtSatEnd: formatTimeForServer(suggestion.suggestedTimes.trmtSatEnd),
          suggestedNoTrmtSun: suggestion.suggestedTimes.noTrmtSun,
          suggestedNoTrmtHoli: suggestion.suggestedTimes.noTrmtHoli,
          suggestedLunchWeek: suggestion.suggestedTimes.lunchWeek
        }),
      });

      if (response.ok) {
        alert('영업시간 수정 제안이 성공적으로 제출되었습니다!');
        setShowForm(false);
        setSuggestion({
          reason: "",
          suggestedTimes: {
            trmtMonStart: "",
            trmtMonEnd: "",
            trmtTueStart: "",
            trmtTueEnd: "",
            trmtWedStart: "",
            trmtWedEnd: "",
            trmtThuStart: "",
            trmtThuEnd: "",
            trmtFriStart: "",
            trmtFriEnd: "",
            trmtSatStart: "",
            trmtSatEnd: "",
            noTrmtSun: "휴무",
            noTrmtHoli: "휴무",
            lunchWeek: ""
          }
        });
      } else {
        alert('제안 제출에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('제안 제출 중 오류가 발생했습니다.');
    }
  };

  const formatTimeForInput = (timeStr) => {
    if (!timeStr || timeStr === "-" || timeStr === "정보 없음") return "";
    const strTime = String(timeStr);
    const paddedTime = strTime.padStart(4, "0");
    return `${paddedTime.slice(0, 2)}:${paddedTime.slice(2)}`;
  };

  const formatTimeForServer = (timeStr) => {
    if (!timeStr) return "";
    return timeStr.replace(":", "");
  };

  const timeFields = [
    { day: "월요일", start: "trmtMonStart", end: "trmtMonEnd" },
    { day: "화요일", start: "trmtTueStart", end: "trmtTueEnd" },
    { day: "수요일", start: "trmtWedStart", end: "trmtWedEnd" },
    { day: "목요일", start: "trmtThuStart", end: "trmtThuEnd" },
    { day: "금요일", start: "trmtFriStart", end: "trmtFriEnd" },
    { day: "토요일", start: "trmtSatStart", end: "trmtSatEnd" },
  ];

  return (
    <div className="mt-2">
      <button
        onClick={() => setShowForm(!showForm)}
        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
      >
        {showForm ? "취소" : "영업시간 수정 제안"}
      </button>

      {showForm && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-sm mb-3 text-gray-700">
            영업시간 수정 제안
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 현재 영업시간 표시 */}
            <div>
              <h5 className="text-xs font-medium text-gray-600 mb-2">현재 영업시간</h5>
              <div className="text-xs text-gray-500 space-y-1">
                {timeFields.map(({ day, start, end }) => (
                  <div key={day} className="flex justify-between">
                    <span>{day}:</span>
                    <span>
                      {formatTimeForInput(times[start])} ~ {formatTimeForInput(times[end])}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span>일요일:</span>
                  <span>{times?.noTrmtSun || "휴무"}</span>
                </div>
                <div className="flex justify-between">
                  <span>점심시간:</span>
                  <span>{times?.lunchWeek || "정보 없음"}</span>
                </div>
              </div>
            </div>

            {/* 제안된 영업시간 입력 */}
            <div>
              <h5 className="text-xs font-medium text-gray-600 mb-2">제안된 영업시간</h5>
              {timeFields.map(({ day, start, end }) => (
                <div key={day} className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-600 w-12">{day}</span>
                  <input
                    type="time"
                    value={suggestion.suggestedTimes[start]}
                    onChange={(e) => handleInputChange(start, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 w-20"
                  />
                  <span className="text-xs text-gray-500">~</span>
                  <input
                    type="time"
                    value={suggestion.suggestedTimes[end]}
                    onChange={(e) => handleInputChange(end, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 w-20"
                  />
                </div>
              ))}

              {/* 일요일 휴무 여부 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-600 w-12">일요일</span>
                <select
                  value={suggestion.suggestedTimes.noTrmtSun}
                  onChange={(e) => handleInputChange("noTrmtSun", e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="휴무">휴무</option>
                  <option value="진료">진료</option>
                </select>
              </div>

              {/* 점심시간 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-600 w-12">점심시간</span>
                <input
                  type="text"
                  value={suggestion.suggestedTimes.lunchWeek}
                  onChange={(e) => handleInputChange("lunchWeek", e.target.value)}
                  placeholder="예: 12:00~13:00"
                  className="text-xs border border-gray-300 rounded px-2 py-1 flex-1"
                />
              </div>
            </div>

            {/* 제안 이유 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                제안 이유
              </label>
              <textarea
                value={suggestion.reason}
                onChange={(e) => setSuggestion(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="영업시간 수정을 제안하는 이유를 작성해주세요..."
                className="text-xs border border-gray-300 rounded px-2 py-1 w-full h-20 resize-none"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
              >
                제안 제출
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OperatingTimeSuggestion; 