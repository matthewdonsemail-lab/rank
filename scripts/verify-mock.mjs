import http from 'node:http';

async function main() {
  console.log('Testing Mock Architecture, Doc Backing Validation & Treg Routes...');

  const { createMockServer } = await import('../mock/server.ts');
  const { mockClient } = await import('../mock/client.ts');
  const { mockStore } = await import('../mock/store.ts');
  const { validateFixtureDocBacking } = await import('../mock/validator.ts');

  // 1. Verify in-memory relational store referential integrity
  console.log('Verifying relational store integrity...');
  const user = mockStore.authUsers[0];
  const org = mockStore.authOrganizations[0];
  const ws = mockStore.workspaces[0];
  const key = mockStore.apiKeys[0];
  const session = mockStore.rankSessions[0];
  const candidates = mockStore.getCandidatesBySession(session.id);
  const receipt = mockStore.getReceiptBySession(session.id);
  const benchmark = mockStore.benchmarkRuns[0];
  const agentThread = mockStore.agentThreads[0];
  const agentMessage = mockStore.agentMessages[0];
  const mailInbox = mockStore.agentMailInboxes[0];
  const mailThread = mockStore.agentMailThreads[0];
  const mailMessage = mockStore.agentMailMessages[0];
  const tregTool = mockStore.tregTools[0];
  const tregCall = mockStore.tregCalls[0];
  const brand = mockStore.getBrand();

  if (!brand || brand.id !== 'brand-default') throw new Error('Brand record missing from mockStore');
  if (!brand.identity.name) throw new Error('Brand missing identity.name');
  if (brand.offerings.length === 0) throw new Error('Brand missing offerings');
  if (brand.sources.length === 0) throw new Error('Brand missing sources');
  if (!brand.channels.reddit) throw new Error('Brand missing reddit channel profile');

  if (org.ownerId !== user.id) throw new Error('Referential mismatch: org.ownerId != user.id');
  if (ws.organizationId !== org.id) throw new Error('Referential mismatch: ws.organizationId != org.id');
  if (key.workspaceId !== ws.id) throw new Error('Referential mismatch: key.workspaceId != ws.id');
  if (session.workspaceId !== ws.id) throw new Error('Referential mismatch: session.workspaceId != ws.id');
  if (candidates.length === 0 || candidates[0].sessionId !== session.id) {
    throw new Error('Referential mismatch: candidate.sessionId != session.id');
  }
  if (!receipt || receipt.sessionId !== session.id) {
    throw new Error('Referential mismatch: receipt.sessionId != session.id');
  }
  if (benchmark.workspaceId !== ws.id) throw new Error('Referential mismatch: benchmark.workspaceId != ws.id');
  if (agentThread.workspaceId !== ws.id) throw new Error('Referential mismatch: agentThread.workspaceId != ws.id');
  if (agentMessage.threadId !== agentThread.id) throw new Error('Referential mismatch: agentMessage.threadId != agentThread.id');
  if (mailInbox.workspaceId !== ws.id) throw new Error('Referential mismatch: mailInbox.workspaceId != ws.id');
  if (mailThread.inboxId !== mailInbox.id) throw new Error('Referential mismatch: mailThread.inboxId != mailInbox.id');
  if (mailMessage.threadId !== mailThread.id) throw new Error('Referential mismatch: mailMessage.threadId != mailThread.id');
  if (!tregTool.endpoint) throw new Error('Treg tool missing endpoint');
  if (!tregCall.callId) throw new Error('Treg call missing callId');

  console.log('Referential integrity checks passed across all relational models.');

  // 2. Start mock server on ephemeral port
  const TEST_PORT = 3999;
  const server = createMockServer();
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://localhost:${TEST_PORT}`;
  console.log(`Mock server running on ${baseUrl}`);

  const testEndpoints = [
    { method: 'GET', path: '/health', validate: (d) => d.status === 'healthy' },
    { method: 'GET', path: '/api/auth/user', validate: (d) => d.id === 'usr_rank_01' },
    { method: 'GET', path: '/api/auth/organization', validate: (d) => d.slug === 'listeningkit-lab' },
    { method: 'GET', path: '/api/workspaces', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/workspaces/nebius-core-prod', validate: (d) => d.slug === 'nebius-core-prod' && d.stats },
    { method: 'GET', path: '/api/keys?workspaceId=ws_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/v1/sessions?workspaceId=ws_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/v1/sessions/rs_rank_01', validate: (d) => d.session && d.candidates.length === 3 },
    { method: 'GET', path: '/api/v1/sessions/rs_rank_01/candidates', validate: (d) => Array.isArray(d) && d.length === 3 },
    { method: 'GET', path: '/api/v1/receipts?sessionId=rs_rank_01', validate: (d) => Array.isArray(d) && d.length === 1 },
    { method: 'GET', path: '/api/benchmarks?workspaceId=ws_rank_01', validate: (d) => Array.isArray(d) && d.length >= 3 },
    { method: 'GET', path: '/api/agent/threads?workspaceId=ws_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/agent/messages?threadId=ath_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/agentmail/inboxes?workspaceId=ws_rank_01', validate: (d) => Array.isArray(d) && d.length >= 1 },
    { method: 'GET', path: '/api/agentmail/threads?inboxId=inbox_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/agentmail/messages?threadId=mth_rank_01', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/treg/tools', validate: (d) => Array.isArray(d) && d.length >= 4 },
    { method: 'GET', path: '/api/treg/calls', validate: (d) => Array.isArray(d) && d.length >= 2 },
    { method: 'GET', path: '/api/brand', validate: (d) => d.brand && d.brand.id === 'brand-default' && d.brand.offerings.length >= 2 },
    { method: 'GET', path: '/api/brand/sources', validate: (d) => Array.isArray(d.sources) && d.sources.length >= 2 },
  ];

  for (const ep of testEndpoints) {
    const res = await fetch(`${baseUrl}${ep.path}`, { method: ep.method });
    if (!res.ok) {
      throw new Error(`Endpoint ${ep.path} returned status ${res.status}`);
    }
    const data = await res.json();
    if (!ep.validate(data)) {
      throw new Error(`Endpoint ${ep.path} failed validation`);
    }
    console.log(`PASS: ${ep.method} ${ep.path}`);
  }

  // 3. Test documentation backing validation argument (?verifyDocBacking=true)
  console.log('Testing doc backing validation argument (?verifyDocBacking=true)...');
  const docCheckEndpoints = [
    '/api/auth/user?verifyDocBacking=true',
    '/api/workspaces?verifyDocBacking=true',
    '/api/v1/sessions?verifyDocBacking=true',
    '/api/treg/tools?verifyDocBacking=true',
    '/api/treg/calls?verifyDocBacking=true',
    '/api/brand?verifyDocBacking=true',
    '/api/brand/sources?verifyDocBacking=true',
  ];

  for (const path of docCheckEndpoints) {
    const res = await fetch(`${baseUrl}${path}`);
    if (!res.ok) throw new Error(`Doc check endpoint ${path} returned ${res.status}`);
    const json = await res.json();
    if (!json._meta || json._meta.docBacked !== true) {
      throw new Error(`Endpoint ${path} did not return _meta.docBacked envelope`);
    }
    if (json._meta.verified !== true) {
      throw new Error(`Endpoint ${path} failed doc verification: ${json._meta.docPath}`);
    }
    console.log(`PASS: ${path} verified against ${json._meta.docPath} (${json._meta.specSection})`);
  }

  // 4. Test dynamic POST /api/v1/rank
  console.log('Testing dynamic POST /api/v1/rank...');
  const rankRes = await fetch(`${baseUrl}/api/v1/rank`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: 'ws_rank_01',
      query: 'What is the latency of BAAI reranker on Nebius AI Studio?',
      candidates: [
        { id: 'c1', text: 'Nebius AI Studio hosts BAAI reranker with sub-15ms latency.' },
        { id: 'c2', text: 'Unrelated text about weather in Honolulu.' },
      ],
    }),
  });
  if (!rankRes.ok) throw new Error(`POST /api/v1/rank returned ${rankRes.status}`);
  const rankData = await rankRes.json();
  if (!rankData.sessionId || rankData.results.length !== 2) {
    throw new Error('Invalid rank inference response shape');
  }
  if (rankData.results[0].id !== 'c1') {
    throw new Error('Ranking heuristic failed: expected c1 to rank 1');
  }
  console.log(`PASS: POST /api/v1/rank returned session ${rankData.sessionId}`);

  // 5. Test POST /api/treg/call tool execution
  console.log('Testing POST /api/treg/call tool execution...');
  const initialCallCount = mockStore.tregCalls.length;
  const tregRes = await fetch(`${baseUrl}/api/treg/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner: 'user_test_42',
      endpoint: 'spyfu.google.domain.competitors',
      params: { domain: 'listeningkit.com' },
      maxCostUsd: 0.01,
    }),
  });
  if (!tregRes.ok) throw new Error(`POST /api/treg/call returned ${tregRes.status}`);
  const tregExecData = await tregRes.json();
  if (!tregExecData.callId || !tregExecData.result || tregExecData.costMicro !== 200) {
    throw new Error('Invalid Treg tool execution response');
  }
  if (mockStore.tregCalls.length !== initialCallCount + 1) {
    throw new Error('Treg call receipt was not recorded in mockStore');
  }
  console.log(`PASS: POST /api/treg/call executed ${tregExecData.endpoint} (callId: ${tregExecData.callId}, cost: ${tregExecData.costMicro} micro-usd)`);

  // 6. Test ConvexMockClient interface with verifyDocBacking
  console.log('Testing ConvexMockClient interface with verifyDocBacking: true...');
  const queryResult = await mockClient.query('treg:listTools', { verifyDocBacking: true });
  if (!queryResult._meta || queryResult._meta.verified !== true || !Array.isArray(queryResult.data)) {
    throw new Error('mockClient.query with verifyDocBacking failed');
  }
  console.log(`PASS: mockClient.query treg:listTools verified against ${queryResult._meta.docPath}`);

  const actionResult = await mockClient.action('treg:callTool', {
    owner: 'user_agent_turn',
    endpoint: 'brave.web.search',
    params: { query: 'Nebius cross-encoder ranking' },
    maxCostUsd: 0.05,
  });
  if (!actionResult || !actionResult.callId || actionResult.costMicro !== 800) {
    throw new Error('mockClient.action treg:callTool failed');
  }
  console.log(`PASS: mockClient.action treg:callTool returned callId ${actionResult.callId}`);

  // 7. Test Brand Dynamic Endpoints, Compiler & MockClient
  console.log('Testing Brand Dynamic Endpoints, Compiler & MockClient...');
  const { buildBrandSystemPrompt, simulateOutbound, retrieveSourceRefs, PROMPT_VERSION } = await import('../lib/brand/index.ts');

  // Test PUT /api/brand
  const putBrandRes = await fetch(`${baseUrl}/api/brand`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: { tagline: 'Updated low-latency ranking tagline' },
    }),
  });
  if (!putBrandRes.ok) throw new Error(`PUT /api/brand returned ${putBrandRes.status}`);
  const putBrandData = await putBrandRes.json();
  if (putBrandData.brand.identity.tagline !== 'Updated low-latency ranking tagline') {
    throw new Error('PUT /api/brand failed to merge tagline');
  }
  console.log('PASS: PUT /api/brand updated brand tagline');

  // Test POST /api/brand/intelligence
  const intelRes = await fetch(`${baseUrl}/api/brand/intelligence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      competitors: ['nebius.com', 'cohere.com'],
      selectedKeyword: 'cross-encoder reranking on nebius',
    }),
  });
  if (!intelRes.ok) throw new Error(`POST /api/brand/intelligence returned ${intelRes.status}`);
  const intelData = await intelRes.json();
  if (!intelData.brand.intelligence.competitors.includes('nebius.com')) {
    throw new Error('POST /api/brand/intelligence failed to append competitor');
  }
  console.log('PASS: POST /api/brand/intelligence appended competitor');

  // Test POST /api/brand/index
  const indexRes = await fetch(`${baseUrl}/api/brand/index`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls: ['https://listeningkit.com/benchmarks'],
    }),
  });
  if (!indexRes.ok) throw new Error(`POST /api/brand/index returned ${indexRes.status}`);
  const indexData = await indexRes.json();
  if (!indexData.sources.some((s) => s.url === 'https://listeningkit.com/benchmarks')) {
    throw new Error('POST /api/brand/index failed to register pending URL');
  }
  console.log('PASS: POST /api/brand/index indexed URL candidate');

  // Test DELETE /api/brand/sources
  const delSourceRes = await fetch(`${baseUrl}/api/brand/sources`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://listeningkit.com/benchmarks',
    }),
  });
  if (!delSourceRes.ok) throw new Error(`DELETE /api/brand/sources returned ${delSourceRes.status}`);
  const delSourceData = await delSourceRes.json();
  if (delSourceData.sources.some((s) => s.url === 'https://listeningkit.com/benchmarks')) {
    throw new Error('DELETE /api/brand/sources failed to remove URL');
  }
  console.log('PASS: DELETE /api/brand/sources removed URL');

  // Test Brand System Prompt Compiler
  const currentBrand = mockStore.getBrand();
  const compiledPrompt = buildBrandSystemPrompt(currentBrand);
  if (!compiledPrompt.includes('Voice: Friendly, plain-spoken local pro') || !compiledPrompt.includes('Services you can mention:')) {
    throw new Error('Brand compiler buildBrandSystemPrompt failed');
  }
  console.log(`PASS: buildBrandSystemPrompt generated deterministic prompt (version ${PROMPT_VERSION})`);

  // Test simulateOutbound
  const simulated = simulateOutbound(currentBrand, 'reddit', 'can anyone help with boiler install?');
  if (!simulated || !simulated.text) {
    throw new Error('simulateOutbound returned empty reply');
  }
  console.log(`PASS: simulateOutbound generated reply on reddit: "${simulated.text.slice(0, 60)}..."`);

  // Test retrieveSourceRefs
  const refs = retrieveSourceRefs(currentBrand, 'cross-encoder scoring latency');
  if (refs.length === 0) {
    throw new Error('retrieveSourceRefs returned empty matches');
  }
  console.log(`PASS: retrieveSourceRefs retrieved ${refs.length} passage citation(s)`);

  // Test MockClient brand methods
  const clientBrandRes = await mockClient.query('brand:get', { verifyDocBacking: true });
  if (!clientBrandRes._meta || clientBrandRes._meta.verified !== true || !clientBrandRes.data?.id) {
    throw new Error('mockClient.query brand:get with verifyDocBacking failed');
  }
  console.log(`PASS: mockClient.query brand:get verified against ${clientBrandRes._meta.docPath}`);

  // Close server cleanly
  await new Promise((resolve) => server.close(resolve));
  console.log('All mock route, doc backing, Treg, and Brand verification tests completed successfully.');
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
