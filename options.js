document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const aiApiTypeSelect = document.getElementById('aiApiType');
  const customModelSection = document.getElementById('customModelSection');
  const customApiEndpointInput = document.getElementById('customApiEndpoint');
  const apiKeyInput = document.getElementById('apiKey');
  const testApiBtn = document.getElementById('testApiBtn');
  const scheduledScansSelect = document.getElementById('scheduledScans');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const saveStatusDiv = document.getElementById('saveStatus');
  
  // 无效链接相关元素
  const invalidLinksList = document.getElementById('invalidLinksList');
  const scanInvalidBtn = document.getElementById('scanInvalidBtn');
  const removeAllInvalidBtn = document.getElementById('removeAllInvalidBtn');
  
  // 重复链接相关元素
  const duplicateLinksList = document.getElementById('duplicateLinksList');
  const scanDuplicateBtn = document.getElementById('scanDuplicateBtn');
  const removeAllDuplicatesBtn = document.getElementById('removeAllDuplicatesBtn');
  
  // 忽略域名相关元素
  const ignoredDomainsList = document.getElementById('ignoredDomainsList');
  
  // 进度条相关元素
  const scanProgressContainer = document.getElementById('scanProgressContainer');
  const scanProgressBar = document.getElementById('scanProgressBar');
  const scanProgressText = document.getElementById('scanProgressText');
  
  // AI整理相关元素
  const aiOrganizeList = document.getElementById('aiOrganizeList');
  const startOrganizeBtn = document.getElementById('startOrganizeBtn');
  const applyAllBtn = document.getElementById('applyAllBtn');
  
  // 空文件夹相关元素
  const emptyFoldersList = document.getElementById('emptyFoldersList');
  const scanEmptyFoldersBtn = document.getElementById('scanEmptyFoldersBtn');
  const removeAllEmptyFoldersBtn = document.getElementById('removeAllEmptyFoldersBtn');
  
  // 重复目录相关元素
  const duplicateFoldersList = document.getElementById('duplicateFoldersList');
  const scanDuplicateFoldersBtn = document.getElementById('scanDuplicateFoldersBtn');
  const autoMergeDuplicateFoldersBtn = document.getElementById('autoMergeDuplicateFoldersBtn');
  
  // 监听API类型变化以显示/隐藏自定义模型选项
  aiApiTypeSelect.addEventListener('change', function() {
    if (aiApiTypeSelect.value === 'custom') {
      customModelSection.style.display = 'flex';
    } else {
      customModelSection.style.display = 'none';
    }
  });
  
  // 监听来自后台的进度消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scanProgress') {
      updateScanProgress(message);
    } else if (message.action === 'aiOrganizeProgress') {
      updateAIOrganizeProgress(message);
    }
  });
  
  // 加载设置
  loadSettings();
  
  // 加载无效链接和重复链接数据
  loadInvalidLinks();
  loadDuplicateLinks();
  
  // 加载忽略域名列表
  loadIgnoredDomains();
  
  // 保存设置按钮点击事件
  saveSettingsBtn.addEventListener('click', function() {
    saveSettings();
  });
  
  // 测试API连接按钮点击事件
  testApiBtn.addEventListener('click', function() {
    testApiBtn.disabled = true;
    testApiBtn.textContent = '测试中...';
    testApiConnection();
  });
  
  // 扫描无效链接按钮点击事件
  scanInvalidBtn.addEventListener('click', function() {
    startInvalidLinksScan();
  });
  
  // 删除所有无效链接按钮点击事件
  removeAllInvalidBtn.addEventListener('click', function() {
    if (confirm('确定要删除所有无效链接吗？此操作不可撤销。')) {
      removeAllInvalidLinks();
    }
  });
  
  // 扫描重复链接按钮点击事件
  scanDuplicateBtn.addEventListener('click', function() {
    scanDuplicateLinks();
  });
  
  // 删除所有重复链接按钮点击事件
  removeAllDuplicatesBtn.addEventListener('click', function() {
    if (confirm('确定要自动删除所有重复项吗？系统将保留每组中的第一个链接，删除其余重复项。此操作不可撤销。')) {
      removeAllDuplicateLinks();
    }
  });
  
  // 开始AI整理按钮点击事件
  startOrganizeBtn.addEventListener('click', function() {
    startAIOrganize();
  });
  
  // 应用所有建议按钮点击事件
  applyAllBtn.addEventListener('click', function() {
    if (confirm('确定要应用所有AI建议的分类吗？这将移动书签到对应的文件夹。')) {
      applyAllSuggestions();
    }
  });
  
  // 扫描空文件夹按钮点击事件
  scanEmptyFoldersBtn.addEventListener('click', function() {
    scanEmptyFolders();
  });
  
  // 删除所有空文件夹按钮点击事件
  removeAllEmptyFoldersBtn.addEventListener('click', function() {
    if (confirm('确定要删除所有空文件夹吗？此操作不可撤销。')) {
      removeAllEmptyFolders();
    }
  });
  
  // 扫描重复目录按钮点击事件
  scanDuplicateFoldersBtn.addEventListener('click', function() {
    scanDuplicateFolders();
  });
  
  // 自动合并重复目录按钮点击事件
  autoMergeDuplicateFoldersBtn.addEventListener('click', function() {
    if (confirm('确定要自动合并所有重复目录吗？系统将保留每组中的第一个文件夹，并将其他文件夹中的内容合并到其中。此操作不可撤销。')) {
      autoMergeDuplicateFolders();
    }
  });
  
  // 启动无效链接扫描
  function startInvalidLinksScan() {
    // 显示进度条并重置
    scanProgressContainer.style.display = 'block';
    scanProgressBar.style.width = '0%';
    scanProgressText.textContent = '0%';
    
    // 修改按钮状态
    scanInvalidBtn.classList.add('scanning');
    scanInvalidBtn.textContent = '扫描中...';
    scanInvalidBtn.disabled = true;
    
    // 清空当前列表
    invalidLinksList.innerHTML = '<div class="empty-placeholder">正在扫描无效链接，请稍候...</div>';
    
    // 请求权限并扫描
    requestPermissionAndScan('invalid');
  }
  
  // 更新进度条
  function updateScanProgress(progressData) {
    if (progressData.error) {
      // 如果有错误，显示错误信息并重置进度条
      hideScanProgress();
      updateSaveStatus('扫描出错: ' + progressData.message, 'error');
      return;
    }
    
    // 更新进度条
    const percentage = progressData.percentage;
    scanProgressBar.style.width = percentage + '%';
    scanProgressText.textContent = percentage + '%';
    
    // 如果扫描完成
    if (progressData.completed) {
      // 等待一段时间再隐藏进度条，让用户看到100%
      setTimeout(hideScanProgress, 1000);
    }
  }
  
  // 隐藏进度条并重置按钮
  function hideScanProgress() {
    scanProgressContainer.style.display = 'none';
    scanInvalidBtn.classList.remove('scanning');
    scanInvalidBtn.textContent = '扫描无效链接';
    scanInvalidBtn.disabled = false;
  }
  
  // 加载设置
  function loadSettings() {
    chrome.storage.sync.get(['aiApiType', 'customApiEndpoint', 'apiKey', 'scheduledScans'], function(items) {
      if (items.aiApiType) {
        aiApiTypeSelect.value = items.aiApiType;
        // 根据API类型显示/隐藏自定义模型选项
        if (items.aiApiType === 'custom') {
          customModelSection.style.display = 'flex';
        }
      }
      if (items.customApiEndpoint) {
        customApiEndpointInput.value = items.customApiEndpoint;
      }
      if (items.apiKey) {
        apiKeyInput.value = items.apiKey;
      }
      if (items.scheduledScans) {
        scheduledScansSelect.value = items.scheduledScans;
      }
    });
  }
  
  // 加载忽略域名列表
  function loadIgnoredDomains() {
    chrome.runtime.sendMessage({ action: 'getIgnoredDomains' }, function(response) {
      if (response.success && ignoredDomainsList) {
        const domains = response.domains || [];
        
        if (domains.length === 0) {
          ignoredDomainsList.innerHTML = '<div class="empty-placeholder">没有设置忽略的域名</div>';
          return;
        }
        
        ignoredDomainsList.innerHTML = '';
        
        domains.forEach(function(domain) {
          const domainItem = document.createElement('div');
          domainItem.className = 'domain-item';
          
          domainItem.innerHTML = `
            <span class="domain-name">${domain}</span>
            <span class="domain-action">
              <button class="btn small remove-domain" data-domain="${domain}">移除</button>
            </span>
          `;
          
          ignoredDomainsList.appendChild(domainItem);
        });
        
        // 添加移除按钮事件
        document.querySelectorAll('.remove-domain').forEach(button => {
          button.addEventListener('click', function() {
            const domain = this.getAttribute('data-domain');
            removeIgnoredDomain(domain);
          });
        });
      }
    });
  }
  
  // 从忽略列表中移除域名
  function removeIgnoredDomain(domain) {
    chrome.runtime.sendMessage(
      { 
        action: 'removeIgnoredDomain',
        domain: domain
      }, 
      function(response) {
        if (response.success) {
          updateSaveStatus(`已从忽略列表中移除域名: ${domain}`, 'success');
          loadIgnoredDomains(); // 重新加载域名列表
        } else {
          updateSaveStatus(response.message || '移除域名失败', 'error');
        }
      }
    );
  }

  // 保存设置
  function saveSettings() {
    const settings = {
      aiApiType: aiApiTypeSelect.value,
      apiKey: apiKeyInput.value,
      scheduledScans: scheduledScansSelect.value
    };
    
    // 如果是自定义模型，保存API端点
    if (settings.aiApiType === 'custom') {
      settings.customApiEndpoint = customApiEndpointInput.value;
    }
    
    chrome.storage.sync.set(settings, function() {
      updateSaveStatus('设置已保存', 'success');
      
      // 设置定时任务
      setupScheduledTasks(settings.scheduledScans);
    });
  }
  
  // 设置定时任务
  function setupScheduledTasks(frequency) {
    // 清除现有的定时任务
    chrome.alarms.clearAll();
    
    // 根据频率设置新的定时任务
    if (frequency !== 'never') {
      let periodInMinutes;
      
      switch (frequency) {
        case 'daily':
          periodInMinutes = 60 * 24; // 每天
          break;
        case 'weekly':
          periodInMinutes = 60 * 24 * 7; // 每周
          break;
        case 'monthly':
          periodInMinutes = 60 * 24 * 30; // 每月 (近似值)
          break;
        default:
          return;
      }
      
      chrome.alarms.create('scheduledScan', { periodInMinutes: periodInMinutes });
    }
  }
  
  // 测试API连接
  function testApiConnection() {
    const apiType = aiApiTypeSelect.value;
    const apiKey = apiKeyInput.value;
    const customApiEndpoint = customApiEndpointInput.value;
    
    if (!apiKey) {
      updateConnectionStatus('请输入API Key', 'error');
      return;
    }
    
    if (apiType === 'custom' && !customApiEndpoint) {
      updateConnectionStatus('请输入自定义API端点', 'error');
      return;
    }
    
    // 清除先前的连接状态并显示加载状态
    updateConnectionStatus('正在测试连接...', 'loading');
    
    chrome.runtime.sendMessage(
      { 
        action: 'testApiConnection',
        apiType: apiType,
        apiKey: apiKey,
        customApiEndpoint: customApiEndpoint
      }, 
      function(response) {
        if (response.success) {
          updateConnectionStatus('API连接成功', 'success');
          // 连接成功后自动保存设置
          saveSettings();
        } else {
          updateConnectionStatus(response.message || 'API连接失败', 'error');
        }
      }
    );
  }
  
  // 更新连接状态显示
  function updateConnectionStatus(message, type) {
    // 恢复测试按钮状态
    testApiBtn.disabled = false;
    testApiBtn.textContent = '测试连接';
    
    // 显示连接状态
    let alertClass = '';
    let alertIcon = '';
    
    switch(type) {
      case 'success':
        alertClass = 'connection-alert success';
        alertIcon = '✅';
        break;
      case 'error':
        alertClass = 'connection-alert error';
        alertIcon = '❌';
        break;
      case 'loading':
        alertClass = 'connection-alert loading';
        alertIcon = '⏳';
        break;
      default:
        alertClass = 'connection-alert';
    }
    
    // 移除之前的提示（如果存在）
    const existingAlert = document.querySelector('.connection-alert');
    if (existingAlert) {
      existingAlert.remove();
    }
    
    // 创建新的提示元素
    const alertDiv = document.createElement('div');
    alertDiv.className = alertClass;
    alertDiv.innerHTML = `${alertIcon} ${message}`;
    
    // 添加到DOM中
    const apiSectionDiv = document.querySelector('.section:first-of-type');
    apiSectionDiv.appendChild(alertDiv);
    
    // 如果是成功或错误消息，5秒后淡出
    if (type === 'success' || type === 'error') {
      setTimeout(function() {
        alertDiv.classList.add('fade-out');
        setTimeout(function() {
          if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
          }
        }, 500);
      }, 5000);
    }
  }
  
  // 请求权限并扫描
  function requestPermissionAndScan(type) {
    chrome.permissions.request({ 
      origins: ['<all_urls>'] 
    }, function(granted) {
      if (granted) {
        if (type === 'invalid') {
          scanInvalidLinks();
        }
      } else {
        updateSaveStatus('需要网站访问权限才能检测无效链接', 'error');
        hideScanProgress(); // 如果权限被拒绝，隐藏进度条
      }
    });
  }
  
  // 扫描无效链接
  function scanInvalidLinks() {
    updateSaveStatus('正在检测无效链接...', '');
    
    chrome.runtime.sendMessage({ action: 'checkInvalidLinks' }, function(response) {
      if (response.success) {
        updateSaveStatus('无效链接检测完成', 'success');
        loadInvalidLinks(); // 重新加载结果
      } else {
        updateSaveStatus(response.message || '检测无效链接失败', 'error');
        hideScanProgress(); // 如果扫描失败，隐藏进度条
      }
    });
  }
  
  // 加载无效链接
  function loadInvalidLinks() {
    chrome.storage.local.get(['invalidLinks'], function(result) {
      const invalidLinks = result.invalidLinks || [];
      
      if (invalidLinks.length === 0) {
        invalidLinksList.innerHTML = '<div class="empty-placeholder">尚未扫描无效链接</div>';
        return;
      }
      
      invalidLinksList.innerHTML = '';
      
      invalidLinks.forEach(function(link) {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';
        
        linkItem.innerHTML = `
          <span class="link-title" title="${link.title}">${link.title || '无标题'}</span>
          <span class="link-url" title="${link.url}">${link.url}</span>
          <span class="link-status status-error">${link.status || '错误'}</span>
          <span class="link-action">
            <button class="btn small remove-link" data-id="${link.id}">删除</button>
            <button class="btn small mark-valid" data-id="${link.id}" data-url="${link.url}">标记为有效</button>
          </span>
        `;
        
        invalidLinksList.appendChild(linkItem);
      });
      
      // 添加删除按钮事件
      document.querySelectorAll('.remove-link').forEach(button => {
        button.addEventListener('click', function() {
          const bookmarkId = this.getAttribute('data-id');
          removeInvalidLink(bookmarkId);
        });
      });
      
      // 添加标记为有效按钮事件
      document.querySelectorAll('.mark-valid').forEach(button => {
        button.addEventListener('click', function() {
          const bookmarkId = this.getAttribute('data-id');
          const url = this.getAttribute('data-url');
          markAsValid(bookmarkId, url);
        });
      });
    });
  }
  
  // 标记链接为有效
  function markAsValid(bookmarkId, url) {
    // 从存储中移除此链接（不删除实际书签）
    chrome.storage.local.get(['invalidLinks'], function(result) {
      const invalidLinks = result.invalidLinks || [];
      const updatedLinks = invalidLinks.filter(link => link.id !== bookmarkId);
      
      chrome.storage.local.set({ invalidLinks: updatedLinks }, function() {
        // 询问是否将域名添加到忽略列表
        if (confirm('是否将这个链接的域名添加到忽略列表？这将在未来的扫描中跳过此域名的所有书签。')) {
          // 添加域名到忽略列表
          chrome.runtime.sendMessage({ action: 'ignoreDomain', url: url }, function(response) {
            if (response.success) {
              updateSaveStatus('链接已标记为有效，域名已添加到忽略列表', 'success');
              loadIgnoredDomains(); // 重新加载忽略域名列表
            } else {
              updateSaveStatus('链接已标记为有效，但域名添加失败', 'error');
            }
          });
        } else {
          updateSaveStatus('链接已标记为有效', 'success');
        }
        
        loadInvalidLinks(); // 重新加载无效链接列表
      });
    });
  }
  
  // 删除无效链接
  function removeInvalidLink(bookmarkId) {
    chrome.runtime.sendMessage(
      { 
        action: 'removeBookmark',
        bookmarkId: bookmarkId
      }, 
      function(response) {
        if (response.success) {
          removeInvalidLinkFromStorage(bookmarkId);
          updateSaveStatus('链接已删除', 'success');
        } else {
          updateSaveStatus(response.message || '删除链接失败', 'error');
        }
      }
    );
  }
  
  // 从存储中删除无效链接
  function removeInvalidLinkFromStorage(bookmarkId) {
    chrome.storage.local.get(['invalidLinks'], function(result) {
      const invalidLinks = result.invalidLinks || [];
      const updatedLinks = invalidLinks.filter(link => link.id !== bookmarkId);
      
      chrome.storage.local.set({ invalidLinks: updatedLinks }, function() {
        loadInvalidLinks(); // 重新加载结果
      });
    });
  }
  
  // 删除所有无效链接
  function removeAllInvalidLinks() {
    chrome.storage.local.get(['invalidLinks'], function(result) {
      const invalidLinks = result.invalidLinks || [];
      
      if (invalidLinks.length === 0) {
        return;
      }
      
      updateSaveStatus('正在删除所有无效链接...', '');
      
      // 创建一个Promise数组来处理所有删除操作
      const deletePromises = invalidLinks.map(link => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { 
              action: 'removeBookmark',
              bookmarkId: link.id
            }, 
            function(response) {
              resolve(response.success);
            }
          );
        });
      });
      
      // 等待所有删除操作完成
      Promise.all(deletePromises).then(results => {
        const successCount = results.filter(Boolean).length;
        
        chrome.storage.local.set({ invalidLinks: [] }, function() {
          updateSaveStatus(`已成功删除 ${successCount}/${invalidLinks.length} 个无效链接`, 'success');
          loadInvalidLinks(); // 重新加载结果
        });
      });
    });
  }
  
  // 扫描重复链接
  function scanDuplicateLinks() {
    updateSaveStatus('正在检测重复链接...', '');
    
    // 清空当前列表
    duplicateLinksList.innerHTML = '<div class="empty-placeholder">正在扫描重复链接，请稍候...</div>';
    
    chrome.runtime.sendMessage({ action: 'checkDuplicateLinks' }, function(response) {
      if (response.success) {
        updateSaveStatus('重复链接检测完成', 'success');
        loadDuplicateLinks(); // 重新加载结果
      } else {
        updateSaveStatus(response.message || '检测重复链接失败', 'error');
      }
    });
  }
  
  // 加载重复链接
  function loadDuplicateLinks() {
    chrome.storage.local.get(['duplicateLinks'], function(result) {
      const duplicateLinks = result.duplicateLinks || [];
      
      if (duplicateLinks.length === 0) {
        duplicateLinksList.innerHTML = '<div class="empty-placeholder">尚未扫描重复链接</div>';
        return;
      }
      
      duplicateLinksList.innerHTML = '';
      
      duplicateLinks.forEach(function(group, groupIndex) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'duplicate-group';
        
        // 创建组标题
        const groupHeader = document.createElement('div');
        groupHeader.className = 'duplicate-group-header';
        groupHeader.textContent = `重复链接组 #${groupIndex + 1} - ${group.normalizedUrl}`;
        groupDiv.appendChild(groupHeader);
        
        // 创建组项目容器
        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'duplicate-items';
        
        // 添加每个重复项
        group.bookmarks.forEach(function(bookmark, itemIndex) {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'duplicate-item';
          
          // 完整路径显示
          let fullPath = '';
          let pathDisplay = '';
          
          if (bookmark.path && bookmark.path.length > 0) {
            fullPath = bookmark.path.join(' > ');
            // 使用图标和视觉上的路径表示
            pathDisplay = `📁 ${fullPath}`;
          } else {
            fullPath = bookmark.parentTitle || '根目录';
            pathDisplay = `📁 ${fullPath}`;
          }
          
          itemDiv.innerHTML = `
            <input type="checkbox" class="duplicate-checkbox" data-group="${groupIndex}" data-id="${bookmark.id}" ${itemIndex > 0 ? 'checked' : ''}>
            <div class="duplicate-info">
              <div class="duplicate-title">${bookmark.title || '无标题'}</div>
              <div class="duplicate-path" title="${fullPath}">${pathDisplay}</div>
            </div>
          `;
          
          itemsDiv.appendChild(itemDiv);
        });
        
        groupDiv.appendChild(itemsDiv);
        
        // 添加操作按钮
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';
        actionsDiv.innerHTML = `
          <button class="btn small delete-selected" data-group="${groupIndex}">删除选中项</button>
        `;
        groupDiv.appendChild(actionsDiv);
        
        duplicateLinksList.appendChild(groupDiv);
      });
      
      // 添加删除选中项按钮事件
      document.querySelectorAll('.delete-selected').forEach(button => {
        button.addEventListener('click', function() {
          const groupIndex = parseInt(this.getAttribute('data-group'));
          deleteSelectedDuplicates(groupIndex);
        });
      });
    });
  }
  
  // 删除选中的重复项
  function deleteSelectedDuplicates(groupIndex) {
    const checkboxes = document.querySelectorAll(`.duplicate-checkbox[data-group="${groupIndex}"]:checked`);
    const bookmarkIds = Array.from(checkboxes).map(checkbox => checkbox.getAttribute('data-id'));
    
    if (bookmarkIds.length === 0) {
      updateSaveStatus('没有选中任何项目', 'error');
      return;
    }
    
    updateSaveStatus('正在删除选中的重复项...', '');
    
    // 创建一个Promise数组来处理所有删除操作
    const deletePromises = bookmarkIds.map(id => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { 
            action: 'removeBookmark',
            bookmarkId: id
          }, 
          function(response) {
            resolve({
              id: id,
              success: response.success
            });
          }
        );
      });
    });
    
    // 等待所有删除操作完成
    Promise.all(deletePromises).then(results => {
      const successCount = results.filter(r => r.success).length;
      
      updateSaveStatus(`已成功删除 ${successCount}/${bookmarkIds.length} 个重复项`, 'success');
      
      // 更新存储的重复链接数据
      chrome.storage.local.get(['duplicateLinks'], function(result) {
        const duplicateLinks = result.duplicateLinks || [];
        
        if (groupIndex >= 0 && groupIndex < duplicateLinks.length) {
          const successfullyDeletedIds = results.filter(r => r.success).map(r => r.id);
          
          // 移除已删除的书签
          duplicateLinks[groupIndex].bookmarks = duplicateLinks[groupIndex].bookmarks.filter(
            bookmark => !successfullyDeletedIds.includes(bookmark.id)
          );
          
          // 如果组内只剩下一个书签或没有书签，移除整个组
          if (duplicateLinks[groupIndex].bookmarks.length <= 1) {
            duplicateLinks.splice(groupIndex, 1);
          }
          
          chrome.storage.local.set({ duplicateLinks: duplicateLinks }, function() {
            loadDuplicateLinks(); // 重新加载结果
          });
        }
      });
    });
  }
  
  // 删除所有重复链接 (保留每组中的第一项)
  function removeAllDuplicateLinks() {
    chrome.storage.local.get(['duplicateLinks'], function(result) {
      const duplicateLinks = result.duplicateLinks || [];
      
      if (duplicateLinks.length === 0) {
        return;
      }
      
      updateSaveStatus('正在删除所有重复项...', '');
      
      // 收集所有需要删除的ID
      const bookmarkIdsToDelete = [];
      
      duplicateLinks.forEach(group => {
        // 跳过第一个书签 (保留), 只删除其他重复项
        for (let i = 1; i < group.bookmarks.length; i++) {
          bookmarkIdsToDelete.push(group.bookmarks[i].id);
        }
      });
      
      if (bookmarkIdsToDelete.length === 0) {
        updateSaveStatus('没有需要删除的重复项', 'success');
        return;
      }
      
      // 创建一个Promise数组来处理所有删除操作
      const deletePromises = bookmarkIdsToDelete.map(id => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { 
              action: 'removeBookmark',
              bookmarkId: id
            }, 
            function(response) {
              resolve({
                id: id,
                success: response.success
              });
            }
          );
        });
      });
      
      // 等待所有删除操作完成
      Promise.all(deletePromises).then(results => {
        const successCount = results.filter(r => r.success).length;
        
        // 更新状态
        updateSaveStatus(`已成功删除 ${successCount}/${bookmarkIdsToDelete.length} 个重复项`, 'success');
        
        // 清空重复链接数据 (所有组都应该只剩一项，因此不再是重复项)
        chrome.storage.local.set({ duplicateLinks: [] }, function() {
          loadDuplicateLinks(); // 重新加载结果
        });
      });
    });
  }
  
  // 更新保存状态
  function updateSaveStatus(message, type) {
    saveStatusDiv.textContent = message;
    saveStatusDiv.className = 'save-status ' + type;
    
    // 如果是成功或错误消息，3秒后清除
    if (type === 'success' || type === 'error') {
      setTimeout(function() {
        saveStatusDiv.textContent = '';
        saveStatusDiv.className = 'save-status';
      }, 3000);
    }
  }
  
  // 开始AI整理
  async function startAIOrganize() {
    try {
      console.log('开始执行startAIOrganize函数...');
      
      // 显示加载状态
      const aiOrganizeList = document.getElementById('aiOrganizeList');
      if (!aiOrganizeList) {
        console.error('找不到aiOrganizeList元素');
        return;
      }
      
      // 添加加载动画和提示
      aiOrganizeList.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <div class="loading-text">
            <div class="loading-title">正在进行AI分析...</div>
            <div class="loading-steps">
              <div class="loading-step active">1. 加载书签数据</div>
              <div class="loading-step">2. 连接AI服务</div>
              <div class="loading-step">3. 分析书签内容</div>
              <div class="loading-step">4. 生成分类建议</div>
            </div>
          </div>
        </div>
      `;
      
      // 检查当前界面上的API设置
      const currentUiSettings = {
        aiApiType: aiApiTypeSelect.value,
        apiKey: apiKeyInput.value,
        customApiEndpoint: customApiEndpointInput.value
      };
      console.log('当前界面上的API设置:', {
        aiApiType: currentUiSettings.aiApiType,
        customApiEndpoint: currentUiSettings.customApiEndpoint ? '已设置' : '未设置',
        apiKey: currentUiSettings.apiKey ? '已设置(长度:' + currentUiSettings.apiKey.length + ')' : '未设置'
      });
      
      // 检查是否需要保存设置
      const shouldSaveSettings = confirm('是否先保存当前API设置再继续？');
      if (shouldSaveSettings) {
        console.log('用户选择先保存设置');
        saveSettings();
      }
      
      // 从存储中获取API设置
      const settings = await new Promise(resolve => {
        chrome.storage.sync.get(['aiApiType', 'customApiEndpoint', 'apiKey'], resolve);
      });
      
      console.log('从存储中获取到的API设置:', {
        aiApiType: settings.aiApiType || '未设置',
        customApiEndpoint: settings.customApiEndpoint ? '已设置' : '未设置',
        apiKey: settings.apiKey ? '已设置(长度:' + settings.apiKey.length + ')' : '未设置'
      });

      // 验证API设置
      if (!settings.apiKey) {
        console.error('API Key未设置');
        throw new Error('请先在设置中添加API Key');
      }
      
      if (settings.aiApiType === 'custom' && !settings.customApiEndpoint) {
        console.error('自定义API端点未设置');
        throw new Error('请先在设置中添加自定义API端点');
      }
      
      // 更新加载步骤
      updateLoadingStep(2);
      
      // 禁用按钮
      const startOrganizeBtn = document.getElementById('startOrganizeBtn');
      startOrganizeBtn.disabled = true;
      startOrganizeBtn.textContent = '处理中...';
      
      console.log('准备发送organizeBookmarks请求...');
      try {
        // 更新加载步骤
        updateLoadingStep(3);
        
        // 直接调用API整理书签
        console.log('发送message: { action: "organizeBookmarks" }');
        const response = await chrome.runtime.sendMessage({ action: 'organizeBookmarks' });
        console.log('organizeBookmarks响应:', response);
        
        // 更新加载步骤
        updateLoadingStep(4);
        
        if (!response) {
          console.error('未收到响应');
          throw new Error('未收到后台响应，请检查扩展是否正常运行');
        }
        
        if (!response.success) {
          console.error('响应失败:', response.message);
          throw new Error(response.message || 'AI整理失败');
        }
        
        // 显示成功消息
        updateSaveStatus(response.message, 'success');
        
        // 加载结果
        await loadAIOrganizeResults();
      } catch (requestError) {
        console.error('请求过程中出错:', requestError);
        throw requestError;
      }
      
    } catch (error) {
      console.error('AI整理失败:', error);
      
      // 显示错误信息
      const aiOrganizeList = document.getElementById('aiOrganizeList');
      aiOrganizeList.innerHTML = `
        <div class="error-container">
          <div class="error-icon">❌</div>
          <div class="error-message">
            <div class="error-title">AI整理失败</div>
            <div class="error-details">${error.message || 'AI整理失败，请检查API设置和网络连接'}</div>
          </div>
        </div>
      `;
      
      updateSaveStatus(error.message || 'AI整理失败', 'error');
    } finally {
      // 恢复按钮状态
      const startOrganizeBtn = document.getElementById('startOrganizeBtn');
      startOrganizeBtn.disabled = false;
      startOrganizeBtn.textContent = '开始AI整理';
    }
  }
  
  // 更新加载步骤
  function updateLoadingStep(step) {
    const steps = document.querySelectorAll('.loading-step');
    if (!steps || steps.length === 0) return;
    
    steps.forEach((stepElement, index) => {
      if (index + 1 < step) {
        stepElement.classList.remove('active');
        stepElement.classList.add('completed');
      } else if (index + 1 === step) {
        stepElement.classList.add('active');
        stepElement.classList.remove('completed');
      } else {
        stepElement.classList.remove('active');
        stepElement.classList.remove('completed');
      }
    });
  }
  
  // 加载AI整理结果
  function loadAIOrganizeResults() {
    chrome.storage.local.get(['aiOrganizeResults'], function(result) {
      const organizeResults = result.aiOrganizeResults || [];
      
      if (organizeResults.length === 0) {
        aiOrganizeList.innerHTML = '<div class="empty-placeholder">尚未进行AI整理</div>';
        applyAllBtn.style.display = 'none';
        return;
      }
      
      aiOrganizeList.innerHTML = '';
      applyAllBtn.style.display = 'inline-block';
      
      // 按分类路径分组显示建议
      const categoryGroups = {};
      organizeResults.forEach(item => {
        const pathParts = item.suggestedCategory.split('/');
        const topCategory = pathParts[0];
        
        if (!categoryGroups[topCategory]) {
          categoryGroups[topCategory] = {
            subCategories: {},
            items: []
          };
        }
        
        if (pathParts.length > 1) {
          const subCategory = pathParts[1];
          if (!categoryGroups[topCategory].subCategories[subCategory]) {
            categoryGroups[topCategory].subCategories[subCategory] = {
              items: [],
              subCategories: {}
            };
          }
          
          if (pathParts.length > 2) {
            const thirdCategory = pathParts[2];
            if (!categoryGroups[topCategory].subCategories[subCategory].subCategories[thirdCategory]) {
              categoryGroups[topCategory].subCategories[subCategory].subCategories[thirdCategory] = {
                items: []
              };
            }
            categoryGroups[topCategory].subCategories[subCategory].subCategories[thirdCategory].items.push(item);
          } else {
            categoryGroups[topCategory].subCategories[subCategory].items.push(item);
          }
        } else {
          categoryGroups[topCategory].items.push(item);
        }
      });
      
      // 创建分类组
      Object.entries(categoryGroups).forEach(([topCategory, topGroup]) => {
        const topGroupDiv = document.createElement('div');
        topGroupDiv.className = 'category-group top-level';
        
        // 创建顶级分类标题
        const topHeader = document.createElement('div');
        topHeader.className = 'category-header';
        topHeader.innerHTML = `
          <div class="category-title">
            <span class="folder-icon">📁</span>
            ${topCategory}
            ${topGroup.items[0]?.isNewCategory ? '<span class="new-category-badge">新分类</span>' : ''}
          </div>
          <div class="category-count">${countTotalItems(topGroup)} 个书签</div>
        `;
        topGroupDiv.appendChild(topHeader);
        
        // 添加直接属于顶级分类的书签
        if (topGroup.items.length > 0) {
          const itemsDiv = createBookmarksList(topGroup.items);
          topGroupDiv.appendChild(itemsDiv);
        }
        
        // 处理二级分类
        Object.entries(topGroup.subCategories).forEach(([subCategory, subGroup]) => {
          const subGroupDiv = document.createElement('div');
          subGroupDiv.className = 'category-group sub-level';
          
          // 创建二级分类标题
          const subHeader = document.createElement('div');
          subHeader.className = 'category-header';
          subHeader.innerHTML = `
            <div class="category-title">
              <span class="folder-icon">📁</span>
              ${subCategory}
            </div>
            <div class="category-count">${countTotalItems(subGroup)} 个书签</div>
          `;
          subGroupDiv.appendChild(subHeader);
          
          // 添加直接属于二级分类的书签
          if (subGroup.items.length > 0) {
            const itemsDiv = createBookmarksList(subGroup.items);
            subGroupDiv.appendChild(itemsDiv);
          }
          
          // 处理三级分类
          Object.entries(subGroup.subCategories).forEach(([thirdCategory, thirdGroup]) => {
            const thirdGroupDiv = document.createElement('div');
            thirdGroupDiv.className = 'category-group third-level';
            
            // 创建三级分类标题
            const thirdHeader = document.createElement('div');
            thirdHeader.className = 'category-header';
            thirdHeader.innerHTML = `
              <div class="category-title">
                <span class="folder-icon">📁</span>
                ${thirdCategory}
              </div>
              <div class="category-count">${thirdGroup.items.length} 个书签</div>
            `;
            thirdGroupDiv.appendChild(thirdHeader);
            
            // 添加属于三级分类的书签
            const itemsDiv = createBookmarksList(thirdGroup.items);
            thirdGroupDiv.appendChild(itemsDiv);
            
            subGroupDiv.appendChild(thirdGroupDiv);
          });
          
          topGroupDiv.appendChild(subGroupDiv);
        });
        
        aiOrganizeList.appendChild(topGroupDiv);
      });
      
      // 添加事件监听器
      addBookmarkEventListeners();
    });
  }
  
  // 计算分类组中的总书签数
  function countTotalItems(group) {
    let count = group.items.length;
    
    if (group.subCategories) {
      Object.values(group.subCategories).forEach(subGroup => {
        count += countTotalItems(subGroup);
      });
    }
    
    return count;
  }
  
  // 创建书签列表
  function createBookmarksList(items) {
    const listDiv = document.createElement('div');
    listDiv.className = 'bookmarks-list';
    
    items.forEach(item => {
      const bookmarkDiv = document.createElement('div');
      bookmarkDiv.className = 'link-item';
      
      const currentPath = item.currentPath.length > 0 
        ? item.currentPath.join(' > ')
        : '根目录';
      
      bookmarkDiv.innerHTML = `
        <span class="link-title" title="${item.title}">${item.title || '无标题'}</span>
        <span class="link-url" title="${item.url}">${item.url}</span>
        <span class="link-path" title="当前位置: ${currentPath}">
          <div class="current-path">
            <span class="path-icon">📍</span>
            ${currentPath}
          </div>
        </span>
        <span class="link-action">
          <button class="btn small preview-move" data-id="${item.id}" data-category="${item.suggestedCategory}">预览</button>
          <button class="btn small apply-suggestion" data-id="${item.id}" data-category="${item.suggestedCategory}" style="display: none;">确认移动</button>
          <button class="btn small reject-suggestion" data-id="${item.id}">忽略</button>
        </span>
      `;
      
      listDiv.appendChild(bookmarkDiv);
    });
    
    return listDiv;
  }
  
  // 添加书签相关的事件监听器
  function addBookmarkEventListeners() {
    // 添加预览按钮事件
    document.querySelectorAll('.preview-move').forEach(button => {
      button.addEventListener('click', function() {
        const bookmarkId = this.getAttribute('data-id');
        const category = this.getAttribute('data-category');
        previewMove(this, bookmarkId, category);
      });
    });
    
    // 添加确认移动按钮事件
    document.querySelectorAll('.apply-suggestion').forEach(button => {
      button.addEventListener('click', function() {
        const bookmarkId = this.getAttribute('data-id');
        const category = this.getAttribute('data-category');
        applySuggestion(bookmarkId, category);
      });
    });
    
    // 添加忽略建议按钮事件
    document.querySelectorAll('.reject-suggestion').forEach(button => {
      button.addEventListener('click', function() {
        const bookmarkId = this.getAttribute('data-id');
        rejectSuggestion(bookmarkId);
      });
    });
  }
  
  // 预览移动效果
  function previewMove(button, bookmarkId, category) {
    // 显示确认按钮，隐藏预览按钮
    button.style.display = 'none';
    button.nextElementSibling.style.display = 'inline-block';
    
    // 高亮显示目标分类
    const linkItem = button.closest('.link-item');
    linkItem.classList.add('preview-active');
    
    // 添加预览提示
    const previewHint = document.createElement('div');
    previewHint.className = 'preview-hint';
    previewHint.innerHTML = `
      <span class="preview-arrow">➜</span>
      <span class="preview-target">
        <span class="folder-icon">📁</span> ${category}
      </span>
    `;
    
    // 在当前路径后插入预览提示
    const pathElement = linkItem.querySelector('.link-path');
    pathElement.appendChild(previewHint);
  }
  
  // 应用单个建议
  function applySuggestion(bookmarkId, category) {
    chrome.runtime.sendMessage(
      { 
        action: 'moveBookmarkToCategory',
        bookmarkId: bookmarkId,
        category: category
      }, 
      function(response) {
        if (response.success) {
          updateSaveStatus(`已将书签移动到 "${category}" 文件夹`, 'success');
          removeFromAIResults(bookmarkId);
        } else {
          updateSaveStatus(response.message || '移动书签失败', 'error');
        }
      }
    );
  }
  
  // 忽略建议
  function rejectSuggestion(bookmarkId) {
    removeFromAIResults(bookmarkId);
    updateSaveStatus('已忽略建议', 'success');
  }
  
  // 从AI结果中移除书签
  function removeFromAIResults(bookmarkId) {
    chrome.storage.local.get(['aiOrganizeResults'], function(result) {
      const organizeResults = result.aiOrganizeResults || [];
      const updatedResults = organizeResults.filter(item => item.id !== bookmarkId);
      
      chrome.storage.local.set({ aiOrganizeResults: updatedResults }, function() {
        loadAIOrganizeResults();
      });
    });
  }
  
  // 应用所有建议
  function applyAllSuggestions() {
    if (!confirm('确定要应用所有AI建议的分类吗？这将移动书签到对应的文件夹。\n\n注意：\n- 如果目标文件夹不存在，将会自动创建\n- 此操作无法撤销')) {
      return;
    }
    
    chrome.storage.local.get(['aiOrganizeResults'], function(result) {
      const organizeResults = result.aiOrganizeResults || [];
      
      if (organizeResults.length === 0) {
        return;
      }
      
      updateSaveStatus('正在应用所有建议...', '');
      
      // 创建一个Promise数组来处理所有移动操作
      const movePromises = organizeResults.map(item => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { 
              action: 'moveBookmarkToCategory',
              bookmarkId: item.id,
              category: item.suggestedCategory
            }, 
            function(response) {
              resolve({
                id: item.id,
                success: response.success
              });
            }
          );
        });
      });
      
      // 等待所有移动操作完成
      Promise.all(movePromises).then(results => {
        const successCount = results.filter(r => r.success).length;
        
        updateSaveStatus(`已成功移动 ${successCount}/${organizeResults.length} 个书签`, 'success');
        
        // 清空AI整理结果
        chrome.storage.local.set({ aiOrganizeResults: [] }, function() {
          loadAIOrganizeResults();
        });
      });
    });
  }
  
  // 扫描空文件夹
  async function scanEmptyFolders() {
    const emptyFoldersList = document.getElementById('emptyFoldersList');
    const scanEmptyFoldersBtn = document.getElementById('scanEmptyFoldersBtn');
    const removeAllEmptyFoldersBtn = document.getElementById('removeAllEmptyFoldersBtn');
    
    if (!emptyFoldersList || !scanEmptyFoldersBtn || !removeAllEmptyFoldersBtn) {
      console.error('找不到必要的DOM元素');
      return;
    }

    try {
      scanEmptyFoldersBtn.disabled = true;
      scanEmptyFoldersBtn.textContent = '正在扫描...';
      
      // 清空现有列表
      while (emptyFoldersList.firstChild) {
        emptyFoldersList.removeChild(emptyFoldersList.firstChild);
      }
      
      const response = await chrome.runtime.sendMessage({ action: 'findEmptyFolders' });
      // 检查响应格式并处理可能的不同返回格式
      const emptyFolders = Array.isArray(response) ? response : 
                          (response && response.emptyFolders ? response.emptyFolders : []);
      
      if (emptyFolders.length === 0) {
        const emptyPlaceholder = document.createElement('div');
        emptyPlaceholder.className = 'empty-placeholder';
        emptyPlaceholder.textContent = '未找到空文件夹';
        emptyFoldersList.appendChild(emptyPlaceholder);
        removeAllEmptyFoldersBtn.style.display = 'none';
      } else {
        removeAllEmptyFoldersBtn.style.display = 'inline-block';
        
        for (const folder of emptyFolders) {
          const folderPath = await getFolderPath(folder);
          const folderElement = createFolderElement(folder, folderPath);
          emptyFoldersList.appendChild(folderElement);
        }
      }
    } catch (error) {
      console.error('扫描空文件夹时出错:', error);
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.textContent = `扫描出错: ${error.message}`;
      emptyFoldersList.appendChild(errorElement);
    } finally {
      scanEmptyFoldersBtn.disabled = false;
      scanEmptyFoldersBtn.textContent = '扫描空文件夹';
    }
  }

  function createFolderElement(folder, folderPath) {
    const folderElement = document.createElement('div');
    folderElement.className = 'folder-item';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'folder-name';
    nameSpan.innerHTML = `<img src="images/folder.svg" alt="文件夹" class="folder-icon"> ${folder.title}`;
    
    const pathSpan = document.createElement('span');
    pathSpan.className = 'folder-path';
    pathSpan.textContent = folderPath;
    
    const actionSpan = document.createElement('span');
    actionSpan.className = 'folder-action';
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn danger small';
    deleteButton.textContent = '删除';
    deleteButton.onclick = () => removeEmptyFolder(folder.id);
    
    actionSpan.appendChild(deleteButton);
    folderElement.appendChild(nameSpan);
    folderElement.appendChild(pathSpan);
    folderElement.appendChild(actionSpan);
    
    return folderElement;
  }
  
  // 删除所有空文件夹
  async function removeAllEmptyFolders() {
    if (!confirm('确定要删除所有空文件夹吗？\n\n注意：\n- 如果父文件夹在删除子文件夹后变为空，也会被删除\n- 此操作无法撤销')) {
      return;
    }
    
    try {
      updateSaveStatus('正在删除空文件夹...', '');
      
      const response = await chrome.runtime.sendMessage({ action: 'removeEmptyFolders' });
      
      if (response.success) {
        document.getElementById('emptyFoldersSection').style.display = 'none';
        document.getElementById('removeAllEmptyFoldersBtn').style.display = 'none';
        updateSaveStatus(response.message, 'success');
      } else {
        updateSaveStatus(response.message, 'error');
      }
    } catch (error) {
      console.error('删除空文件夹时出错:', error);
      updateSaveStatus('删除空文件夹时出错: ' + error.message, 'error');
    }
  }
  
  // 获取文件夹路径
  function getFolderPath(folder) {
    return new Promise((resolve) => {
      const path = [];
      
      function getParent(id) {
        chrome.bookmarks.get(id, (result) => {
          if (chrome.runtime.lastError) {
            resolve(path.reverse().join(' > '));
            return;
          }
          
          const parent = result[0];
          if (parent.title) {
            path.push(parent.title);
          }
          
          if (parent.parentId && parent.id !== '0') {
            getParent(parent.parentId);
          } else {
            resolve(path.reverse().join(' > '));
          }
        });
      }
      
      if (folder.parentId) {
        getParent(folder.parentId);
      } else {
        resolve('');
      }
    });
  }
  
  // 扫描重复目录
  async function scanDuplicateFolders() {
    try {
      scanDuplicateFoldersBtn.disabled = true;
      scanDuplicateFoldersBtn.textContent = '正在扫描...';
      
      // 清空当前列表
      duplicateFoldersList.innerHTML = '<div class="empty-placeholder">正在扫描重复目录，请稍候...</div>';
      
      const response = await chrome.runtime.sendMessage({ action: 'findDuplicateFolders' });
      
      if (response.success) {
        const duplicateFolders = response.duplicateFolders;
        
        if (duplicateFolders.length === 0) {
          duplicateFoldersList.innerHTML = '<div class="empty-placeholder">未找到重复目录</div>';
        } else {
          duplicateFoldersList.innerHTML = '';
          
          // 创建重复目录组
          duplicateFolders.forEach((group, index) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'duplicate-folder-group';
            
            // 创建组标题
            const groupHeader = document.createElement('div');
            groupHeader.className = 'duplicate-group-header';
            groupHeader.innerHTML = `
              <div class="group-title">
                <span class="folder-icon">📁</span>
                重复目录组 #${index + 1} - "${group.name}"
              </div>
              <div class="group-count">${group.folders.length} 个文件夹</div>
            `;
            groupDiv.appendChild(groupHeader);
            
            // 创建文件夹列表
            const foldersDiv = document.createElement('div');
            foldersDiv.className = 'duplicate-folders';
            
            // 添加每个重复文件夹
            group.folders.forEach((folder, folderIndex) => {
              const folderDiv = document.createElement('div');
              folderDiv.className = 'duplicate-folder-item';
              
              const path = folder.path.join(' > ') || '根目录';
              
              folderDiv.innerHTML = `
                <div class="folder-info">
                  <div class="folder-title">
                    <span class="folder-icon">📁</span>
                    ${folder.title}
                  </div>
                  <div class="folder-path" title="${path}">
                    <span class="path-icon">📍</span>
                    ${path}
                  </div>
                </div>
                <div class="folder-actions">
                  <button class="btn small merge-target" data-group="${index}" data-folder-id="${folder.id}">
                    选为合并目标
                  </button>
                </div>
              `;
              
              foldersDiv.appendChild(folderDiv);
            });
            
            groupDiv.appendChild(foldersDiv);
            duplicateFoldersList.appendChild(groupDiv);
          });
          
          // 添加合并按钮事件
          addMergeButtonListeners();
        }
      } else {
        duplicateFoldersList.innerHTML = `
          <div class="error-message">
            扫描重复目录时出错: ${response.message}
          </div>
        `;
      }
    } catch (error) {
      console.error('扫描重复目录时出错:', error);
      duplicateFoldersList.innerHTML = `
        <div class="error-message">
          扫描重复目录时出错: ${error.message}
        </div>
      `;
    } finally {
      scanDuplicateFoldersBtn.disabled = false;
      scanDuplicateFoldersBtn.textContent = '扫描重复目录';
    }
  }
  
  // 添加合并按钮事件监听器
  function addMergeButtonListeners() {
    document.querySelectorAll('.merge-target').forEach(button => {
      button.addEventListener('click', async function() {
        const groupIndex = this.getAttribute('data-group');
        const targetId = this.getAttribute('data-folder-id');
        const group = document.querySelectorAll(`[data-group="${groupIndex}"]`);
        
        // 更新按钮状态
        group.forEach(btn => {
          if (btn === this) {
            btn.textContent = '已选择为目标';
            btn.disabled = true;
            btn.classList.add('selected');
          } else {
            btn.textContent = '合并到选中目标';
            btn.disabled = false;
            btn.classList.remove('merge-target');
            btn.classList.add('merge-source');
            
            // 添加合并事件
            btn.onclick = async () => {
              if (confirm('确定要将此文件夹合并到选中的目标文件夹吗？此操作不可撤销。')) {
                const sourceId = btn.getAttribute('data-folder-id');
                const response = await chrome.runtime.sendMessage({
                  action: 'mergeFolders',
                  sourceId: sourceId,
                  targetId: targetId
                });
                
                if (response.success) {
                  updateSaveStatus('文件夹合并成功', 'success');
                  // 重新扫描显示最新状态
                  scanDuplicateFolders();
                } else {
                  updateSaveStatus(response.message, 'error');
                }
              }
            };
          }
        });
      });
    });
  }
  
  // 自动合并重复目录
  async function autoMergeDuplicateFolders() {
    try {
      autoMergeDuplicateFoldersBtn.disabled = true;
      autoMergeDuplicateFoldersBtn.textContent = '正在合并...';
      
      const response = await chrome.runtime.sendMessage({ action: 'autoMergeDuplicateFolders' });
      
      if (response.success) {
        updateSaveStatus(response.message, 'success');
        // 重新扫描显示最新状态
        await scanDuplicateFolders();
      } else {
        updateSaveStatus(response.message, 'error');
      }
    } catch (error) {
      console.error('自动合并重复目录时出错:', error);
      updateSaveStatus('自动合并重复目录时出错: ' + error.message, 'error');
    } finally {
      autoMergeDuplicateFoldersBtn.disabled = false;
      autoMergeDuplicateFoldersBtn.textContent = '自动合并所有重复目录';
    }
  }

  // 处理AI整理进度更新
  function updateAIOrganizeProgress(data) {
    console.log('收到AI整理进度:', data);
    
    // 根据不同的阶段更新界面
    switch(data.stage) {
      case 'start':
        // 开始阶段，无需额外操作
        updateLoadingStep(1);
        break;
      case 'collecting':
        // 收集书签阶段
        updateLoadingStep(1);
        break;
      case 'analyzing':
        // AI分析阶段
        updateLoadingStep(2);
        break;
      case 'organizing':
        // 生成建议阶段
        updateLoadingStep(3);
        break;
      case 'complete':
        // 完成阶段
        updateLoadingStep(4);
        // 延迟一秒显示"完成"状态
        setTimeout(() => {
          const loadingContainer = document.querySelector('.loading-container');
          if (loadingContainer) {
            loadingContainer.innerHTML = `
              <div class="complete-icon">✅</div>
              <div class="complete-message">
                <div class="complete-title">AI分析完成</div>
                <div class="complete-details">已生成 ${data.suggestions} 个分类建议</div>
              </div>
            `;
            
            // 再延迟1.5秒加载结果
            setTimeout(() => {
              loadAIOrganizeResults();
            }, 1500);
          }
        }, 1000);
        break;
      case 'error':
        // 错误阶段
        const aiOrganizeList = document.getElementById('aiOrganizeList');
        if (aiOrganizeList) {
          aiOrganizeList.innerHTML = `
            <div class="error-container">
              <div class="error-icon">❌</div>
              <div class="error-message">
                <div class="error-title">AI整理失败</div>
                <div class="error-details">${data.message || 'AI整理过程中出现错误'}</div>
              </div>
            </div>
          `;
        }
        break;
    }
  }
});

// 在 options.css 中添加样式
const style = document.createElement('style');
style.textContent = `
  .duplicate-folder-group {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;
  }
  
  .duplicate-group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f5f7fa;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .group-title {
    font-weight: 600;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .group-count {
    font-size: 0.9em;
    color: #666;
    background: rgba(0, 0, 0, 0.05);
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .duplicate-folders {
    padding: 12px;
  }
  
  .duplicate-folder-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid #eee;
  }
  
  .duplicate-folder-item:last-child {
    border-bottom: none;
  }
  
  .folder-info {
    flex: 1;
  }
  
  .folder-title {
    font-weight: 500;
    color: #2c3e50;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .folder-path {
    font-size: 0.85em;
    color: #666;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .folder-actions {
    display: flex;
    gap: 8px;
  }
  
  .merge-target {
    background-color: #2196F3;
    color: white;
  }
  
  .merge-target:hover {
    background-color: #1976D2;
  }
  
  .merge-target.selected {
    background-color: #4CAF50;
  }
  
  .merge-source {
    background-color: #FF9800;
    color: white;
  }
  
  .merge-source:hover {
    background-color: #F57C00;
  }
`;

document.head.appendChild(style); 