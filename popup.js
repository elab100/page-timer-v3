import { FormatDuration } from './common.js';

const tabId = Number(window.location.hash.match(/tabId=(\d+)/)?.[1]);

if (tabId) {
  chrome.storage.local.get('history', ({ history }) => {
    const hist = history?.[tabId] || [];
    const table = document.createElement('table');
    
    hist.forEach((entry, i) => {
      const row = table.insertRow();
      const [timeStr, url] = entry;
      const time = new Date(timeStr); // 反序列化日期
      
      // 日期列
      const dateCell = row.insertCell();
      if (i === hist.length - 1 || new Date(hist[i+1][0]).toDateString() !== time.toDateString()) {
        dateCell.textContent = time.toLocaleDateString();
      }
      
      // 时间列
      row.insertCell().textContent = time.toLocaleTimeString();
      
      // 持续时间列
      const endTime = i === 0 ? new Date() : new Date(hist[i-1][0]);
      row.insertCell().textContent = FormatDuration(endTime - time);
      
      // 链接列
      const link = document.createElement('a');
      link.href = url;
      link.textContent = url;
      link.target = '_blank';
      row.insertCell().appendChild(link);
    });
    
    document.body.appendChild(table);
  });
}