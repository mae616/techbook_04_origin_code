const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// 拡張子ごとに、返すファイルの種類を決めておく
const types = { '.html': 'text/html', '.js': 'text/javascript',
  '.png': 'image/png', '.css': 'text/css' };

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost:3000');

  // /slow.js だけは、1秒待ってから返す
  if (url.pathname === '/slow.js') {
    // ?name=defer などの名前を、ログの頭に使う
    const name = url.searchParams.get('name');
    setTimeout(() => {
      // 返すのは、#last がもうあるかを出すスクリプト
      response.setHeader('Content-Type', 'text/javascript');
      response.end(`console.log('[${name}] 実行。いちばん下の要素は',
  document.querySelector('#last') ? 'ある' : 'まだない');`);
    }, 1000);
    return;
  }

  // ほかは public のファイルを返す。無ければ404
  const file = path.join(__dirname, 'public', url.pathname);
  fs.readFile(file, (error, data) => {
    if (error) {
      response.statusCode = 404;
      response.end();
      return;
    }
    response.setHeader('Content-Type', types[path.extname(file)]);
    response.end(data);
  });
});

// 3000番で待ち受ける
server.listen(3000, () => {
  console.log('http://localhost:3000 で待っています');
});
