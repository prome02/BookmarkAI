// 測試獲取書籤訪問時間的範例代碼

async function getBookmarkLastVisit(url) {
  try {
    // 使用 History API 查詢該 URL 的訪問記錄
    const visits = await chrome.history.getVisits({ url: url });

    if (visits && visits.length > 0) {
      // 按訪問時間排序，取最近一次
      const sortedVisits = visits.sort((a, b) => b.visitTime - a.visitTime);
      const lastVisit = sortedVisits[0];

      return {
        lastVisitTime: lastVisit.visitTime, // 毫秒時間戳
        visitCount: visits.length,
        lastVisitDate: new Date(lastVisit.visitTime)
      };
    }

    return {
      lastVisitTime: null,
      visitCount: 0,
      lastVisitDate: null
    };
  } catch (error) {
    console.error('獲取訪問記錄失敗:', error);
    return null;
  }
}

// 使用範例
async function testBookmarkAccess() {
  const bookmarkUrl = 'https://www.google.com';
  const visitInfo = await getBookmarkLastVisit(bookmarkUrl);

  console.log('訪問資訊:', visitInfo);
  // 輸出: { lastVisitTime: 1234567890, visitCount: 10, lastVisitDate: Date }
}