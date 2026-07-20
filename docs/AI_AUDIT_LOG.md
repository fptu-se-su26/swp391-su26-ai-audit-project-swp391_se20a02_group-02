# AI Audit Log

This document records the changes made to the repository by AI assistants during the development process.

## 2026-07-20

### Backend Updates
- Configured correct demo user credentials in `src/Back_end/import-data.sql` to match the expected project defense script:
  - Added Customer: `nguyen.van.a@gmail.com`
  - Added Owner: `pham.minh.d@gmail.com`
  - Verified Admin: `admin@luxeway.vn`

### Frontend Updates
- Added `TestBackendPage` under `/test-backend` to verify API and Database connectivity.
- Updated `App.tsx` routes to include `test-backend`.

### CI/CD
- Fixed `AI_AUDIT_LOG.md` missing error in GitHub actions.
