const configs = {
  board: {
    input: document.getElementById("board-input"),
    btn: document.getElementById("add-board-btn"),
    list: document.getElementById("board-list"),
    storageKey: "blockedBoards",
  },
  keyword: {
    input: document.getElementById("keyword-input"),
    btn: document.getElementById("add-keyword-btn"),
    list: document.getElementById("keyword-list"),
    storageKey: "blockedKeywords",
  },
};

// 1. 팝업이 열릴 때 두 목록을 모두 불러오기
chrome.storage.sync.get({ blockedBoards: [], blockedKeywords: [] }, (data) => {
  renderList(data.blockedBoards, "board");
  renderList(data.blockedKeywords, "keyword");
});

// 2. 추가 버튼 클릭 이벤트 연결 (게시판 / 키워드 공통)
function setupEvents(type) {
  const { input, btn, storageKey } = configs[type];

  btn.onclick = () => {
    const word = input.value.trim();
    if (!word) return;

    chrome.storage.sync.get({ [storageKey]: [] }, (data) => {
      // 기존 목록에 중복이 없는 경우에만 추가
      if (data[storageKey].includes(word)) {
        alert("이미 등록된 항목입니다.");
        return;
      }

      const newList = [...data[storageKey], word];
      chrome.storage.sync.set({ [storageKey]: newList }, () => {
        renderList(newList, type);
        input.value = "";
      });
    });
  };

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") btn.click();
  });
}

setupEvents("board");
setupEvents("keyword");

// 3. 화면에 목록 그리기 (삭제 기능 포함)
function renderList(items, type) {
  const { list } = configs[type];
  list.innerHTML = "";

  items.forEach((word, index) => {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `
      <span>${word}</span>
      <span class="del-btn" style="cursor:pointer">❌</span>
    `;
    li.querySelector(".del-btn").onclick = () => {
      removeEntry(index, type);
    };
    list.appendChild(li);
  });
}

// 4. 삭제 기능
function removeEntry(index, type) {
  const { storageKey } = configs[type];

  chrome.storage.sync.get({ [storageKey]: [] }, (data) => {
    const newList = data[storageKey].filter((_, i) => i !== index);
    chrome.storage.sync.set({ [storageKey]: newList }, () => {
      renderList(newList, type);
    });
  });
}
