# Proposal: Profile Management Enhancement (Redmine #485023)

## Why

The current Profile View (`src/modules/profile/views/ProfileView.vue`) renders hardcoded placeholder information and lacks interactive management capabilities:

1. The Two-Factor Authentication card displays static, dummy details ("Enabled via Authenticator") that do not reflect actual security settings.
2. Users cannot upload or preview an avatar picture to personalize their account.
3. The personal details section displays static text with no editing modal and lacks a Date of Birth (DOB) field.
4. The password section has a non-functional "Update" button with no password change dialog.

This change brings complete profile management capabilities to the user while aligning with Redmine task #485023.

## Scope & Impact

- **Remove**: The static dummy Two-Factor Authentication card from `ProfileView.vue`.
- **Add**: Profile picture upload with client-side file validation (JPEG/PNG, max 2MB) and instant preview state.
- **Add**: Date of Birth (DOB) field to Personal Information.
- **Add**: Edit Profile modal dialog with input validation and PrimeVue `DatePicker`.
- **Add**: Change Password modal dialog with current password, new password, and confirmation password validation.
- **Preserve**: Existing profile hero card styling, role display badge, active status pill, and responsive layout.

## Reusable Building Blocks & Dependencies

To avoid duplication, this change strictly reuses existing project assets:

- **UI Components**:
  - PrimeVue `Dialog`, `DatePicker`, `Tag`, `Toast`, `Button`
  - Reusable project dialog footer: `@/components/DialogFooter.vue`
- **Utilities**:
  - `@/utils/dateUtils.ts` (`formatDateForAPI`, `normalizeDOB`) for Date of Birth parsing and formatting
- **Stores**:
  - `@/core/auth/authStore.ts` for authenticated user state
  - `@/core/permissions/permissionStore.ts` for user roles
- **API Services & Constants**:
  - `@/constants` (`api` Axios instance)

## Out of Scope

- Backend two-factor authentication configuration (authenticator app enrollment will be handled in a dedicated security initiative).
- Multi-crop/avatar resizing tooling (native preview and aspect-fit rendering will be used).
