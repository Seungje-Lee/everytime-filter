{
  function applyFilter() {
    chrome.storage.sync.get(
      { blockedBoards: [], blockedKeywords: [] },
      (data) => {
        const { blockedBoards, blockedKeywords } = data;
        const posts = document.querySelectorAll(
          "#container > div.articles > article"
        );

        posts.forEach((post) => {
          // 1. 게시판 이름 검사
          const boardElement = post.querySelector(".boardname");
          const isBoardMatch =
            boardElement &&
            blockedBoards.some((word) => boardElement.innerText.includes(word));

          // 2. 키워드 검사 (.medium 요소)
          const contentElements = post.querySelectorAll(".medium");
          const isKeywordMatch = Array.from(contentElements).some((element) =>
            blockedKeywords.some((word) => element.innerText.includes(word))
          );

          const shouldHide = isBoardMatch || isKeywordMatch;
          const targetDisplay = shouldHide ? "none" : "";

          // 불필요한 DOM 조작 방지
          if (post.style.display !== targetDisplay) {
            post.style.display = targetDisplay;
          }
        });
      }
    );
  }

  // Observer 및 이벤트 리스너 설정
  const filterObserver = new MutationObserver(applyFilter);
  filterObserver.observe(document.body, { childList: true, subtree: true });

  applyFilter();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && (changes.blockedBoards || changes.blockedKeywords)) {
      applyFilter();
    }
  });
}
