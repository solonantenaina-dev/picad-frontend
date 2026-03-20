# Task: Enable region/district clicks to fetch N8nVilleReport (same format as commune)

## Plan Steps
- [x] 1. Create app/api/n8n/region-report/route.ts (copy ville logic, change level:"region")
- [x] 2. Create app/api/n8n/district-report/route.ts (copy ville logic, change level:"district")  
- [x] 3. Edit components/cartographie/cartographie-content.tsx:
  - Add sendRegionReport() / sendDistrictReport() functions
  - Update handleMapAreaSelect(): for region/district → fetch report → setVilleReport
- [ ] 4. Test: npm run dev → click region → verify right panel shows report (same format)
- [ ] 5. Test district click
- [ ] 6. attempt_completion

**Current progress: ✅ Updated APIs to use dedicated n8n paths (/region, /district). Ready for n8n workflow duplication + test**
