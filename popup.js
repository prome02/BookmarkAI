document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const organizeBtn = document.getElementById('organizeBtn');
  const checkInvalidBtn = document.getElementById('checkInvalidBtn');
  const checkDuplicateBtn = document.getElementById('checkDuplicateBtn');
  const statusDiv = document.getElementById('status');

  // 更新状态显示
  function updateStatus(message, type = '') {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
  }

  // 清除状态
  function clearStatus() {
    statusDiv.textContent = '';
    statusDiv.className = 'status';
  }

  // AI整理书签按钮点击事件
  organizeBtn.addEventListener('click', function() {
    updateStatus('正在整理书签...', 'progress');
    
    chrome.runtime.sendMessage({ action: 'organizeBookmarks' }, function(response) {
      if (response.success) {
        updateStatus(response.message, 'success');
      } else {
        updateStatus(response.message || '整理书签失败', 'error');
      }
    });
  });

  // 检测无效链接按钮点击事件
  checkInvalidBtn.addEventListener('click', function() {
    updateStatus('正在检测无效链接...', 'progress');
    
    chrome.permissions.request({ 
      origins: ['<all_urls>'] 
    }, function(granted) {
      if (granted) {
        chrome.runtime.sendMessage({ action: 'checkInvalidLinks' }, function(response) {
          if (response.success) {
            updateStatus(response.message, 'success');
          } else {
            updateStatus(response.message || '检测无效链接失败', 'error');
          }
        });
      } else {
        updateStatus('需要网站访问权限才能检测无效链接', 'error');
      }
    });
  });

  // 检测重复链接按钮点击事件
  checkDuplicateBtn.addEventListener('click', function() {
    updateStatus('正在检测重复链接...', 'progress');
    
    chrome.runtime.sendMessage({ action: 'checkDuplicateLinks' }, function(response) {
      if (response.success) {
        updateStatus(response.message, 'success');
      } else {
        updateStatus(response.message || '检测重复链接失败', 'error');
      }
    });
  });

  // 初始清除状态
  clearStatus();
}); 