// server/src/routes/elastic/hospitalSearch.js
const express = require('express');
const moment = require('moment-timezone'); // moment-timezone 라이브러리 추가
const client = require('../config/elasticsearch'); // ✅ Elasticsearch 클라이언트 가져오기
const router = express.Router();

// 환경변수 TIMEZONE이 설정되어 있으면 사용하고, 없으면 'Asia/Seoul'로 기본 설정
const TIMEZONE = process.env.TIMEZONE || 'Asia/Seoul';

router.get('/', async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      region,
      subject,
      category,
      major,
      query,
      x,
      y,
      distance = "10km"
    } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const must = [];
    const filter = [];

    if (query && query.trim() !== "") {
      must.push({
        multi_match: {
          query: query.trim(),
          fields: ["yadmNm^3", "addr", "major"],
          fuzziness: "AUTO"
        }
      });
    }

    if (region && region !== "전국") {
      filter.push({ term: { region: region } });
    }

    if (major && major !== "전체") {
      must.push({
        terms: {
          "major": [major]
        }
      });
    }

    // 1. 현재 시간 및 요일 계산 (타임존을 고려하여 계산)
    const now = moment().tz(TIMEZONE);
    const currentTime = now.hours() * 60 + now.minutes();
    const currentDay = now.format('dddd'); // 예: "Saturday"

    // category 필터 처리
    if (category && category !== "전체") {
      if (category === "영업중") {
        const now = moment().tz('Asia/Seoul');
        const currentTime = now.hours() * 60 + now.minutes(); // 분 단위
        const dayMap = {
          monday: 'Mon',
          tuesday: 'Tue',
          wednesday: 'Wed',
          thursday: 'Thu',
          friday: 'Fri',
          saturday: 'Sat',
          sunday: 'Sun'
        };
        const currentDay = now.format('dddd').toLowerCase();
        const dayKey = dayMap[currentDay];
        
        filter.push({
          script: {
            script: {
              source: `
                if (!doc.containsKey('times.trmt' + params.dayKey + 'Start') || 
                    !doc.containsKey('times.trmt' + params.dayKey + 'End')) {
                  return false;
                }
                
                def startTime = doc['times.trmt' + params.dayKey + 'Start'].value;
                def endTime = doc['times.trmt' + params.dayKey + 'End'].value;
                
                if (startTime == null || endTime == null) {
                  return false;
                }
                
                def currentTime = params.currentTime;
                def startHour = startTime / 100;
                def startMin = startTime % 100;
                def endHour = endTime / 100;
                def endMin = endTime % 100;
                
                def startMinutes = startHour * 60 + startMin;
                def endMinutes = endHour * 60 + endMin;
                
                return currentTime >= startMinutes && currentTime < endMinutes;
              `,
              params: {
                currentTime: currentTime,
                dayKey: dayKey
              }
            }
          }
        });
      } else {
        filter.push({ term: { "category.keyword": category } });
      }
    }
    
    if (subject && subject !== "전체") {
      filter.push({
        match: {
          "subjects.dgsbjtCdNm": subject
        }
      });
    }

    if (x && y) {
      const userLocation = {
        lat: parseFloat(y),
        lon: parseFloat(x)
      };
      filter.push({
        geo_distance: {
          distance: distance,
          location: userLocation
        }
      });
    }

    // 만약 category가 "영업중"이면, 스크립트 필터의 파라미터 값을 설정
    if (category === "영업중") {
      filter.forEach(f => {
        if (f.script_score && f.script_score.script) {
          f.script_score.script.params.currentTime = currentTime;
          f.script_score.script.params.dayKey = currentDay;
        }
      });
    }

    // 2. 기본 쿼리 구성
    const baseQuery = {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter: filter
      }
    };

    // 3. boost 기능: 운영시간 boost 적용 (영업 중이면 10점 부여)
    const boostedQuery = {
      function_score: {
        query: baseQuery,
        functions: [
          {
            script_score: {
              script: {
                lang: "painless",
                source: `
                  int currentTime = params.currentTime;
                  String currentDay = params.currentDay;
                  
                  // schedule 필드 존재 여부 확인
                  if (!doc.containsKey("schedule." + currentDay + ".openTime") || 
                      !doc.containsKey("schedule." + currentDay + ".closeTime")) {
                    return 0;
                  }
                  
                  // size 체크
                  if (doc["schedule." + currentDay + ".openTime"].size() == 0 ||
                      doc["schedule." + currentDay + ".closeTime"].size() == 0) {
                    return 0;
                  }
                  
                  // value null 체크
                  if (doc["schedule." + currentDay + ".openTime"].value == null ||
                      doc["schedule." + currentDay + ".closeTime"].value == null) {
                    return 0;
                  }
                  
                  String openTimeStr = doc["schedule." + currentDay + ".openTime"].value.toString();
                  String closeTimeStr = doc["schedule." + currentDay + ".closeTime"].value.toString();
                  
                  if (openTimeStr.equals("-") || closeTimeStr.equals("-")) {
                    return 0;
                  }
                  
                  if (openTimeStr.length() < 4 || closeTimeStr.length() < 4) {
                    return 0;
                  }
                  
                  int openHour = Integer.parseInt(openTimeStr.substring(0,2));
                  int openMin = Integer.parseInt(openTimeStr.substring(2,4));
                  int closeHour = Integer.parseInt(closeTimeStr.substring(0,2));
                  int closeMin = Integer.parseInt(closeTimeStr.substring(2,4));
                  
                  int openTime = openHour * 60 + openMin;
                  int closeTime = closeHour * 60 + closeMin;
                  
                  if (currentTime >= openTime && currentTime < closeTime) {
                    return 10.0;
                  } else {
                    return 0;
                  }
                `,
                params: {
                  currentTime: currentTime,
                  currentDay: currentDay
                }
              }
            }
          }
        ],
        boost_mode: "sum",
        score_mode: "sum"
      }
    };

    const searchParams = {
      index: 'hospitals',
      from: (pageNumber - 1) * limitNumber,
      size: limitNumber,
      body: {
        query: boostedQuery,
        sort: (x && y) ? [
          {
            "_geo_distance": {
              "location": { "lat": parseFloat(y), "lon": parseFloat(x) },
              "order": "asc",
              "unit": "km",
              "distance_type": "arc"
            }
          }
        ] : []
      }
    };

    // 실행 전 Elasticsearch 쿼리 로깅 (필요시 주석 해제)
    const response = await client.search(searchParams);
    const result = (typeof response.body !== 'undefined') ? response.body : response;

    let hits, totalCount;
    if (result && result.hits) {
      hits = result.hits.hits.map(hit => ({
        ...hit._source,
        _id: hit._id,
      }));
      totalCount = typeof result.hits.total === 'number'
        ? result.hits.total
        : result.hits.total.value;
    } else {
      console.error("검색 응답 구조가 예상과 다릅니다:", result);
      throw new Error("검색 응답 구조가 예상과 다릅니다.");
    }

    const totalPages = Math.ceil(totalCount / limitNumber);

    res.json({
      data: hits,
      totalCount,
      currentPage: pageNumber,
      totalPages
    });
  } catch (error) {
    console.error(
      "검색 라우트 오류:",
      error.meta ? JSON.stringify(error.meta.body.error, null, 2) : error
    );
    res.status(500).json({ message: "검색 중 오류가 발생했습니다." });
  }
});

module.exports = router;