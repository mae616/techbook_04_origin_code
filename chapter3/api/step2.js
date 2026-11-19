const http = require('node:http');

// 投稿の一覧（ファイルには保存しない。サーバーを止めると消える）
const posts = [
  { id: 1, title: 'はじめての投稿' },
  { id: 2, title: 'CORSを試しています' },
];

// リクエストが届くたびに、この関数が動く
const server = http.createServer((request, response) => {
  // 届いたリクエストの3つの値をターミナルに出す
  console.log(request.method, request.url, request.headers.origin);
  // ステップ2：許可のヘッダーを付ける（どなたにでも）
  response.setHeader('Access-Control-Allow-Origin', '*');

  // 場所が/api/posts、メソッドがGETなら、投稿の一覧をJSONで返す
  if (request.url === '/api/posts' && request.method === 'GET') {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(posts));
    return;
  }

  // 場所が/api/posts、メソッドがPOSTなら、送られた投稿を一覧に足す
  if (request.url === '/api/posts' && request.method === 'POST') {
    let body = '';
    // 送られた文字列は何回かに分けて届くので、bodyにつなげて1つにする
    request.on('data', (chunk) => { body += chunk; });
    // 全部届いたら、JSONとして読み、投稿を足して返す
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
