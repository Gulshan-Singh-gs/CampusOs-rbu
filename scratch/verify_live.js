const crypto = require('crypto');

const privJwk = {
  kty: 'RSA',
  n: 'ws6edbDDlOOGZuDJA3TfaeZGGXXPQkombTTwsnErdNWLGpr1zSBsdYZyjeEd84nLheGmnNf6dXd352Qs5tOXs5ygrjxXE5dhwdkvPZpU3wGf1U6sDYk5yfvrXCYGnK6o8izthvg5CNwAr-qZt-Q4Zr0WdR59ZU4Etogm6vK85jA8jqwOaSSQDSZLZ2L_vTc7vIUTWFRyJv6GNCGgLBGdAFx1EX9Id3p8_-VDoHrWw99RSjFuUYkHWZ16_O5UG8UUZNy3nrsJrjnf6UcNMviNhKBGgMrFBa3stUjB5QuK9Es8bBLQXkUjn0CLnfRMt8meZa1VtsPe0UoBDg8kOlkJYw',
  e: 'AQAB',
  d: 'DNq-eQyfc0EqOrqleP1qyp2fzYlJElo7O-SM53FxSSXYJnrIMm9ryLuE7pjGta3HiL-Rk3Lq-3pVJqclEVwv-_GfZq_jnQ7VrAltRRbcd9SvG8-zqbb-4bWmW6_Equ0Zh9VwHQJfHRcLUpBb8Vb1Y84hX7wR0S_7PqIwUzuOPHAf7XN8YCvoWHx9AjTqBxic58WDDc6D1G3YyD5I98W2uWlwEZt_e6sXr2DeFEdFSQq0wbyDZCqxyMFNts1GCPakaaNnlN3BApHQIFybqcK-b_dlLx0QJI0xCkgfUyYbaRc62VAUlaLGTLcnydORI2bAiARkP48oiRyEKAl5YUkr8Q',
  p: '4hyDP8V_mZzEr_YuvFMBZiOLvfoBleL7rkt7otgbU1mWFU1Ifk2s78NVIo4NvndbQXoSmh_yuLzxKJxnfAMnrELF4Yhd784Pc7kIIAR1W5Hg2YPfFx4oyIpRM5XlGEYN5pAXeNGbQoZQIfGgJmSrDgedCGUhu7yPm8HzrV9Dh5M',
  q: '3I7JXH84mbZVQ8njADIGAKuvb4PSPtzRufqj9t8-Ra2Dioi3a7Qkq23XhiSq-3N_fGKABhYsb2F__A-Lj1udtcinB1LflHRoLwbpeSmECrASUrQm81YcalGN4cMBAIGgOoHqtqrNspkp7Esxq1BfiYs010CPdF92RePLG8PQ-PE',
  dp: 'J3n26EFg_77BED-Y9URAsEZwdWCaukKA0nNXSJ0WWD0B2QI_L9373Xhq-rd2atSH2Cyp5sLBK8PBDugPoTUjzg1yYufeDqoZRIj_hCeDHdOgQBmn729Si4CqoKkA8HX6o1Bw6KUfyEOO5f47ibh1rONjZT3S3-YR5I2-L3y8W4U',
  dq: 'PDohckirRA4uKlyuyBbg3L4FIgZ1GwVhn895hqhfcNd43BOJQrfma4mLGO5aYl-fqG-dVgwoBiIxuLrl-TejUUiBk9ZlhzxiVrUkfBmCHQkHd94J5NjW2ZF7lPKTC3haMJ_ZYBg0I1j_wa6m2YkRDZYdz8mpYrXOrjcN9375SYE',
  qi: 'QWJU6dukgcOH0P9hR0puqGfw0IGo1kQnykAHdYBGCHLQer-Cn1F7XkK6Qk06zqhpKMnXtY8LMfUhtNCitTElnvjZ9h0gYd_FVPqpiHPidknG3iEptBCjEeEXUKqXDkY4LBkCn2blxtYBeVzZbKCXm2iWAB1_MR5-JqWkFUh2SMs',
  kid: 'rbu-idp-key-2026',
  alg: 'RS256'
};

function createSignedJwt(payload) {
  const header = { alg: 'RS256', typ: 'JWT', kid: 'rbu-idp-key-2026' };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = b64Header + '.' + b64Payload;

  const privateKey = crypto.createPrivateKey({ key: privJwk, format: 'jwk' });
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  const sig = sign.sign(privateKey).toString('base64url');
  return data + '.' + sig;
}

const now = Math.floor(Date.now() / 1000);
const validToken = createSignedJwt({
  iss: 'https://sso.rayatbahrauniversity.edu.in/auth/realms/campus',
  uid: 'RBU21CSE045',
  sub: 'e29f1092-2309-425b-9ff1-91d8487b2938',
  name: 'Gulshan Singh',
  department: 'Computer Science & Engineering',
  exp: now + 3600,
  nbf: now - 60
});

async function runLiveTests() {
  const base = 'https://campusos-rbu-owv.pages.dev';

  console.log('=== TEST 1: Forged Roll Number Bearer ===');
  const r1 = await fetch(base + '/api/v1/student/profile', {
    headers: { 'Authorization': 'Bearer RBU21CSE046' }
  });
  console.log('Status (Expect 401):', r1.status);

  console.log('\n=== TEST 2: Unsigned JWT ===');
  const r2 = await fetch(base + '/api/v1/student/profile', {
    headers: { 'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJSQlUyMUNTRTA0NSJ9' }
  });
  console.log('Status (Expect 401):', r2.status);

  console.log('\n=== TEST 3: Cryptographically Signed Valid RS256 JWT ===');
  const r3 = await fetch(base + '/api/v1/student/profile', {
    headers: { 'Authorization': 'Bearer ' + validToken }
  });
  console.log('Status (Expect 200):', r3.status);
  const b3 = await r3.json();
  console.log('Verified Profile:', b3.uid, '-', b3.fullName);

  console.log('\n=== TEST 4: UID Query Tampering (?uid=ADMIN) ===');
  const r4 = await fetch(base + '/api/v1/student/profile?uid=ADMIN', {
    headers: { 'Authorization': 'Bearer ' + validToken }
  });
  console.log('Status (Expect 200):', r4.status);
  const b4 = await r4.json();
  console.log('Returned UID (Expect RBU21CSE045, not ADMIN):', b4.uid);

  console.log('\n=== TEST 5: Submit Skill with Verified Token ===');
  const r5 = await fetch(base + '/api/v1/skills/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + validToken
    },
    body: JSON.stringify({
      skillName: 'Edge Cloudflare KV Verification',
      category: 'Computer Science and Engineering',
      proficiencyLevel: 'Expert'
    })
  });
  console.log('Status (Expect 201):', r5.status);
  const b5 = await r5.json();
  console.log('Submission Result:', b5.id, '-', b5.status);
}

runLiveTests();
