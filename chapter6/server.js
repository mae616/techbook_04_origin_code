const http = require('node:http');
const fs = require('node:fs');
const crypto = require('node:crypto');

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost:3000');
  // 届いたリクエストと、付いてきたCookieを出す
  console.log(request.method, url.pathname, request.headers.cookie);

  // CSRFの実験用：送金を受け取ったふりをする
  if (url.pathname === '/transfer') {
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end('送金のリクエストを受け取りました');
    return;
  }

  // ページを返すたびに、使い捨ての印（nonce）を作る
  const nonce = crypto.randomBytes(16).toString('base64');
  // ?csp= の値で、張るCSPの網を選ぶ
  const mode = url.searchParams.get('csp');
  // 同じオリジンのファイルだけ許す
  if (mode === 'self') {
    response.setHeader('Content-Security-Policy', "script-src 'self'");
  }
  // 印（nonce）の付いたスクリプトだけ許す
  if (mode === 'nonce') {
    response.setHeader('Content-Security-Policy',
      `script-src 'nonce-${nonce}'`);
  }
  // 止めずに、報告だけさせる
  if (mode === 'report') {
    response.setHeader('Content-Security-Policy-Report-Only',
      `script-src 'nonce-${nonce}'`);
  }
  // nonceに加えて、Trusted Typesを有効にする
  if (mode === 'tt') {
    response.setHeader('Content-Security-Policy',
      `script-src 'nonce-${nonce}'; ` +
      "require-trusted-types-for 'script'");
  }

  // 2つのCookieを渡す。sessionはHttpOnly
  response.setHeader('Set-Cookie', [
    'session=secret123; HttpOnly; SameSite=Lax',
    'theme=dark; SameSite=Lax',
  ]);
  // HTMLの印の場所を、作ったnonceに置き換えて返す
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  const html = fs.readFileSync(`${__dirname}/index.html`, 'utf-8');
  response.end(html.replace('NONCE', nonce));
});

server.listen(3000, () => {
  console.log('http://localhost:3000 で待っています');
});
