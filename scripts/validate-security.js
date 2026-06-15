const http = require('http');

const BASE_URL = 'http://localhost:3000';

const endpoints = [
  { path: '/api/stats', method: 'GET' },
  { path: '/api/evaluations', method: 'GET' },
  { path: '/api/evaluations', method: 'POST', body: {} },
  { path: '/api/evaluations/test-id', method: 'GET' },
  { path: '/api/evaluations/test-id/ad-copy', method: 'GET' },
  { path: '/api/evaluations/test-id/close', method: 'POST', body: {} },
  { path: '/api/evaluations/test-id/expenses', method: 'GET' },
  { path: '/api/evaluations/test-id/expenses', method: 'POST', body: {} },
  { path: '/api/evaluations/test-id/reject', method: 'POST', body: {} },
  { path: '/api/evaluations/test-id/stock', method: 'POST', body: {} },
  { path: '/api/kb', method: 'GET' },
  { path: '/api/kb', method: 'POST', body: {} },
  { path: '/api/kb', method: 'DELETE' }
];

function makeRequest(url, method, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\x1b[36m%s\x1b[0m', '=== Iniciando Testes de Validação de Segurança (API) ===\n');
  let passedCount = 0;
  let failedCount = 0;

  // 1. Testar se todas as rotas protegidas retornam 401 Unauthorized sem token
  console.log('\x1b[33m%s\x1b[0m', '1. Testando bloqueio de rotas sem autenticação (Esperado: 401)...');
  for (const ep of endpoints) {
    try {
      const url = `${BASE_URL}${ep.path}`;
      const res = await makeRequest(url, ep.method, ep.body);
      
      if (res.statusCode === 401) {
        console.log(`\x1b[32m[PASS]\x1b[0m ${ep.method} ${ep.path} -> Bloqueado com 401 Unauthorized`);
        passedCount++;
      } else {
        console.log(`\x1b[31m[FAIL]\x1b[0m ${ep.method} ${ep.path} -> Retornou status ${res.statusCode} (Esperava 401)`);
        failedCount++;
      }
    } catch (err) {
      console.log(`\x1b[31m[ERROR]\x1b[0m Falha ao conectar em ${ep.path}: ${err.message}. Certifique-se de que o servidor local está rodando (npm run dev).`);
      failedCount++;
    }
  }

  // 2. Testar rota do Cron com CRON_SECRET simulado (se houver suporte local)
  console.log('\n\x1b[33m%s\x1b[0m', '2. Testando rota do cron /api/cron/stats...');
  try {
    const url = `${BASE_URL}/api/cron/stats`;
    const res = await makeRequest(url, 'GET');
    
    // Se localmente não tiver CRON_SECRET definido, deve rodar com sucesso (200 ou retornar 200 com msg de nenhum caso)
    if (res.statusCode === 200 || res.statusCode === 401) {
      console.log(`\x1b[32m[PASS]\x1b[0m GET /api/cron/stats -> Resposta recebida (Status: ${res.statusCode})`);
      passedCount++;
    } else {
      console.log(`\x1b[31m[FAIL]\x1b[0m GET /api/cron/stats -> Retornou status ${res.statusCode} inesperado`);
      failedCount++;
    }
  } catch (err) {
    console.log(`\x1b[31m[ERROR]\x1b[0m Falha ao testar rota do cron: ${err.message}`);
    failedCount++;
  }

  console.log('\n\x1b[36m%s\x1b[0m', '=== Resumo dos Testes ===');
  console.log(`Total de testes que passaram: \x1b[32m${passedCount}\x1b[0m`);
  console.log(`Total de testes que falharam: \x1b[31m${failedCount}\x1b[0m`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
