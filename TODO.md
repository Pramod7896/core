# RBAC Enterprise Role Filtering TODO

## Plan Overview
Implement enterprise dropdown in frontend RBAC: select enterprise -> filter roles to that enterprise only (backend supports enterprize_fid).

## Steps

- [x] 1. Update backend/services/rbac.service.js: Add getEnterprizesService, getRolesByEnterprizeService, modify getUserRBACService for enterprizeId param
- [x] 2. Update backend/controllers/rbac.controller.js: Add controllers for new services
- [x] 3. Update backend/routes/v1/rbac.route.js: Add routes /enterprizes, /roles/:enterprizeId
- [x] 4. Update frontend/src/api/rbac.js: Add getEnterprizesAPI, getRolesByEnterprizeAPI
- [x] 5. Update frontend/src/pages/RBAC/RBACPage.js: Add enterprise state/dropdown, filter logic
- [ ] 6. Test: Backend `npm run dev`, Frontend `npm start`, verify superadmin RBAC flow
- [ ] 7. Complete task

Current: Starting step 1.
