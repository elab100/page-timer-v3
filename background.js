import { FormatDuration } from './common.js';

let History = new Map();

// 初始化时加载存储的数据
chrome.runtime.onInstalled.addListener(async () => {
  const { history } = await chrome.storage.local.get('history');
  if (history) {
    History = new Map(Object.entries(history).map(([key, value]) => [Number(key), value]));
  }
});

// 保存数据到存储
async function saveHistory() {
  await chrome.storage.local.set({ history: Object.fromEntries(History) });
}

async function Update(t, tabId, url) {
  if (!url) return;

  let tabHistory = History.get(tabId) || [];
  if (tabHistory.length > 0 && url === tabHistory[0][1]) return;

  tabHistory.unshift([t.toISOString(), url]); // 使用ISO字符串序列化日期
  const { history_size } = await chrome.storage.local.get('history_size');
  const limit = history_size || 23;

  while (tabHistory.length > limit) tabHistory.pop();
  History.set(tabId, tabHistory);
  await saveHistory();

  chrome.action.setBadgeText({ tabId, text: '0:00' });
  chrome.action.setPopup({ tabId, popup: `popup.html#tabId=${tabId}` });
}

// 事件监听器
//const handleUpdate = (tabId, changeInfo) => Update(new Date(), tabId, changeInfo.url);
const handleUpdate = (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    Update(new Date(), tabId, tab.url);
  }
};

const handleRemove = (tabId) => {
  History.delete(tabId);
  saveHistory();
};
const handleReplace = (addedTabId, removedTabId) => {
  History.delete(removedTabId);
  chrome.tabs.get(addedTabId).then(tab => Update(new Date(), addedTabId, tab.url));
};

// 定时更新徽章
function UpdateBadges() {
  const now = new Date();
  History.forEach((entries, tabId) => {
    const firstEntryTime = new Date(entries[0][0]); // 反序列化日期
    const duration = FormatDuration(now - firstEntryTime);
    chrome.action.setBadgeText({ tabId, text: duration });
  });
}

// 注册事件和定时器
chrome.tabs.onUpdated.addListener(handleUpdate);
chrome.tabs.onRemoved.addListener(handleRemove);
chrome.tabs.onReplaced.addListener(handleReplace);
setInterval(UpdateBadges, 1000);