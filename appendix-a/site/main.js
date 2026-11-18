const api = 'http://localhost:4000';
const preview = document.querySelector('#preview');

// 訪問者カウンター：数えるのはサーバー（第2章・第3章）
async function countVisit() {
  const response = await fetch(`${api}/api/visits`, { method: 'POST' });
  const data = await response.json();
  document.querySelector('#visitorCount').textContent = data.count;
}

// 作品：別のオリジンから読み、画像は遅れて取りに行く（第3章・第4章）
async function showWorks() {
  const response = await fetch(`${api}/api/works`);
  const works = await response.json();
  for (const work of works) {
    const image = document.createElement('img');
    image.src = `${api}/images/${work.image}`;
    image.alt = work.title;
    image.loading = 'lazy';
    image.width = 200;
    image.height = 150;
    // 題名もAPIから来た文字。textContentで入れる
    const title = document.createElement('h3');
    title.textContent = work.title;
    // ボタンを押したら、コードをプレビューへ送る
    const button = document.createElement('button');
    button.textContent = 'コードを動かす';
    button.addEventListener('click', () => {
      // sandboxの中は名指しできない（第5章）
      preview.contentWindow.postMessage(work.code, '*');
    });
    const item = document.createElement('li');
    item.append(image, title, button);
    document.querySelector('#work-list').append(item);
  }
}

// プレビューからの結果：差出人を確かめる（第5章）
window.addEventListener('message', (event) => {
  if (event.source !== preview.contentWindow) {
    return;
  }
  // 届くのは、console.logの中身の配列
  document.querySelector('#result').textContent = event.data.join('\n');
});

// ゲストブック：文字は文字のまま表示する（第6章）
async function showGuestbook() {
  const response = await fetch(`${api}/api/guestbook`);
  const entries = await response.json();
  const list = document.querySelector('#entries');
  // 前の一覧を消してから、並べ直す
  list.textContent = '';
  for (const entry of entries) {
    const item = document.createElement('li');
    item.textContent = `${entry.author}：${entry.message}`;
    list.append(item);
  }
}

// 書き込み：JSONで送るので、プリフライトが先に飛ぶ（第3章）
const form = document.querySelector('#guestbook-form');
form.addEventListener('submit', async (event) => {
  // ページの移動を止めて、fetchで送る
  event.preventDefault();
  await fetch(`${api}/api/guestbook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author: form.elements.author.value,
      message: form.elements.message.value,
    }),
  });
  // 送り終えたら、入力欄を空にして一覧を読み直す
  form.reset();
  showGuestbook();
});

// 失敗の受け皿（第7章）
window.addEventListener('unhandledrejection', (event) => {
  console.log('[失敗]', event.reason);
});

// ページを開いたら、APIへ3本のリクエストを送る
countVisit();
showWorks();
showGuestbook();
