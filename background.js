// 全局变量
let isProcessing = false;

// 监听来自popup和options页面的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('接收到消息:', request.action);
  
  switch (request.action) {
    case 'organizeBookmarks':
      console.log('准备执行organizeBookmarks函数...');
      // 记录当前isProcessing状态
      console.log('当前isProcessing状态:', isProcessing);
      
      if (isProcessing) {
        console.log('拒绝执行：另一个操作正在进行中');
        sendResponse({ success: false, message: '另一个操作正在进行中，请稍后再试' });
      } else {
        console.log('开始执行organizeBookmarks函数...');
        
        // 使用try-catch包裹异步操作
        try {
          organizeBookmarks().then(result => {
            console.log('organizeBookmarks执行完成，结果:', result);
            try {
              sendResponse(result);
              console.log('成功发送响应');
            } catch (responseError) {
              console.error('发送响应时出错:', responseError);
            }
          }).catch(error => {
            console.error('整理书签出错:', error);
            try {
              sendResponse({ success: false, message: '整理书签时出错: ' + error.message });
              console.log('成功发送错误响应');
            } catch (responseError) {
              console.error('发送错误响应时出错:', responseError);
            }
          });
        } catch (executionError) {
          console.error('执行organizeBookmarks时发生同步错误:', executionError);
          try {
            sendResponse({ success: false, message: '执行时出错: ' + executionError.message });
          } catch (responseError) {
            console.error('发送同步错误响应时出错:', responseError);
          }
        }
      }
      return true; // 异步响应

    case 'checkInvalidLinks':
      if (isProcessing) {
        sendResponse({ success: false, message: '另一个操作正在进行中，请稍后再试' });
      } else {
        checkInvalidLinks().then(result => {
          sendResponse(result);
        }).catch(error => {
          console.error('检测无效链接出错:', error);
          sendResponse({ success: false, message: '检测无效链接时出错: ' + error.message });
        });
      }
      return true; // 异步响应

    case 'checkDuplicateLinks':
      if (isProcessing) {
        sendResponse({ success: false, message: '另一个操作正在进行中，请稍后再试' });
      } else {
        checkDuplicateLinks().then(result => {
          sendResponse(result);
        }).catch(error => {
          console.error('检测重复链接出错:', error);
          sendResponse({ success: false, message: '检测重复链接时出错: ' + error.message });
        });
      }
      return true; // 异步响应

    case 'testApiConnection':
      testApiConnection(request.apiType, request.apiKey, request.customApiEndpoint).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('测试API连接出错:', error);
        sendResponse({ success: false, message: '测试API连接时出错: ' + error.message });
      });
      return true; // 异步响应

    case 'removeBookmark':
      removeBookmark(request.bookmarkId).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('删除书签出错:', error);
        sendResponse({ success: false, message: '删除书签时出错: ' + error.message });
      });
      return true; // 异步响应
      
    case 'ignoreDomain':
      addDomainToIgnoreList(request.url).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('添加域名到忽略列表出错:', error);
        sendResponse({ success: false, message: '添加域名到忽略列表出错: ' + error.message });
      });
      return true; // 异步响应
      
    case 'getIgnoredDomains':
      chrome.storage.local.get(['ignoredDomains'], function(result) {
        sendResponse({ success: true, domains: result.ignoredDomains || [] });
      });
      return true; // 异步响应
      
    case 'removeIgnoredDomain':
      removeIgnoredDomain(request.domain).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('从忽略列表移除域名出错:', error);
        sendResponse({ success: false, message: '从忽略列表移除域名出错: ' + error.message });
      });
      return true; // 异步响应

    case 'moveBookmarkToCategory':
      moveBookmarkToCategory(request.bookmarkId, request.category).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('移动书签出错:', error);
        sendResponse({ success: false, message: '移动书签时出错: ' + error.message });
      });
      return true; // 异步响应

    case 'scanEmptyFolders':
      scanEmptyFolders().then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('扫描空文件夹出错:', error);
        sendResponse({ success: false, message: '扫描空文件夹时出错: ' + error.message });
      });
      return true; // 异步响应

    case 'removeEmptyFolders':
      removeEmptyFolders().then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('删除空文件夹时出错:', error);
        sendResponse({ success: false, message: '删除空文件夹时出错: ' + error.message });
      });
      return true; // 异步响应

    case 'findDuplicateFolders':
      findDuplicateFolders().then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('查找重复文件夹出错:', error);
        sendResponse({ success: false, message: '查找重复文件夹时出错: ' + error.message });
      });
      return true;
      
    case 'mergeFolders':
      mergeFolders(request.sourceId, request.targetId).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('合并文件夹出错:', error);
        sendResponse({ success: false, message: '合并文件夹时出错: ' + error.message });
      });
      return true;

    case 'autoMergeDuplicateFolders':
      autoMergeDuplicateFolders().then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('自动合并重复目录出错:', error);
        sendResponse({ success: false, message: '自动合并重复目录时出错: ' + error.message });
      });
      return true;

    case 'findEmptyFolders':
      findEmptyFolders().then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('查找空文件夹出错:', error);
        sendResponse({ success: false, message: '查找空文件夹时出错: ' + error.message });
      });
      return true;

    case 'getAllBookmarks':
      getAllBookmarks().then(result => {
        sendResponse(result);
      }).catch(error => {
        sendResponse({
          success: false,
          bookmarks: [],
          message: '获取书签失败: ' + error.message
        });
      });
      return true;

    case 'updateKnownValidDomains':
      updateKnownValidDomains(request.domains).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('更新已知有效域名列表出錯:', error);
        sendResponse({ success: false, message: '更新已知有效域名列表出錯: ' + error.message });
      });
      return true;

    case 'findOldBookmarks':
      findOldBookmarks(request.monthsThreshold).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('查找舊書籤出錯:', error);
        sendResponse({ success: false, message: '查找舊書籤出錯: ' + error.message });
      });
      return true;

    case 'removeOldBookmarks':
      removeOldBookmarks(request.bookmarkIds).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('刪除舊書籤出錯:', error);
        sendResponse({ success: false, message: '刪除舊書籤出錯: ' + error.message });
      });
      return true;

    case 'getRecentBookmarks':
      getRecentBookmarks(request.limit).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('獲取最新書籤出錯:', error);
        sendResponse({ success: false, message: '獲取最新書籤出錯: ' + error.message });
      });
      return true;
  }
});

// 监听定时任务
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === 'scheduledScan') {
    console.log('执行定时任务:', new Date().toLocaleString());
    if (!isProcessing) {
      // 先检测重复链接
      checkDuplicateLinks().then(() => {
        // 然后检测无效链接
        return checkInvalidLinks();
      }).catch(error => {
        console.error('定时任务执行出错:', error);
      });
    }
  }
});

// 处理扩展安装或更新
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    console.log('扩展已安装');
    // 可以添加首次安装提示或初始化设置
  } else if (details.reason === 'update') {
    console.log('扩展已更新，版本:', chrome.runtime.getManifest().version);
  }
});

// AI整理书签
async function organizeBookmarks() {
  console.log('organizeBookmarks函数开始执行');
  try {
    console.log('开始 organizeBookmarks 函数执行...');
    console.log('设置 isProcessing = true');
    isProcessing = true;

    // 发送进度通知 - 开始
    try {
      chrome.runtime.sendMessage({
        action: 'aiOrganizeProgress',
        stage: 'start',
        message: '开始AI整理书签'
      });
      console.log('已发送开始进度通知');
    } catch (notifyError) {
      console.error('发送开始通知出错:', notifyError);
    }

    // 获取设置
    console.log('开始获取用户设置...');
    const settings = await getSettings();
    console.log('成功获取设置:', settings);
    
    // 检查API Key是否存在
    if (!settings.apiKey) {
      console.log('错误: 未设置 API Key');
      isProcessing = false;
      return { success: false, message: '请先在设置中添加API Key' };
    }
    
    // 检查自定义模型是否提供了API端点
    if (settings.aiApiType === 'custom' && !settings.customApiEndpoint) {
      console.log('错误: 使用自定义API但未设置API端点');
      isProcessing = false;
      return { success: false, message: '请先在设置中添加自定义API端点' };
    }

    // 获取所有书签
    console.log('获取所有书签...');
    // 发送进度通知 - 获取书签
    chrome.runtime.sendMessage({
      action: 'aiOrganizeProgress',
      stage: 'collecting',
      message: '正在收集书签数据'
    });
    
    const bookmarksResult = await getAllBookmarks();
    console.log('书签获取结果:', bookmarksResult);
    
    if (!bookmarksResult.success) {
      isProcessing = false;
      return { success: false, message: bookmarksResult.message };
    }
    
    const bookmarks = bookmarksResult.bookmarks;
    console.log(`获取到 ${bookmarks.length} 个书签`);
    
    // 如果书签太少，不需要整理
    if (bookmarks.length < 5) {
      console.log('书签数量太少，无需整理');
      isProcessing = false;
      return { success: false, message: '书签太少，无需整理' };
    }

    // 准备用于AI处理的数据
    console.log('准备AI处理数据...');
    const bookmarksData = bookmarks.map(bookmark => ({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      path: bookmark.path || []
    }));
    
    // 发送进度通知 - 开始AI分析
    chrome.runtime.sendMessage({
      action: 'aiOrganizeProgress',
      stage: 'analyzing',
      message: '正在进行AI分析'
    });
    
    // 发送到AI服务进行分类
    console.log('调用AI分类服务...');
    const categories = await classifyBookmarksWithAI(bookmarksData, settings);
    console.log('AI分类结果:', categories);
    
    // 发送进度通知 - 生成建议
    chrome.runtime.sendMessage({
      action: 'aiOrganizeProgress',
      stage: 'organizing',
      message: '正在生成分类建议'
    });
    
    // 获取现有文件夹
    console.log('获取现有文件夹...');
    const bookmarksBarId = '1';
    const existingFolders = await chrome.bookmarks.getChildren(bookmarksBarId);
    const existingCategories = existingFolders
      .filter(folder => !folder.url)
      .map(folder => folder.title);
    console.log('现有分类:', existingCategories);
    
    // 准备建议结果
    console.log('准备建议结果...');
    const suggestions = [];
    for (const bookmark of bookmarks) {
      const category = categories[bookmark.id];
      if (category) {
        suggestions.push({
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          currentPath: bookmark.path || [],
          suggestedCategory: category,
          isNewCategory: !existingCategories.includes(category)
        });
      }
    }
    console.log(`生成了 ${suggestions.length} 个建议`);
    
    // 保存建议结果
    await chrome.storage.local.set({ 
      aiOrganizeResults: suggestions,
      aiAnalysisTimestamp: Date.now()
    });
    console.log('已保存建议结果到本地存储');
    
    // 发送进度通知 - 完成
    chrome.runtime.sendMessage({
      action: 'aiOrganizeProgress',
      stage: 'complete',
      message: '分析完成',
      suggestions: suggestions.length
    });
    
    isProcessing = false;
    return { 
      success: true, 
      message: `AI分析完成，共有 ${suggestions.length} 个建议` 
    };
  } catch (error) {
    isProcessing = false;
    console.error('整理书签出错:', error);
    console.error('错误详情:', error.stack || '无堆栈信息');
    
    // 发送进度通知 - 错误
    try {
      chrome.runtime.sendMessage({
        action: 'aiOrganizeProgress',
        stage: 'error',
        message: '分析出错: ' + error.message
      });
      console.log('已发送错误进度通知');
    } catch (notifyError) {
      console.error('发送错误通知出错:', notifyError);
    }
    
    return { success: false, message: '整理书签时出错: ' + error.message };
  }
}

// 使用AI对书签进行分类
async function classifyBookmarksWithAI(bookmarks, settings) {
  try {
    console.log('开始书签分类，使用模型:', settings.aiApiType);
    // 每次处理的书签数量
    const batchSize = 20;
    const categories = {};
    const totalBatches = Math.ceil(bookmarks.length / batchSize);
    
    // 分批处理书签
    for (let i = 0; i < bookmarks.length; i += batchSize) {
      const batchNumber = Math.floor(i / batchSize) + 1;
      const batch = bookmarks.slice(i, i + batchSize);
      
      // 构建Prompt
      const prompt = createClassificationPrompt(batch);
      console.log('Prompt 构建完成，长度:', prompt.length);
      
      try {
        // 调用API
        console.log(`开始调用 ${settings.aiApiType} API，批次 ${batchNumber}/${totalBatches}`);
        const results = await callAIApi(prompt, settings);
        console.log(`API调用完成，批次 ${batchNumber}/${totalBatches}，响应长度:`, results.length);
        
        // 解析结果
        const batchCategories = parseCategoryResults(results, batch);
        const categoryCount = Object.keys(batchCategories).length;
        console.log(`解析完成，批次 ${batchNumber}/${totalBatches}，成功分类 ${categoryCount}/${batch.length} 个书签`);
        
        // 合并结果
        Object.assign(categories, batchCategories);
      } catch (batchError) {
        console.error(`批次 ${batchNumber}/${totalBatches} 处理失败:`, batchError);
      }
      
      // 添加短暂延迟，避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const totalCategorized = Object.keys(categories).length;
    console.log(`分类完成，共 ${totalCategorized}/${bookmarks.length} 个书签被成功分类`);
    
    return categories;
  } catch (error) {
    console.error('AI分类出错:', error);
    throw error;
  }
}

// 检测无效链接
async function checkInvalidLinks() {
  try {
    isProcessing = true;

    // 获取所有书签
    const bookmarksResult = await getAllBookmarks();

    if (!bookmarksResult.success) {
      isProcessing = false;
      return { success: false, message: bookmarksResult.message };
    }

    const bookmarks = bookmarksResult.bookmarks;

    // 获取已存在的无效链接数据
    const invalidLinksData = await chrome.storage.local.get(['invalidLinks']);
    let invalidLinks = invalidLinksData.invalidLinks || [];

    // 获取忽略的域名列表
    const ignoredDomainsData = await chrome.storage.local.get(['ignoredDomains']);
    const ignoredDomains = ignoredDomainsData.ignoredDomains || [];

    // 过滤出需要检查的书签，排除忽略的域名
    const bookmarksToCheck = bookmarks.filter(bookmark => {
      if (!bookmark.url) return false;
      
      try {
        const url = new URL(bookmark.url);
        const hostname = url.hostname.toLowerCase();
        
        // 如果域名在忽略列表中，跳过此书签
        return !ignoredDomains.some(domain => hostname.includes(domain));
      } catch (e) {
        return true; // 如果URL格式错误，依然检查
      }
    });
    
    // 初始化进度信息
    const totalBookmarks = bookmarksToCheck.length;
    let processedCount = 0;
    
    // 通知开始扫描
    chrome.runtime.sendMessage({
      action: 'scanProgress',
      current: processedCount,
      total: totalBookmarks,
      percentage: 0
    });
    
    // 以小批量进行处理，避免过多并发请求
    const batchSize = 5;
    const results = [];
    
    for (let i = 0; i < bookmarksToCheck.length; i += batchSize) {
      const batch = bookmarksToCheck.slice(i, i + batchSize);
      const batchPromises = batch.map(bookmark => checkLinkValidity(bookmark));
      
      // 等待当前批次完成
      const batchResults = await Promise.allSettled(batchPromises);
      
      // 处理结果
      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        }
      });
      
      // 更新进度
      processedCount += batch.length;
      const percentage = Math.round((processedCount / totalBookmarks) * 100);
      
      // 发送进度更新
      chrome.runtime.sendMessage({
        action: 'scanProgress',
        current: processedCount,
        total: totalBookmarks,
        percentage: percentage
      });
      
      // 添加短暂延迟，避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // 提取无效链接
    invalidLinks = results.filter(result => !result.valid).map(result => ({
      id: result.bookmark.id,
      title: result.bookmark.title,
      url: result.bookmark.url,
      status: result.status
    }));
    
    // 保存无效链接数据
    await chrome.storage.local.set({ invalidLinks });
    
    // 发送100%完成信号
    chrome.runtime.sendMessage({
      action: 'scanProgress',
      current: totalBookmarks,
      total: totalBookmarks,
      percentage: 100,
      completed: true
    });
    
    isProcessing = false;
    return { 
      success: true, 
      message: `检测完成，发现 ${invalidLinks.length} 个无效链接` 
    };
  } catch (error) {
    isProcessing = false;
    console.error('检测无效链接出错:', error);
    
    // 发送错误信号
    chrome.runtime.sendMessage({
      action: 'scanProgress',
      error: true,
      message: error.message
    });
    
    return { success: false, message: '检测无效链接时出错: ' + error.message };
  }
}

// 添加域名到忽略列表
async function addDomainToIgnoreList(url) {
  try {
    // 提取域名
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // 获取当前忽略列表
    const data = await chrome.storage.local.get(['ignoredDomains']);
    let ignoredDomains = data.ignoredDomains || [];
    
    // 如果域名不在列表中，添加它
    if (!ignoredDomains.includes(hostname)) {
      ignoredDomains.push(hostname);
      await chrome.storage.local.set({ ignoredDomains });
    }
    
    return { success: true };
  } catch (error) {
    console.error('添加到忽略列表出错:', error);
    return { success: false, message: '添加到忽略列表出错: ' + error.message };
  }
}

// 检测重复链接
async function checkDuplicateLinks() {
  try {
    isProcessing = true;

    // 获取所有书签
    const bookmarks = await getAllBookmarks();
    
    // 过滤掉没有URL的书签
    const validBookmarks = bookmarks.filter(bookmark => bookmark.url);
    
    // 使用Map查找重复项
    const urlMap = new Map();
    
    // 为每个书签收集完整路径
    for (const bookmark of validBookmarks) {
      // 查找完整路径
      const path = await getBookmarkPath(bookmark.id);
      // 添加路径信息到书签对象
      bookmark.path = path;
    }
    
    // 规范化URL并记录重复项
    validBookmarks.forEach(bookmark => {
      const normalizedUrl = normalizeUrl(bookmark.url);
      
      if (urlMap.has(normalizedUrl)) {
        urlMap.get(normalizedUrl).push(bookmark);
      } else {
        urlMap.set(normalizedUrl, [bookmark]);
      }
    });
    
    // 提取重复链接组
    const duplicateGroups = [];
    urlMap.forEach((bookmarkList, normalizedUrl) => {
      if (bookmarkList.length > 1) {
        // 如果有多个书签指向同一规范化URL，记录为重复组
        duplicateGroups.push({
          normalizedUrl,
          bookmarks: bookmarkList.map(bookmark => ({
            id: bookmark.id,
            title: bookmark.title,
            url: bookmark.url,
            parentId: bookmark.parentId,
            parentTitle: bookmark.parentTitle,
            path: bookmark.path // 包含完整路径
          }))
        });
      }
    });
    
    // 保存重复链接数据
    await chrome.storage.local.set({ duplicateLinks: duplicateGroups });
    
    // 计算重复链接总数
    const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.bookmarks.length - 1, 0);
    
    isProcessing = false;
    return { 
      success: true, 
      message: `检测完成，发现 ${duplicateGroups.length} 组重复链接，共 ${totalDuplicates} 个重复项` 
    };
  } catch (error) {
    isProcessing = false;
    console.error('检测重复链接出错:', error);
    return { success: false, message: '检测重复链接时出错: ' + error.message };
  }
}

// 获取书签的完整路径
async function getBookmarkPath(bookmarkId) {
  try {
    const path = [];
    let currentId = bookmarkId;
    
    while (currentId) {
      // 获取当前书签节点
      const bookmarkNode = await chrome.bookmarks.get(currentId);
      
      if (bookmarkNode && bookmarkNode.length > 0) {
        const node = bookmarkNode[0];
        
        // 如果是文件夹（非根文件夹），添加到路径
        if (node.title) {
          // 非书签本身
          if (currentId !== bookmarkId) {
            path.unshift(node.title);
          }
        }
        
        // 移动到父节点
        currentId = node.parentId;
        
        // 如果是根节点，添加根目录名称
        if (currentId === "0") {
          break;
        } else if (currentId === "1") {
          path.unshift("书签栏");
          break;
        } else if (currentId === "2") {
          path.unshift("其他书签");
          break;
        }
      } else {
        break;
      }
    }
    
    return path;
  } catch (error) {
    console.error('获取书签路径失败:', error);
    return [];
  }
}

// 测试API连接
async function testApiConnection(apiType, apiKey, customApiEndpoint) {
  try {
    console.log(`开始测试API连接: ${apiType}`);
    
    if (!apiKey) {
      console.error('API Key未设置');
      return { success: false, message: '请输入API Key' };
    }
    
    // 选择API端点
    let endpoint;
    let headers = {
      'Content-Type': 'application/json'
    };
    let body;
    
    if (apiType === 'gemini') {
      console.log('使用Gemini API进行测试');
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
      body = JSON.stringify({
        contents: [{
          parts: [{
            text: "Hello, I'm testing the connection. Please respond with 'Connection successful'."
          }]
        }]
      });
    } else if (apiType === 'openai') {
      console.log('使用OpenAI API进行测试');
      endpoint = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user', 
            content: "Hello, I'm testing the connection. Please respond with 'Connection successful'."
          }
        ],
        max_tokens: 20
      });
    } else if (apiType === 'deepseek') {
      console.log('使用DeepSeek API进行测试');
      endpoint = 'https://api.deepseek.com/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body = JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: "Hello, I'm testing the connection. Please respond with 'Connection successful'."
          }
        ],
        stream: false
      });
    } else if (apiType === 'custom') {
      console.log('使用自定义API进行测试');
      if (!customApiEndpoint) {
        console.error('自定义API端点未设置');
        return { success: false, message: '请输入自定义API端点' };
      }
      
      endpoint = customApiEndpoint;
      // 自定义模型可能需要不同的认证方式，这里使用通用的Bearer token
      headers['Authorization'] = `Bearer ${apiKey}`;
      
      // 使用通用的请求格式，用户需要确保自定义端点能处理此格式
      body = JSON.stringify({
        messages: [
          {
            role: 'user', 
            content: "Hello, I'm testing the connection. Please respond with 'Connection successful'."
          }
        ]
      });
    } else {
      console.error('不支持的API类型:', apiType);
      return { success: false, message: '不支持的API类型' };
    }
    
    console.log(`测试API连接: ${apiType}, 端点: ${endpoint.split('?')[0]}`);
    
    // 发送测试请求
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: body
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`API连接失败: 状态码 ${response.status}, 错误: ${error}`);
      return { success: false, message: `API连接失败: ${response.status} ${error}` };
    }
    
    console.log('API连接测试成功');
    return { success: true, message: 'API连接成功' };
  } catch (error) {
    console.error('测试API连接出错:', error);
    console.error('错误详情:', error.stack || '无堆栈信息');
    return { success: false, message: '测试API连接时出错: ' + error.message };
  }
}

// 删除书签
async function removeBookmark(bookmarkId) {
  try {
    await chrome.bookmarks.remove(bookmarkId);
    return { success: true };
  } catch (error) {
    console.error('删除书签出错:', error);
    return { success: false, message: '删除书签时出错: ' + error.message };
  }
}

// 获取所有书签
async function getAllBookmarks() {
  try {
    const bookmarks = await chrome.bookmarks.getTree();
    const flattenedBookmarks = [];
    
    // 递归遍历书签树
    function traverseBookmarks(nodes, path = []) {
      for (const node of nodes) {
        if (node.url) {
          // 这是一个书签
          flattenedBookmarks.push({
            id: node.id,
            title: node.title,
            url: node.url,
            path: [...path]
          });
        } else if (node.children) {
          // 这是一个文件夹
          traverseBookmarks(node.children, [...path, node.title]);
        }
      }
    }
    
    traverseBookmarks(bookmarks);
    
    return {
      success: true,
      bookmarks: flattenedBookmarks,
      message: `成功获取 ${flattenedBookmarks.length} 个书签`
    };
  } catch (error) {
    console.error('获取书签时出错:', error);
    return {
      success: false,
      bookmarks: [],
      message: '获取书签失败: ' + error.message
    };
  }
}

// 规范化URL
function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    let { hostname, pathname, search, hash } = urlObj;
    
    // 移除 www.
    hostname = hostname.replace(/^www\./, '');
    
    // 移除末尾斜杠
    pathname = pathname.replace(/\/$/, '');
    
    // 返回规范化的URL (忽略参数和锚点)
    return `${hostname}${pathname}`.toLowerCase();
  } catch (e) {
    // 处理无效URL
    return url.toLowerCase();
  }
}

// 获取用户设置
async function getSettings() {
  try {
    const items = await chrome.storage.sync.get(['aiApiType', 'customApiEndpoint', 'apiKey', 'scheduledScans']);
    return {
      aiApiType: items.aiApiType || 'gemini',
      customApiEndpoint: items.customApiEndpoint || '',
      apiKey: items.apiKey || '',
      scheduledScans: items.scheduledScans || 'never'
    };
  } catch (error) {
    console.error('获取设置出错:', error);
    throw error;
  }
}

// 解析分类结果
function parseCategoryResults(results, bookmarks) {
  try {
    console.log('解析分类结果:', results);
    const categories = {};
    
    // 清理结果文本，移除多余前缀和可能的代码块标记
    let cleanedResults = results;
    if (results.includes('```')) {
      cleanedResults = results.split('```').filter(block => block.includes(':') || block.includes('：')).join('\n');
    }
    
    // 切分行
    const lines = cleanedResults.split('\n');
    
    for (const line of lines) {
      // 跳过空行
      if (!line.trim()) continue;
      
      // 尝试匹配 "书签ID: 分类路径" 格式 (支持多种分隔符形式)
      const match = line.match(/\b(\w+)\s*(?::|：)\s*(.+)$/);
      if (match) {
        const id = match[1];
        const categoryPath = match[2].trim();
        
        // 验证ID是否在书签列表中
        if (bookmarks.some(b => b.id === id) && categoryPath) {
          categories[id] = categoryPath;
          console.log(`成功匹配书签 ${id} 到分类 ${categoryPath}`);
        } else {
          console.log(`未找到匹配的书签ID: ${id}`);
        }
      } else {
        console.log(`无法解析行: ${line}`);
      }
    }
    
    console.log('解析结果:', categories);
    return categories;
  } catch (error) {
    console.error('解析分类结果出错:', error);
    return {}; // 出错时返回空对象而不是抛出错误
  }
}

// 将书签整理到文件夹中
async function organizeBookmarksToFolders(bookmarks, categories) {
  try {
    // 创建文件夹映射 (分类路径 -> 文件夹ID)
    const folderMap = new Map();
    
    // 用于跟踪统计信息
    const stats = {
      successCount: 0,
      errorCount: 0,
      folders: []
    };
    
    // 获取"书签栏"文件夹ID
    const bookmarksBarId = '1';
    
    // 收集所有唯一的分类路径
    const uniquePaths = new Set();
    Object.values(categories).forEach(path => {
      const parts = path.split('/');
      let currentPath = '';
      parts.forEach(part => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        uniquePaths.add(currentPath);
      });
    });
    
    // 按路径长度排序，确保先创建上层文件夹
    const sortedPaths = Array.from(uniquePaths).sort((a, b) => 
      (a.match(/\//g) || []).length - (b.match(/\//g) || []).length
    );
    
    // 创建或查找所有必要的文件夹
    for (const path of sortedPaths) {
      const parts = path.split('/');
      let parentId = bookmarksBarId;
      let currentPath = '';
      
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!folderMap.has(currentPath)) {
          // 在当前层级查找同名或相似文件夹
          const siblings = await chrome.bookmarks.getChildren(parentId);
          let existingFolder = siblings.find(f => 
            !f.url && (f.title.toLowerCase() === part.toLowerCase() || isSimilarFolderName(f.title, part))
          );
          
          if (existingFolder) {
            // 使用现有文件夹
            folderMap.set(currentPath, existingFolder.id);
            parentId = existingFolder.id;
          } else {
            // 创建新文件夹
            try {
              const newFolder = await chrome.bookmarks.create({
                parentId: parentId,
                title: part
              });
              folderMap.set(currentPath, newFolder.id);
              parentId = newFolder.id;
              stats.folders.push(currentPath);
            } catch (error) {
              console.error(`创建文件夹 "${path}" 出错:`, error);
            }
          }
        } else {
          parentId = folderMap.get(currentPath);
        }
      }
    }
    
    // 移动书签到对应文件夹
    for (const bookmark of bookmarks) {
      const categoryPath = categories[bookmark.id];
      
      if (categoryPath && folderMap.has(categoryPath)) {
        const folderId = folderMap.get(categoryPath);
        
        try {
          // 移动书签
          await chrome.bookmarks.move(bookmark.id, {
            parentId: folderId
          });
          
          stats.successCount++;
        } catch (error) {
          console.error(`移动书签 "${bookmark.title}" 出错:`, error);
          stats.errorCount++;
        }
      }
    }
    
    return stats;
  } catch (error) {
    console.error('整理书签到文件夹出错:', error);
    throw error;
  }
}

// 检查两个文件夹名称是否相似
function isSimilarFolderName(name1, name2) {
  // 转换为小写并移除空格
  const clean1 = name1.toLowerCase().replace(/\s+/g, '');
  const clean2 = name2.toLowerCase().replace(/\s+/g, '');
  
  // 如果完全相同
  if (clean1 === clean2) return true;
  
  // 如果一个包含另一个
  if (clean1.includes(clean2) || clean2.includes(clean1)) return true;
  
  // 计算编辑距离
  const distance = levenshteinDistance(clean1, clean2);
  const maxLength = Math.max(clean1.length, clean2.length);
  
  // 如果编辑距离小于较长字符串长度的30%，认为是相似的
  return distance <= maxLength * 0.3;
}

// 计算编辑距离
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,  // 替换
          dp[i - 1][j] + 1,      // 删除
          dp[i][j - 1] + 1       // 插入
        );
      }
    }
  }
  
  return dp[m][n];
}

// 检查链接有效性
async function checkLinkValidity(bookmark) {
  try {
    const url = new URL(bookmark.url);
    const hostname = url.hostname.toLowerCase();

    // 一些已知的有效但难以检测的域名（需要登入或有CORS限制）
    const knownValidDomains = [
      'localhost', '127.0.0.1',
      'chrome.google.com', 'chrome://extensions',
      'webmail.', 'mail.',
      'internal.', 'intranet.',
      'dashboard.',
      'kaggle.com',  // Kaggle 需要登入且有CORS限制
      'github.com',  // GitHub 有時會阻擋爬蟲
      'linkedin.com', // LinkedIn 需要登入
      'twitter.com', 'x.com', // Twitter/X 需要登入
      'facebook.com', // Facebook 需要登入
      'instagram.com' // Instagram 需要登入
    ];

    // 從存儲中獲取學習的有效域名列表
    const learnedData = await chrome.storage.local.get(['learnedValidDomains']);
    const learnedDomains = learnedData.learnedValidDomains || [];

    // 合併已知域名和學習域名
    const allKnownDomains = [...knownValidDomains, ...learnedDomains];

    // 检查是否为特殊域名或學習的有效域名
    const isSpecialDomain = allKnownDomains.some(domain =>
      hostname.includes(domain) || url.protocol === 'file:' ||
      url.protocol === 'chrome:' || url.protocol === 'edge:' ||
      url.protocol === 'about:' || url.protocol === 'chrome-extension:'
    );

    if (isSpecialDomain) {
      // 判斷是否為學習的域名
      const isLearned = learnedDomains.some(domain => hostname.includes(domain));
      return {
        bookmark,
        valid: true, // 假定這些特殊域名是有效的
        status: isLearned ? 'Skipped (Learned Domain)' : 'Skipped (Known Domain)'
      };
    }

    // 一些网站可能会拒绝HEAD请求，但接受GET请求
    // 因此我们先尝试HEAD请求，如果失败，再尝试GET请求
    try {
      // 首先尝试HEAD请求，使用更真實的 User-Agent
      const headResponse = await fetch(bookmark.url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });

      if (headResponse.ok) {
        return {
          bookmark,
          valid: true,
          status: headResponse.status
        };
      }

      // 改善的狀態碼判斷邏輯
      const status = headResponse.status;

      // 403 Forbidden - 通常是反爬蟲機制，但網站可能是有效的
      // 嘗試 GET 請求，如果也失敗，則標記為「可能有效但無法驗證」
      if (status === 403) {
        try {
          const getResponse = await fetch(bookmark.url, {
            method: 'GET',
            redirect: 'follow',
            signal: AbortSignal.timeout(10000),
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
              'Referer': url.origin
            }
          });

          if (getResponse.ok) {
            return {
              bookmark,
              valid: true,
              status: getResponse.status
            };
          }
        } catch (getError) {
          // GET 也失敗，但 403 通常表示網站存在，只是拒絕訪問
          console.log('403 錯誤，網站可能有反爬蟲機制:', bookmark.url);
        }

        // 403 標記為「可能有效」，不判定為無效
        return {
          bookmark,
          valid: true, // 改為 true，因為 403 通常表示網站存在
          status: '403 (Anti-bot)'
        };
      }

      // 401 Unauthorized - 需要認證，但網站是有效的
      if (status === 401) {
        return {
          bookmark,
          valid: true, // 標記為有效，只是需要登入
          status: '401 (Auth Required)'
        };
      }

      // 429 Too Many Requests - 速率限制，網站是有效的
      if (status === 429) {
        return {
          bookmark,
          valid: true, // 標記為有效，只是被限速
          status: '429 (Rate Limited)'
        };
      }

      // 405 Method Not Allowed - 嘗試 GET 請求
      if (status === 405) {
        const getResponse = await fetch(bookmark.url, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(10000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          }
        });

        return {
          bookmark,
          valid: getResponse.ok,
          status: getResponse.status
        };
      }

      // 500/502/503 - 伺服器錯誤，可能是暫時的，標記為「可能有效」
      if (status >= 500 && status < 600) {
        return {
          bookmark,
          valid: true, // 標記為有效，可能只是暫時錯誤
          status: `${status} (Server Error - Temporary)`
        };
      }

      // 404 和其他客戶端錯誤 - 這些通常才是真正無效的
      return {
        bookmark,
        valid: headResponse.ok,
        status: headResponse.status
      };
    } catch (headError) {
      // HEAD请求失败，尝试GET请求
      console.log('HEAD請求失敗，嘗試GET請求:', bookmark.url, headError.message);

      try {
        const getResponse = await fetch(bookmark.url, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(12000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
          }
        });

        return {
          bookmark,
          valid: getResponse.ok,
          status: getResponse.status
        };
      } catch (getError) {
        // 兩個請求都失敗，拋出錯誤給外層處理
        throw getError;
      }
    }
  } catch (error) {
    // 处理网络错误、超时等
    let status = 'Error';

    if (error.name === 'TimeoutError') {
      status = 'Timeout';
    } else if (error.name === 'TypeError') {
      // TypeError 通常表示 CORS 錯誤或網路問題
      // 對於 CORS 錯誤，網站可能是有效的，只是擴展無法訪問
      status = 'CORS/Network Error';
      console.log('CORS 或網路錯誤:', bookmark.url, error.message);
    }

    return {
      bookmark,
      valid: false,
      status: status
    };
  }
}

// 从忽略列表中移除域名
async function removeIgnoredDomain(domain) {
  try {
    const data = await chrome.storage.local.get(['ignoredDomains']);
    let ignoredDomains = data.ignoredDomains || [];

    // 从列表中移除域名
    ignoredDomains = ignoredDomains.filter(d => d !== domain);

    await chrome.storage.local.set({ ignoredDomains });
    return { success: true };
  } catch (error) {
    console.error('从忽略列表移除域名出错:', error);
    return { success: false, message: '从忽略列表移除域名出错: ' + error.message };
  }
}

// 更新已知有效域名列表（基於學習的誤判數據）
async function updateKnownValidDomains(newDomains) {
  try {
    // 從存儲中獲取現有的學習域名列表
    const data = await chrome.storage.local.get(['learnedValidDomains']);
    let learnedDomains = data.learnedValidDomains || [];

    // 添加新的域名（避免重複）
    newDomains.forEach(domain => {
      if (!learnedDomains.includes(domain)) {
        learnedDomains.push(domain);
      }
    });

    // 保存更新後的列表
    await chrome.storage.local.set({ learnedValidDomains: learnedDomains });

    console.log('已更新學習的有效域名列表，當前共有', learnedDomains.length, '個域名');

    return { success: true, domains: learnedDomains };
  } catch (error) {
    console.error('更新已知有效域名列表出錯:', error);
    return { success: false, message: '更新已知有效域名列表出錯: ' + error.message };
  }
}

// 移动书签到分类文件夹
async function moveBookmarkToCategory(bookmarkId, category) {
  try {
    // 获取"书签栏"文件夹ID
    const bookmarksBarId = '1';
    
    // 如果分类包含 / 则需要创建多级目录
    const categoryParts = category.split('/');
    let currentParentId = bookmarksBarId;
    
    // 逐级创建目录结构
    for (const folderName of categoryParts) {
      if (!folderName.trim()) continue; // 跳过空文件夹名
      
      // 获取当前级别的子文件夹
      const childFolders = await chrome.bookmarks.getChildren(currentParentId);
      
      // 检查此级别是否已存在同名文件夹
      let targetFolder = childFolders.find(folder => 
        !folder.url && folder.title.toLowerCase() === folderName.toLowerCase()
      );
      
      // 如果没有找到现有文件夹，创建一个新文件夹
      if (!targetFolder) {
        targetFolder = await chrome.bookmarks.create({
          parentId: currentParentId,
          title: folderName.trim()
        });
      }
      
      // 更新父ID为当前级别的文件夹ID
      currentParentId = targetFolder.id;
    }
    
    // 移动书签到最终的分类文件夹
    await chrome.bookmarks.move(bookmarkId, {
      parentId: currentParentId
    });
    
    return { success: true };
  } catch (error) {
    console.error('移动书签到分类文件夹出错:', error);
    throw error;
  }
}

// 扫描空文件夹
async function scanEmptyFolders() {
  try {
    isProcessing = true;
    
    // 获取所有书签
    const tree = await chrome.bookmarks.getTree();
    const emptyFolders = [];
    
    // 递归检查文件夹
    async function checkFolder(node, path = []) {
      // 跳过根节点
      if (node.id === '0') {
        for (const child of node.children || []) {
          await checkFolder(child, path);
        }
        return;
      }
      
      // 如果是文件夹
      if (!node.url) {
        const children = await chrome.bookmarks.getChildren(node.id);
        
        // 如果文件夹为空
        if (children.length === 0) {
          emptyFolders.push({
            id: node.id,
            title: node.title,
            path: [...path]
          });
        } else {
          // 递归检查子文件夹
          const newPath = [...path, node.title];
          for (const child of children) {
            await checkFolder(child, newPath);
          }
        }
      }
    }
    
    // 开始检查
    await checkFolder(tree[0]);
    
    // 保存空文件夹数据
    await chrome.storage.local.set({ emptyFolders });
    
    isProcessing = false;
    return { 
      success: true, 
      message: `找到 ${emptyFolders.length} 个空文件夹` 
    };
  } catch (error) {
    isProcessing = false;
    console.error('扫描空文件夹出错:', error);
    throw error;
  }
}

// 删除空文件夹
async function removeEmptyFolders() {
  try {
    console.log('开始执行 removeEmptyFolders 函数');
    const result = await findEmptyFolders();
    console.log('findEmptyFolders 返回结果:', result);
    
    if (!result.success) {
      console.error('findEmptyFolders 执行失败:', result.message);
      return {
        success: false,
        message: result.message
      };
    }
    
    const emptyFolders = result.emptyFolders;
    console.log('获取到的空文件夹数组:', emptyFolders);
    
    // 检查emptyFolders是否是数组且不为空
    if (!Array.isArray(emptyFolders)) {
      console.error('emptyFolders 不是数组:', emptyFolders);
      return {
        success: false,
        message: 'emptyFolders 不是可迭代的数组'
      };
    }
    
    if (emptyFolders.length === 0) {
      console.log('没有找到空文件夹');
      return {
        success: true,
        message: '没有找到需要删除的空文件夹'
      };
    }
    
    let deletedCount = 0;
    
    for (const folder of emptyFolders) {
      console.log('正在删除文件夹:', folder);
      await removeEmptyFolderAndParents(folder.id);
      deletedCount++;
    }
    
    console.log('成功删除空文件夹数量:', deletedCount);
    return {
      success: true,
      message: `已删除 ${deletedCount} 个空文件夹`
    };
  } catch (error) {
    console.error('删除空文件夹时出错:', error);
    return {
      success: false,
      message: '删除空文件夹时出错: ' + (error.message || '未知错误')
    };
  }
}

// 递归删除空文件夹及其空的父文件夹
async function removeEmptyFolderAndParents(folderId) {
  try {
    // 获取当前文件夹信息
    const folder = await new Promise((resolve) => {
      chrome.bookmarks.get(folderId.toString(), (result) => {
        resolve(result[0]);
      });
    });
    
    // 删除当前文件夹
    await new Promise((resolve) => {
      chrome.bookmarks.removeTree(folderId.toString(), () => {
        resolve();
      });
    });
    
    // 如果有父文件夹，检查父文件夹是否为空
    if (folder.parentId) {
      const parentChildren = await new Promise((resolve) => {
        chrome.bookmarks.getChildren(folder.parentId.toString(), (children) => {
          resolve(children || []);
        });
      });
      
      // 如果父文件夹为空，递归删除父文件夹
      if (parentChildren.length === 0) {
        await removeEmptyFolderAndParents(folder.parentId);
      }
    }
  } catch (error) {
    console.error('删除文件夹时出错:', error);
    throw error;
  }
}

// 查找空文件夹
async function findEmptyFolders() {
  try {
    const emptyFolders = [];
    
    // 获取书签栏和其他书签文件夹
    const roots = await chrome.bookmarks.getTree();
    
    async function checkFolder(node) {
      // 如果是文件夹（没有url属性）
      if (!node.url) {
        const children = await chrome.bookmarks.getChildren(node.id);
        
        // 如果没有子项，且不是根文件夹
        if (children.length === 0 && node.id !== '0' && node.id !== '1' && node.id !== '2') {
          emptyFolders.push({
            id: node.id,
            title: node.title,
            parentId: node.parentId
          });
        } else {
          // 递归检查子文件夹
          for (const child of children) {
            await checkFolder(child);
          }
        }
      }
    }
    
    // 检查所有根节点
    for (const root of roots) {
      await checkFolder(root);
    }
    
    return { 
      success: true, 
      emptyFolders: emptyFolders,
      message: `找到 ${emptyFolders.length} 个空文件夹`
    };
  } catch (error) {
    console.error('查找空文件夹时出错:', error);
    return { 
      success: false, 
      emptyFolders: [],
      message: '查找空文件夹时出错: ' + error.message 
    };
  }
}

// 检测重复目录
async function findDuplicateFolders() {
  try {
    const tree = await chrome.bookmarks.getTree();
    const folderMap = new Map(); // 存储文件夹名称和对应的文件夹列表
    
    // 递归遍历书签树
    async function traverseTree(node, path = []) {
      if (!node.url) { // 如果是文件夹
        const folderName = node.title.toLowerCase().trim();
        if (node.id !== '0' && node.id !== '1' && node.id !== '2') { // 排除根目录
          const folderInfo = {
            id: node.id,
            title: node.title,
            path: [...path],
            parentId: node.parentId
          };
          
          if (folderMap.has(folderName)) {
            folderMap.get(folderName).push(folderInfo);
          } else {
            folderMap.set(folderName, [folderInfo]);
          }
        }
        
        // 继续遍历子节点
        if (node.children) {
          const newPath = [...path, node.title];
          for (const child of node.children) {
            await traverseTree(child, newPath);
          }
        }
      }
    }
    
    // 开始遍历
    await traverseTree(tree[0]);
    
    // 过滤出重复的文件夹
    const duplicateFolders = [];
    folderMap.forEach((folders, name) => {
      if (folders.length > 1) {
        // 检查是否为相似文件夹名称
        const similarGroups = new Map();
        folders.forEach(folder => {
          let foundGroup = false;
          for (const [groupName, group] of similarGroups) {
            if (isSimilarFolderName(folder.title, groupName)) {
              group.push(folder);
              foundGroup = true;
              break;
            }
          }
          if (!foundGroup) {
            similarGroups.set(folder.title, [folder]);
          }
        });
        
        // 添加所有具有多个文件夹的组
        similarGroups.forEach((group) => {
          if (group.length > 1) {
            duplicateFolders.push({
              name: group[0].title,
              folders: group
            });
          }
        });
      }
    });
    
    return {
      success: true,
      duplicateFolders,
      message: `找到 ${duplicateFolders.length} 组重复文件夹`
    };
  } catch (error) {
    console.error('查找重复文件夹时出错:', error);
    return {
      success: false,
      duplicateFolders: [],
      message: '查找重复文件夹时出错: ' + error.message
    };
  }
}

// 合并文件夹
async function mergeFolders(sourceId, targetId) {
  try {
    // 获取源文件夹中的所有书签
    const sourceItems = await chrome.bookmarks.getChildren(sourceId);
    
    // 移动所有项目到目标文件夹
    for (const item of sourceItems) {
      await chrome.bookmarks.move(item.id, { parentId: targetId });
    }
    
    // 删除空的源文件夹
    await chrome.bookmarks.removeTree(sourceId);
    
    return {
      success: true,
      message: '文件夹合并成功'
    };
  } catch (error) {
    console.error('合并文件夹时出错:', error);
    return {
      success: false,
      message: '合并文件夹时出错: ' + error.message
    };
  }
}

// 自动合并所有重复目录
async function autoMergeDuplicateFolders() {
  try {
    // 先获取所有重复目录
    const duplicateFoldersResult = await findDuplicateFolders();
    
    if (!duplicateFoldersResult.success) {
      return {
        success: false,
        message: '查找重复目录失败: ' + duplicateFoldersResult.message
      };
    }
    
    const duplicateFolders = duplicateFoldersResult.duplicateFolders;
    let mergedCount = 0;
    let errorCount = 0;
    
    // 遍历每个重复目录组
    for (const group of duplicateFolders) {
      if (group.folders.length < 2) continue;
      
      // 选择第一个文件夹作为目标（通常是最上层或最早创建的）
      const targetFolder = group.folders[0];
      
      // 合并其他文件夹到目标文件夹
      for (let i = 1; i < group.folders.length; i++) {
        const sourceFolder = group.folders[i];
        try {
          const mergeResult = await mergeFolders(sourceFolder.id, targetFolder.id);
          if (mergeResult.success) {
            mergedCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('合并文件夹出错:', error);
          errorCount++;
        }
      }
    }
    
    return {
      success: true,
      message: `自动合并完成：成功合并 ${mergedCount} 个文件夹，失败 ${errorCount} 个`
    };
  } catch (error) {
    console.error('自动合并重复目录时出错:', error);
    return {
      success: false,
      message: '自动合并重复目录时出错: ' + error.message
    };
  }
}

// 创建分类Prompt
function createClassificationPrompt(bookmarks) {
  let prompt = `请为以下书签建议合适的分类路径。要求：
1. 使用2-3层的目录结构，用 '/' 分隔
2. 使用简洁、通用的中文类别
3. 尽量复用相似的类别，避免过度细分
4. 一级目录示例：'编程', '学习', '工作', '生活', '娱乐', '工具' 等
5. 二级目录要更具体，如 '编程/Python', '工作/文档', '生活/美食' 等
6. 三级目录可选，用于更细致的分类

格式要求：
书签ID: 分类路径
例如：
abc123: 编程/Python/教程
def456: 生活/美食/菜谱

以下是需要分类的书签：\n\n`;

  bookmarks.forEach(bookmark => {
    prompt += `书签ID: ${bookmark.id}\n`;
    prompt += `标题: ${bookmark.title}\n`;
    prompt += `URL: ${bookmark.url}\n\n`;
  });
  
  return prompt;
}

// 调用AI API
async function callAIApi(prompt, settings) {
  try {
    console.log('开始调用AI API:', settings.aiApiType);
    const { aiApiType, apiKey, customApiEndpoint } = settings;
    
    // 验证必要的参数
    if (!apiKey) {
      console.error('API Key未设置');
      throw new Error('API Key未设置');
    }
    
    if (aiApiType === 'custom' && !customApiEndpoint) {
      console.error('自定义API端点未设置');
      throw new Error('自定义API端点未设置');
    }
    
    // 根据不同的API类型调用相应的函数
    let result;
    console.log(`使用${aiApiType}模型发送请求...`);
    
    try {
      if (aiApiType === 'gemini') {
        result = await callGeminiApi(prompt, apiKey);
      } else if (aiApiType === 'openai') {
        result = await callOpenAIApi(prompt, apiKey);
      } else if (aiApiType === 'deepseek') {
        result = await callDeepSeekApi(prompt, apiKey);
      } else if (aiApiType === 'custom') {
        result = await callCustomApi(prompt, apiKey, customApiEndpoint);
      } else {
        throw new Error('不支持的API类型: ' + aiApiType);
      }
    } catch (apiCallError) {
      console.error(`调用${aiApiType} API时出错:`, apiCallError);
      console.error('错误详情:', apiCallError.stack || '无堆栈信息');
      throw new Error(`调用${aiApiType} API失败: ${apiCallError.message}`);
    }
    
    console.log('AI API调用成功，返回结果长度:', result.length);
    return result;
  } catch (error) {
    console.error('调用AI API出错:', error);
    console.error('错误详情:', error.stack || '无堆栈信息');
    throw error;
  }
}

// 调用Gemini API
async function callGeminiApi(prompt, apiKey) {
  try {
    console.log('调用Gemini API...');
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const body = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });
    
    console.log('Gemini请求地址:', endpoint.split('?')[0] + '?key=<API_KEY>');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API响应错误:', response.status, errorText);
      throw new Error(`Gemini API错误: ${response.status} ${errorText}`);
    }
    
    console.log('Gemini API响应成功, 状态码:', response.status);
    const data = await response.json();
    console.log('Gemini API响应数据结构:', Object.keys(data));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Gemini API响应格式错误:', data);
      throw new Error('无法解析Gemini API响应');
    }
    
    const result = data.candidates[0].content.parts[0].text;
    console.log('Gemini API响应内容前100字符:', result.substring(0, 100) + '...');
    return result;
  } catch (error) {
    console.error('调用Gemini API出错:', error);
    console.error('错误详情:', error.stack || '无堆栈信息');
    throw error;
  }
}

// 调用OpenAI API
async function callOpenAIApi(prompt, apiKey) {
  try {
    console.log('调用OpenAI API...');
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    
    const body = JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user', 
          content: prompt
        }
      ],
      temperature: 0.3
    });
    
    console.log('OpenAI请求地址:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: body
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API响应错误:', response.status, errorText);
      throw new Error(`OpenAI API错误: ${response.status} ${errorText}`);
    }
    
    console.log('OpenAI API响应成功, 状态码:', response.status);
    const data = await response.json();
    console.log('OpenAI API响应数据结构:', Object.keys(data));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('OpenAI API响应格式错误:', data);
      throw new Error('无法解析OpenAI API响应');
    }
    
    const result = data.choices[0].message.content;
    console.log('OpenAI API响应内容前100字符:', result.substring(0, 100) + '...');
    return result;
  } catch (error) {
    console.error('调用OpenAI API出错:', error);
    throw error;
  }
}

// 调用DeepSeek API
async function callDeepSeekApi(prompt, apiKey) {
  try {
    console.log('调用DeepSeek API...');
    const endpoint = 'https://api.deepseek.com/chat/completions';
    
    const body = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个书签分类助手。请根据书签的标题和URL，建议合适的分类名称。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false
    });
    
    console.log('DeepSeek请求地址:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: body
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API响应错误:', response.status, errorText);
      throw new Error(`DeepSeek API错误: ${response.status} ${errorText}`);
    }
    
    console.log('DeepSeek API响应成功, 状态码:', response.status);
    const data = await response.json();
    console.log('DeepSeek API响应数据结构:', Object.keys(data));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('DeepSeek API响应格式错误:', data);
      throw new Error('无法解析DeepSeek API响应');
    }
    
    const result = data.choices[0].message.content;
    console.log('DeepSeek API响应内容前100字符:', result.substring(0, 100) + '...');
    return result;
  } catch (error) {
    console.error('调用DeepSeek API出错:', error);
    throw error;
  }
}

// 查找舊書籤（創建日期和最後訪問日期都超過指定月數）
async function findOldBookmarks(monthsThreshold = 6) {
  try {
    isProcessing = true;

    // 計算截止時間（monthsThreshold 個月前）
    const thresholdDate = new Date();
    thresholdDate.setMonth(thresholdDate.getMonth() - monthsThreshold);
    const thresholdTimestamp = thresholdDate.getTime();

    console.log(`查找 ${monthsThreshold} 個月前的書籤，截止日期:`, thresholdDate);

    // 獲取所有書籤
    const bookmarksResult = await getAllBookmarks();
    if (!bookmarksResult.success) {
      isProcessing = false;
      return { success: false, message: bookmarksResult.message };
    }

    const allBookmarks = bookmarksResult.bookmarks;
    const oldBookmarks = [];
    let processedCount = 0;

    // 批量處理書籤
    for (const bookmark of allBookmarks) {
      processedCount++;

      // 發送進度更新
      if (processedCount % 10 === 0) {
        chrome.runtime.sendMessage({
          action: 'scanProgress',
          current: processedCount,
          total: allBookmarks.length,
          percentage: Math.round((processedCount / allBookmarks.length) * 100)
        });
      }

      // 獲取書籤節點以取得創建時間
      const bookmarkNode = await chrome.bookmarks.get(bookmark.id);
      if (!bookmarkNode || bookmarkNode.length === 0) continue;

      const node = bookmarkNode[0];
      const dateAdded = node.dateAdded || 0;

      // 檢查創建日期是否早於閾值
      if (dateAdded >= thresholdTimestamp) {
        continue; // 創建日期太新，跳過
      }

      // 查詢歷史記錄中的最後訪問時間
      let lastVisitTime = null;
      try {
        const visits = await chrome.history.getVisits({ url: bookmark.url });
        if (visits && visits.length > 0) {
          // 找出最近一次訪問
          const sortedVisits = visits.sort((a, b) => b.visitTime - a.visitTime);
          lastVisitTime = sortedVisits[0].visitTime;
        }
      } catch (historyError) {
        console.log('無法查詢歷史記錄:', bookmark.url, historyError);
        lastVisitTime = null;
      }

      // 判斷是否為舊書籤
      const isOld = !lastVisitTime || lastVisitTime < thresholdTimestamp;

      if (isOld) {
        oldBookmarks.push({
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          path: bookmark.path,
          dateAdded: dateAdded,
          lastVisitTime: lastVisitTime,
          dateAddedFormatted: new Date(dateAdded).toLocaleDateString(),
          lastVisitFormatted: lastVisitTime ? new Date(lastVisitTime).toLocaleDateString() : '從未訪問'
        });
      }
    }

    // 保存結果
    await chrome.storage.local.set({ oldBookmarks });

    isProcessing = false;
    return {
      success: true,
      oldBookmarks: oldBookmarks,
      message: `找到 ${oldBookmarks.length} 個超過 ${monthsThreshold} 個月未使用的書籤`
    };
  } catch (error) {
    isProcessing = false;
    console.error('查找舊書籤出錯:', error);
    return { success: false, message: '查找舊書籤出錯: ' + error.message };
  }
}

// 刪除指定的舊書籤
async function removeOldBookmarks(bookmarkIds) {
  try {
    if (!bookmarkIds || bookmarkIds.length === 0) {
      return { success: false, message: '沒有要刪除的書籤' };
    }

    let successCount = 0;
    let errorCount = 0;
    const parentFolders = new Set(); // 記錄書籤的父資料夾

    for (const bookmarkId of bookmarkIds) {
      try {
        // 在刪除前獲取父資料夾ID
        const bookmarkNode = await chrome.bookmarks.get(bookmarkId);
        if (bookmarkNode && bookmarkNode.length > 0) {
          const parentId = bookmarkNode[0].parentId;
          if (parentId) {
            parentFolders.add(parentId);
          }
        }

        await chrome.bookmarks.remove(bookmarkId);
        successCount++;
      } catch (error) {
        console.error(`刪除書籤 ${bookmarkId} 失敗:`, error);
        errorCount++;
      }
    }

    // 刪除完成後，清理空資料夾
    console.log('開始清理空資料夾...');
    let emptyFoldersRemoved = 0;

    try {
      // 使用 removeEmptyFolders 函數來清理空資料夾
      const result = await removeEmptyFolders();
      if (result.success) {
        emptyFoldersRemoved = result.message.match(/已删除 (\d+) 个空文件夹/)?.[1] || 0;
        console.log(`已清理 ${emptyFoldersRemoved} 個空資料夾`);
      }
    } catch (cleanupError) {
      console.error('清理空資料夾時出錯:', cleanupError);
    }

    let message = `成功刪除 ${successCount} 個書籤`;
    if (errorCount > 0) {
      message += `，${errorCount} 個失敗`;
    }
    if (emptyFoldersRemoved > 0) {
      message += `，並清理了 ${emptyFoldersRemoved} 個空資料夾`;
    }

    return {
      success: true,
      successCount: successCount,
      errorCount: errorCount,
      emptyFoldersRemoved: emptyFoldersRemoved,
      message: message
    };
  } catch (error) {
    console.error('刪除舊書籤出錯:', error);
    return { success: false, message: '刪除舊書籤出錯: ' + error.message };
  }
}

// 獲取最新添加的書籤
async function getRecentBookmarks(limit = 10) {
  try {
    // 獲取所有書籤
    const bookmarksResult = await getAllBookmarks();
    if (!bookmarksResult.success) {
      return { success: false, message: bookmarksResult.message };
    }

    const allBookmarks = bookmarksResult.bookmarks;

    // 為每個書籤獲取詳細資訊（包含 dateAdded）
    const bookmarksWithDetails = [];

    for (const bookmark of allBookmarks) {
      try {
        const bookmarkNode = await chrome.bookmarks.get(bookmark.id);
        if (bookmarkNode && bookmarkNode.length > 0) {
          const node = bookmarkNode[0];

          // 獲取頁面摘要（使用 URL 或標題）
          let summary = bookmark.title || '';
          if (summary.length > 50) {
            summary = summary.substring(0, 50) + '...';
          }

          bookmarksWithDetails.push({
            id: bookmark.id,
            title: bookmark.title,
            url: bookmark.url,
            dateAdded: node.dateAdded || 0,
            dateAddedFormatted: new Date(node.dateAdded).toLocaleString('zh-TW'),
            summary: summary,
            path: bookmark.path
          });
        }
      } catch (error) {
        console.error('獲取書籤詳情失敗:', bookmark.id, error);
      }
    }

    // 按創建時間排序（由新到舊）
    bookmarksWithDetails.sort((a, b) => b.dateAdded - a.dateAdded);

    // 取前 N 筆
    const recentBookmarks = bookmarksWithDetails.slice(0, limit);

    return {
      success: true,
      bookmarks: recentBookmarks,
      total: recentBookmarks.length
    };
  } catch (error) {
    console.error('獲取最新書籤出錯:', error);
    return { success: false, message: '獲取最新書籤出錯: ' + error.message };
  }
}

// 遞歸刪除空資料夾（從指定資料夾開始檢查）
async function removeEmptyFoldersRecursive(folderIds) {
  let removedCount = 0;
  const processedFolders = new Set();

  async function checkAndRemoveFolder(folderId) {
    // 避免重複處理
    if (processedFolders.has(folderId)) {
      return;
    }
    processedFolders.add(folderId);

    // 跳過根資料夾
    if (folderId === '0' || folderId === '1' || folderId === '2') {
      return;
    }

    try {
      // 獲取資料夾資訊
      const folderNode = await chrome.bookmarks.get(folderId);
      if (!folderNode || folderNode.length === 0) {
        return;
      }

      const folder = folderNode[0];

      // 如果不是資料夾，跳過
      if (folder.url) {
        return;
      }

      // 檢查是否為空資料夾
      const children = await chrome.bookmarks.getChildren(folderId);

      if (children.length === 0) {
        console.log(`刪除空資料夾: ${folder.title} (${folderId})`);

        // 記錄父資料夾ID，稍後檢查
        const parentId = folder.parentId;

        // 刪除空資料夾
        await chrome.bookmarks.removeTree(folderId);
        removedCount++;

        // 遞歸檢查父資料夾是否也變成空的
        if (parentId) {
          await checkAndRemoveFolder(parentId);
        }
      }
    } catch (error) {
      console.error(`檢查資料夾 ${folderId} 時出錯:`, error);
    }
  }

  // 檢查所有提供的資料夾
  for (const folderId of folderIds) {
    await checkAndRemoveFolder(folderId);
  }

  return { removedCount };
}

// 调用自定义API
async function callCustomApi(prompt, apiKey, endpoint) {
  try {
    console.log('调用自定义API...');
    console.log('自定义API端点:', endpoint);
    
    // 使用通用的请求格式，用户需要确保自定义端点能处理此格式
    const body = JSON.stringify({
      messages: [
        {
          role: 'user', 
          content: prompt
        }
      ]
    });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: body
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('自定义API响应错误:', response.status, errorText);
      throw new Error(`自定义API错误: ${response.status} ${errorText}`);
    }
    
    console.log('自定义API响应成功, 状态码:', response.status);
    
    // 尝试解析响应
    // 由于自定义API的响应格式可能各不相同，这里尝试几种常见格式
    try {
      const data = await response.json();
      console.log('自定义API响应数据结构:', Object.keys(data));
      
      // 尝试不同的响应格式
      if (data.choices && data.choices[0] && data.choices[0].message) {
        // OpenAI-like格式
        const result = data.choices[0].message.content;
        console.log('自定义API响应内容前100字符 (OpenAI格式):', result.substring(0, 100) + '...');
        return result;
      } else if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        // Gemini-like格式
        const result = data.candidates[0].content.parts[0].text;
        console.log('自定义API响应内容前100字符 (Gemini格式):', result.substring(0, 100) + '...');
        return result;
      } else if (data.response) {
        // 简单的response字段
        const result = data.response;
        console.log('自定义API响应内容前100字符 (response字段):', result.substring(0, 100) + '...');
        return result;
      } else if (data.content || data.text || data.result) {
        // 其他常见字段
        const result = data.content || data.text || data.result;
        console.log('自定义API响应内容前100字符 (其他常见字段):', result.substring(0, 100) + '...');
        return result;
      } else if (typeof data === 'string') {
        // 纯文本响应
        console.log('自定义API响应内容前100字符 (字符串):', data.substring(0, 100) + '...');
        return data;
      } else {
        // 如果没有匹配到任何已知格式，返回整个响应对象的字符串表示
        const result = JSON.stringify(data);
        console.log('自定义API响应内容前100字符 (未知格式):', result.substring(0, 100) + '...');
        return result;
      }
    } catch (e) {
      // 如果不是JSON格式，尝试作为纯文本处理
      console.log('自定义API响应不是JSON格式，尝试作为文本处理');
      try {
        const textResponse = await response.text();
        console.log('自定义API响应内容前100字符 (文本):', textResponse.substring(0, 100) + '...');
        return textResponse;
      } catch (textError) {
        console.error('无法解析自定义API响应为文本:', textError);
        throw new Error('无法解析自定义API响应');
      }
    }
  } catch (error) {
    console.error('调用自定义API出错:', error);
    throw error;
  }
} 