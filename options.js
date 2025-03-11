function save_options() {
  const value = document.getElementById('history_size').value;
  chrome.storage.sync.set({ history_size: Number(value) }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Options Saved.';
    setTimeout(() => status.textContent = '', 750);
  });
}

function restore_options() {
  chrome.storage.sync.get('history_size', (data) => {
    document.getElementById('history_size').value = data.history_size || 23;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);