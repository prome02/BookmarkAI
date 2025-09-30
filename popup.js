// 获取DOM元素
const recentBookmarksList = document.getElementById('recentBookmarksList');
const recentBookmarksLimit = document.getElementById('recentBookmarksLimit');
const refreshRecentBookmarksBtn = document.getElementById('refreshRecentBookmarksBtn');

// 載入近期書籤
function loadRecentBookmarks() {
  const limit = parseInt(recentBookmarksLimit.value) || 10;

  recentBookmarksList.innerHTML = '<div class="empty-placeholder">正在載入...</div>';
  refreshRecentBookmarksBtn.disabled = true;
  refreshRecentBookmarksBtn.textContent = '載入中...';

  chrome.runtime.sendMessage(
    {
      action: 'getRecentBookmarks',
      limit: limit
    },
    function (response) {
      refreshRecentBookmarksBtn.disabled = false;
      refreshRecentBookmarksBtn.textContent = '重新載入';

      if (response.success && response.bookmarks) {
        displayRecentBookmarks(response.bookmarks);
      } else {
        recentBookmarksList.innerHTML = '<div class="empty-placeholder">載入失敗</div>';
      }
    }
  );
}

// 顯示近期書籤
function displayRecentBookmarks(bookmarks) {
  if (!bookmarks || bookmarks.length === 0) {
    recentBookmarksList.innerHTML = '<div class="empty-placeholder">沒有書籤</div>';
    return;
  }

  recentBookmarksList.innerHTML = '';

  bookmarks.forEach((bookmark, index) => {
    const bookmarkItem = document.createElement('div');
    bookmarkItem.className = 'recent-bookmark-item';

    // 路徑標籤
    const pathBadge = bookmark.path && bookmark.path.length > 0
      ? `<span class="path-badge">${bookmark.path.join(' > ')}</span>`
      : '<span class="path-badge">根目錄</span>';

    bookmarkItem.innerHTML = `
      <div class="recent-bookmark-content">
        <div class="recent-bookmark-header">
          <span class="bookmark-index">#${index + 1}</span>
          <a href="${bookmark.url}" target="_blank" class="bookmark-link" title="${bookmark.title || '無標題'}">
            <span class="bookmark-title">${bookmark.summary || bookmark.title || '無標題'}</span>
          </a>
        </div>
        <div class="recent-bookmark-meta">
          ${pathBadge}
          <span class="date-badge">${bookmark.dateAddedFormatted}</span>
        </div>
      </div>
    `;

    recentBookmarksList.appendChild(bookmarkItem);
  });
}

// 重新載入近期書籤按鈕點擊事件
refreshRecentBookmarksBtn.addEventListener('click', function () {
  loadRecentBookmarks();
});

// 近期書籤數量選擇改變事件
recentBookmarksLimit.addEventListener('change', function () {
  loadRecentBookmarks();
});

// 初始載入近期書籤
loadRecentBookmarks();