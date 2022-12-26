const Vault = require('hashi-vault-js');
const fs = require('fs');
var axios = require('axios');

axios.defaults.baseURL = process.env.HASHICORP_VAULT_URL;
axios.defaults.headers.common['X-Vault-Token'] =
  process.env.HASHICORP_DEV_ROOT_TOKEN;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const vault = new Vault({
  https: false,
  baseUrl: process.env.HASHICORP_VAULT_URL,
  timeout: 5000,
  proxy: false,
});

const rootPath = process.env.HASHICORP_ROOT_PATH;

seedHashiCorpVault();

async function seedHashiCorpVault() {
  await mountKVSecretsEngine();
  await createSecrets();
  await updateDefaultPolicy();
  await enableUserpassAuth();
  await createTestUser();
}

async function mountKVSecretsEngine() {
  const engineConfig = {
    path: rootPath,
    type: 'kv',
    config: {},
    options: {
      version: 2,
    },
    generate_signing_key: true,
    id: rootPath,
  };
  try {
    await axios.post(`sys/mounts/${rootPath}`, engineConfig);
  } catch (e) {
    console.log('Error when mounting KV secrets engine:\n', e);
  }
}

async function createSecrets() {
  fs.readFile(
    'mock-hashicorp-secrets.json', // do NOT change the name of the file
    'utf-8',
    async (_err, mockHashiscorpSecrets) => {
      const payload = {
        name: process.env.HASHICORP_SECRET_ADDRESS,
        data: JSON.parse(mockHashiscorpSecrets),
      };
      try {
        await vault.createKVSecret(
          process.env.HASHICORP_DEV_ROOT_TOKEN,
          payload.name,
          payload.data,
          rootPath,
        );
      } catch (e) {
        console.log('Error when creating secrets:\n', e);
      }
    },
  );
}

async function updateDefaultPolicy() {
  const updatedPolicyData = {
    policy: `path "${rootPath}/*" {\n  capabilities = ["read"]\n}\n`,
  };
  try {
    await axios.post('/sys/policy/default', updatedPolicyData);
  } catch (e) {
    console.log('Error when updating default policy:\n', e);
  }
}

async function enableUserpassAuth() {
  const authMethod = {
    path: 'userpass',
    type: 'userpass',
    config: {},
  };
  try {
    await axios.post('/sys/auth/userpass', authMethod);
  } catch (e) {
    console.log('Error when enabling userpass auth:\n', e);
  }
}

async function createTestUser() {
  try {
    await vault.createUserpassUser(
      process.env.HASHICORP_DEV_ROOT_TOKEN,
      process.env.HASHICORP_USERNAME,
      process.env.HASHICORP_PASSWORD,
      ['default'],
    );
  } catch (e) {
    console.log('Error when creating test user:\n', e);
  }
}
