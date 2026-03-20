# n8n Webhook Setup for Multi-Level Reports

## Current Issue
- Single webhook path `/webhook-test/ville` → 404 after 1st call (test mode)
- All levels (region/district/commune) use same path

## Solution: Create 3 Workflows

### 1. Workflow "ville" (Commune)
```
Path: ville  
Webhook ID: 530a7c07-f4b0-4585-b0ed-47e114c18485 (current)
Prompt: ... nom de la ville
```

### 2. Duplicate → Workflow "region"  
```
1. Copy current "ville" workflow
2. Webhook node → Path: `region`
3. Edit Fields4 → Prompt: `Génère un rapport pour la **region** : {{ $json.body.name }}`
4. Save → Execute Workflow → Copy new Webhook URL/ID
```

### 3. Duplicate → Workflow "district"  
```
Path: `district`
Prompt: `Génère un rapport pour le **district** : {{ $json.body.name }}`
```

## Update .env.local
```
N8N_WEBHOOK_VILLE=https://n8n.itdcmada.com/webhook-test/ville
N8N_WEBHOOK_REGION=https://n8n.itdcmada.com/webhook-test/region  
N8N_WEBHOOK_DISTRICT=https://n8n.itdcmada.com/webhook-test/district
```

## Update API Routes (after new webhooks created)
In `app/api/n8n/region-report/route.ts` → replace URL:
```ts
const url = process.env.N8N_WEBHOOK_REGION || "https://n8n.itdcmada.com/webhook-test/region";
```
Same for district-report.

## Test
```
1. Create 3 workflows above
2. Update .env.local
3. npm run dev
4. Click map region/district/commune → reports load
```

Current code **fully implements frontend logic** - just needs n8n side configured for production use.
