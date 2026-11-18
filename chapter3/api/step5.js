const http = require('node:http');

// 投稿の一覧（メモリに置くだけ）
const posts = [
  { id: 1, title: 'はじめての投稿' },
  { id: 2, title: 'CORSを試しています' },
];

// リクエストが届くたびに、この関数が動く
const server = http.createServer((request, response) => {
  // メソッド・URL・Originをターミナルに出す
  console.log(request.method, request.url, request.headers.origin);
  // 5段目：届いたCookieも出す
  console.log('Cookie:', request.headers.cookie);
  // 5段目：オリジンを名指しし、Cookie付きを許す
  const origin = 'http://localhost:3000';
  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  // 4段目：Content-Typeのヘッダーを許す
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // 5段目：返事がオリジンで変わる、という印
  response.setHeader('Vary', 'Origin');

  // 3段目：プリフライト（OPTIONS）に204で答える
  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.end();
    return;
  }

  // GET：投稿の一覧をJSONで返す
  if (request.url === '/api/posts' && request.method === 'GET') {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(posts));
    return;
  }

  // POST：送られたJSONを受け取り、投稿に足す
  if (request.url === '/api/posts' && request.method === 'POST') {
    let body = '';
    // 本文は小分けに届くので、つないでおく
    request.on('data', (chunk) => { body += chunk; });
    // 届き終わったら、投稿を足して返す
    request.on('end', () => {
      const title = JSON.parse(body).title;
      const post = { id: posts.length + 1, title };
      posts.push(post);
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(post));
    });
    return;
  }

  // どれにも当たらなければ404（見つからない）
  response.statusCode = 404;
  response.end();
});

// 4000番で待ち受けを始める
server.listen(4000, () => {
  console.log('http://localhost:4000 で待っています');
});
