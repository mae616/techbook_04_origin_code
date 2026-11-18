// ここは読み込まれてすぐ動く
// ボタンを探して、リスナーを登録する
let count = 0;
const button = document.querySelector('#count');
button.addEventListener('click', () => {
  // ここはクリックされたときに呼ばれる
  count += 1;
  button.textContent = `クリック：${count}`;
});
