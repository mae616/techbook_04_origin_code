const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// データはファイルには保存しない（サーバーを止めると消える）
let visits = 0;
// codeは、プレビューの砂場で動かすコード
const works = [
  { title: '1巻：1990年代風の自己紹介サイト', image: 'work1.png',
    code: "console.log('ようこそ！ あなたは訪問者です');" },
  { title: '2巻：クロージャのカウンター', image: 'work2.png',
    code: 'const make = () => { let n = 0; return () => ++n; };\n'
      + 'const count = make();\ncount();\nconsole.log(count());' },
  { title: '3巻：オリジンを比べる', image: 'work3.png',
    code: "const a = new URL('http://localhost:3000/');\n"
      + "const b = new URL('http://localhost:4000/');\n"
      + 'console.log(a.origin === b.origin);' },
];
const guestbook = [
  { author: 'サイトの主', message: 'ゲストブック、やっと開通しました' },
];

// 中身をJSONにして返す
function sendJSON(response, data) {
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(data));
}

const server = http.createServer((request, response) => {
  // 届いたリクエストを、ターミナルに記録する
  console.log(request.method, request.url, request.headers.origin);
  // 許可を書く（CORS）。相手はlocalhost:3000だけ
  response.setHeader('Access-Control-Allow-Origin',
    'http://localhost:3000');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Vary', 'Origin');

  // プリフライトには、上の許可だけを返す
  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.end();
    return;
  }

  // 作品の画像。ファイル名だけ取り出して、
  // imagesフォルダの外は読ませない
  if (request.url.startsWith('/images/')) {
    const name = path.basename(request.url);
    fs.readFile(path.join(__dirname, 'images', name), (error, data) => {
      if (error) {
        response.statusCode = 404;
        response.end();
        return;
      }
      response.setHeader('Content-Type', 'image/png');
      response.end(data);
    });
    return;
  }

  if (request.url === '/api/works' && request.method === 'GET') {
    sendJSON(response, works);
    return;
  }

  // 訪問者を数える（単純リクエストで届く）
  if (request.url === '/api/visits' && request.method === 'POST') {
    visits += 1;
    sendJSON(response, { count: visits });
    return;
  }

  if (request.url === '/api/guestbook' && request.method === 'GET') {
    sendJSON(response, guestbook);
    return;
  }

  // 書き込み（プリフライトのあとに届く）
  if (request.url === '/api/guestbook' && request.method === 'POST') {
    // 本文を最後まで受け取ってから読む
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
      const data = JSON.parse(body);
      // 長さだけ切りそろえ、中身はそのまま保存
      const entry = {
        author: String(data.author).slice(0, 20),
        message: String(data.message).slice(0, 200),
      };
      guestbook.push(entry);
      response.statusCode = 201;
      sendJSON(response, entry);
    });
    return;
  }

  response.statusCode = 404;
  response.end();
});

server.listen(4000, () => {
  console.log('http://localhost:4000 で待っています');
});
