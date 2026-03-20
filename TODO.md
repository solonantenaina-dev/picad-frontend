# Task: Replace return { message: rawText } with robust JSON parse + error fallback

## Steps
- [x] 1. Edit components/cartographie/cartographie-content.tsx (replace fallback in sendVilleToN8n)
- [x] 2. Edit app/api/n8n/ville/route.ts (replace catch fallback)
- [x] 3. Test cartographie page: npm run dev, select commune, check error handling
- [x] 4. Improve proxy route per user spec (new code provided: app/api/n8n/ville-proxy/route.ts)
- [x] 5. Complete

✅ Task completed: Replaced return { message: rawText } in cartographie-content.tsx and ville/route.ts with try-catch JSON.parse + structured error object. Created improved n8n proxy at /api/n8n/ville-proxy with robust parsing, auth support, and consistent error format matching N8nVilleReport type.

To test:
npm run dev
Navigate to /cartographie, select a commune on map.
Simulate n8n error (e.g., invalid JSON response) - UI shows structured fields.
Use new proxy: POST to /api/n8n/ville-proxy/{body}
