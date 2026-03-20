# Add .doc, .docx, .csv to homepage file upload

## Information Gathered:
- Homepage app/page.tsx uses FileUpload with no acceptedTypes (defaults PDF)
- FileUpload in components/file-upload.component.tsx defaults `acceptedTypes = [".pdf"]`
- Validation checks extension against acceptedTypes
- UI shows "(PDF uniquement)"

## Plan:
**components/file-upload.component.tsx**:
- Update default to [".pdf", ".doc", ".docx", ".csv"]
- Update UI text to "(PDF, DOC, DOCX, CSV)"

**app/page.tsx**:
- Pass acceptedTypes={[".pdf", ".doc", ".docx", ".csv"]} to FileUpload

## Dependent Files:
- components/file-upload.component.tsx
- app/page.tsx

## Followup steps:
- Test upload .doc/.docx/.csv files
- Verify FormData/webhook handles them
- `npm run dev` + test homepage
