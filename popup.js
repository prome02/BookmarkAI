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
    // 直接打开设置页面到AI整理结果部分
    chrome.tabs.create({
      url: 'options.html#ai-organize-section'
    });
  });

  // 检测无效链接按钮点击事件
  checkInvalidBtn.addEventListener('click', function() {
    // 直接打开设置页面到无效链接管理部分
    chrome.tabs.create({
      url: 'options.html#invalid-links-section'
    });
  });

  // 检测重复链接按钮点击事件
  checkDuplicateBtn.addEventListener('click', function() {
    // 直接打开设置页面到重复链接管理部分
    chrome.tabs.create({
      url: 'options.html#duplicate-links-section'
    });
  });

  // 初始清除状态
  clearStatus();
}); 