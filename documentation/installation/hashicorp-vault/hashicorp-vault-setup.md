# HashiCorp Vault Setup

## Adding secrets to the HashiCorp Vault
The HashiCorp Vault is used to provide the datagen with the secrets that sign the payloads going to the HL adapter. On UAT and production, this vault is hosted by DHL. For development, a mock HashiCorp Vault is used. The `src/mock-hashicorp-secrets.example.json` shows an example payload of how the secrets should be configured. This example payload is also shown below. The secrets can be put into the Vault by following the steps shown below. Note that the secrets should be base64 encoded before putting them in the vault.

### Steps for UAT and production
1. Make sure the environment variables shown below are added to the `.env`. HASHICORP_DEV_ROOT_TOKEN can be omitted.
2. Base64 encode the .pem file of each secret individually. This base64 encoded string needs to be put in the secrets payload. Encoding can be done via the following command for example: `base64 key.pem`. Make sure the .pem starts with -----BEGIN PRIVATE KEY----- and ends with -----END PRIVATE KEY-----. For any shared secret, the secret can be a passphrase as well. This passphrase also needs to be base64 encoded.
3. Replace the mock `"dhl"` key value with the real base64 encoded private key of DHL.
4. Replace the mock `"shared"` key value with the real base64 encoded shared secret between DHL and Dubai Customs.
5. Replace `"<ecomBusinessCode>"` in the `mock-hashicorp-secrets.json` with the real ecomBusinessCode of the ecom party. Add multiple if there are more than one ecom party.
6. Inject the secrets into the HashiCorp Vault.

### Steps for development (mock HashiCorp Vault)
1. Make sure the environment variables shown below are added to the `.env`,
2. Create a new file named `mock-hashicorp-secrets.json` in `src` and provide it with the secrets you want to use according to the example payload of the `src/mock-hashicorp-secrets.example.json`. The `mock-hashicorp-secrets.json` is added the `.gitignore` to prevent any real secrets being pushed to the repo. DO NOT CHANGE THE NAME OF THIS FILE.
3. Base64 encode the .pem file of each secret individually. This base64 encoded string needs to be put in the secrets payload. Encoding can be done via the following command for example: `base64 key.pem`. Make sure the .pem starts with -----BEGIN PRIVATE KEY----- and ends with -----END PRIVATE KEY-----. For any shared secret, the secret can be a passphrase as well. This passphrase also needs to be base64 encoded.
4. Replace the mock `"dhl"` key value with the real base64 encoded private key of DHL.
5. Replace the mock `"shared"` key value with the real base64 encoded shared secret between DHL and Dubai Customs.
6. Replace `"<ecomBusinessCode>"` in the `mock-hashicorp-secrets.json` with the real ecomBusinessCode of the ecom party. Add multiple if there are more than one ecom party.
7. Deploy and build the application. The secrets are added to the vault and injected into datagen on startup.

### Environment Variables
```dotenv
HASHICORP_DHL_CODE_LOOKUP="dhl"
HASHICORP_SHARED_KEY_LOOKUP="shared"
HASHICORP_SECRET_ADDRESS="test"
HASHICORP_DEV_ROOT_TOKEN="myroot" #only required for the mock HashiCorp Vault
HASHICORP_VAULT_URL="http://mock_hashicorp_vault:8200/v1"
HASHICORP_USERNAME='testuser'
HASHICORP_PASSWORD='testpassword'
HASHICORP_ROOT_PATH='kv2''
```

### Secrets example payload
```JSON
{
  "<ecomBusinessCode>": "LS0tLS1C<...>tLS0K",
  "dhl": "LS0tLS1CRUdJTiBQUQVRFI<...>tLS0K",
  "shared": "MTIzNDU2" #base64 encoded string of "123456"
}
```