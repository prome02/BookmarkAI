// 获取DOM元素
const recentBookmarksList = document.getElementById('recentBookmarksList');
const recentBookmarksLimit = document.getElementById('recentBookmarksLimit');
const refreshRecentBookmarksBtn = document.getElementById('refreshRecentBookmarksBtn');
const organizeBtn = document.getElementById('organizeBtn');
const checkInvalidBtn = document.getElementById('checkInvalidBtn');
const checkDuplicateBtn = document.getElementById('checkDuplicateBtn');
const statusDiv = document.getElementById('status');

// 国际化帮助函数
function i18n(messageName, ...args) {
  return chrome.i18n.getMessage(messageName, args);
}

// 載入近期書籤
function loadRecentBookmarks() {
  const limit = parseInt(recentBookmarksLimit.value) || 15;

  recentBookmarksList.innerHTML = `<div class="empty-placeholder">${i18n('loading_recent_bookmarks')}</div>`;
  refreshRecentBookmarksBtn.disabled = true;
  refreshRecentBookmarksBtn.textContent = i18n('loading');

  chrome.runtime.sendMessage(
    {
      action: 'getRecentBookmarks',
      limit: limit
    },
    function (response) {
      refreshRecentBookmarksBtn.disabled = false;
      refreshRecentBookmarksBtn.textContent = i18n('refresh');

      if (response.success && response.bookmarks) {
        displayRecentBookmarks(response.bookmarks);
      } else {
        recentBookmarksList.innerHTML = `<div class="empty-placeholder">${i18n('loading')} ${i18n('failed')}</div>`;
      }
    }
  );
}

// 顯示近期書籤
function displayRecentBookmarks(bookmarks) {
  if (!bookmarks || bookmarks.length === 0) {
    recentBookmarksList.innerHTML = `<div class="empty-placeholder">${i18n('no_bookmarks')}</div>`;
    return;
  }

  recentBookmarksList.innerHTML = '';

  bookmarks.forEach((bookmark, index) => {
    const bookmarkItem = document.createElement('div');
    bookmarkItem.className = 'recent-bookmark-item';

    // 路徑標籤
    const pathBadge = bookmark.path && bookmark.path.length > 0
      ? `<span class="path-badge">${bookmark.path.join(' > ')}</span>`
      : `<span class="path-badge">${i18n('root_directory')}</span>`;

    bookmarkItem.innerHTML = `
      <div class="recent-bookmark-content">
        <div class="recent-bookmark-header">
          <span class="bookmark-index">#${index + 1}</span>
          <a href="${bookmark.url}" target="_blank" class="bookmark-link" title="${bookmark.title || i18n('no_title')}">
            <span class="bookmark-title">${bookmark.summary || bookmark.title || i18n('no_title')}</span>
          </a>
          <button class="delete-bookmark-btn" data-bookmark-id="${bookmark.id}" title="${i18n('delete_bookmark')}">${i18n('delete')}</button>
        </div>
        <div class="recent-bookmark-meta">
          ${pathBadge}
          <span class="date-badge">${bookmark.dateAddedFormatted}</span>
        </div>
      </div>
    `;

    // 為此書籤項目的刪除按鈕添加事件監聽器
    bookmarkItem.querySelector('.delete-bookmark-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      const bookmarkId = this.getAttribute('data-bookmark-id');
      if (confirm(i18n('confirm_delete_bookmark'))) {
        deleteBookmark(bookmarkId);
      }
    });

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

// AI整理書籤按鈕點擊事件
organizeBtn.addEventListener('click', function() {
  organizeBtn.disabled = true;
  organizeBtn.textContent = i18n('organizing');
  statusDiv.textContent = i18n('organizing_bookmarks');
  statusDiv.className = 'status progress';

  chrome.runtime.sendMessage({ action: 'organizeBookmarks' }, function(response) {
    organizeBtn.disabled = false;
    organizeBtn.textContent = i18n('ai_organize_bookmarks');

    if (response.success) {
      statusDiv.textContent = response.message;
      statusDiv.className = 'status success';
    } else {
      statusDiv.textContent = response.message || i18n('organize_bookmarks_failed');
      statusDiv.className = 'status error';
    }

    // 3秒後清除狀態訊息
    setTimeout(function() {
      statusDiv.textContent = '';
      statusDiv.className = 'status';
    }, 3000);
  });
});

// 檢測無效鏈接按鈕點擊事件
checkInvalidBtn.addEventListener('click', function() {
  checkInvalidBtn.disabled = true;
  checkInvalidBtn.textContent = i18n('checking');
  statusDiv.textContent = i18n('checking_invalid_links');
  statusDiv.className = 'status progress';

  chrome.runtime.sendMessage({ action: 'checkInvalidLinks' }, function(response) {
    checkInvalidBtn.disabled = false;
    checkInvalidBtn.textContent = i18n('check_invalid_links');

    if (response.success) {
      statusDiv.textContent = response.message;
      statusDiv.className = 'status success';
    } else {
      statusDiv.textContent = response.message || i18n('check_invalid_links_failed');
      statusDiv.className = 'status error';
    }

    // 3秒後清除狀態訊息
    setTimeout(function() {
      statusDiv.textContent = '';
      statusDiv.className = 'status';
    }, 3000);
  });
});

// 檢測重複鏈接按鈕點擊事件
checkDuplicateBtn.addEventListener('click', function() {
  checkDuplicateBtn.disabled = true;
  checkDuplicateBtn.textContent = i18n('checking');
  statusDiv.textContent = i18n('checking_duplicate_links');
  statusDiv.className = 'status progress';

  chrome.runtime.sendMessage({ action: 'checkDuplicateLinks' }, function(response) {
    checkDuplicateBtn.disabled = false;
    checkDuplicateBtn.textContent = i18n('check_duplicate_links');

    if (response.success) {
      statusDiv.textContent = response.message;
      statusDiv.className = 'status success';
    } else {
      statusDiv.textContent = response.message || i18n('check_duplicate_links_failed');
      statusDiv.className = 'status error';
    }

    // 3秒後清除狀態訊息
    setTimeout(function() {
      statusDiv.textContent = '';
      statusDiv.className = 'status';
    }, 3000);
  });
});

// 刪除書籤
function deleteBookmark(bookmarkId) {
  chrome.runtime.sendMessage(
    {
      action: 'removeBookmark',
      bookmarkId: bookmarkId
    },
    function (response) {
      if (response.success) {
        // 重新載入近期書籤列表
        loadRecentBookmarks();
      } else {
        alert(i18n('delete_bookmark_failed') + (response.message || i18n('unknown_error')));
      }
    }
  );
}

// 初始載入近期書籤
loadRecentBookmarks();