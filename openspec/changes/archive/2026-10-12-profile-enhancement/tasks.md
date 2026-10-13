# Implementation Tasks: Profile Enhancement (Redmine #485023)

## 1. UI Cleanup & Layout Preparation

- [x] 1.1 Remove the static dummy Two-Factor Authentication card from `src/modules/profile/views/ProfileView.vue`
- [x] 1.2 Add Date of Birth (DOB) display block to the Personal Information grid in `ProfileView.vue`

## 2. Composable & State Management

- [x] 2.1 Create `src/modules/profile/composables/useProfile.ts` with reactive state for user details, avatar, and modal visibility
- [x] 2.2 Implement avatar file validation logic (formats: PNG/JPG/JPEG, max file size: 2MB)
- [x] 2.3 Implement Date of Birth parsing and normalization reusing `src/utils/dateUtils.ts`

## 3. Avatar Upload & Preview

- [x] 3.1 Implement avatar upload trigger with hover badge and camera icon in `ProfileView.vue`
- [x] 3.2 Wire hidden file input to `useProfile` upload handler with instant image preview
- [x] 3.3 Add Toast error messages for invalid format or oversized files

## 4. Edit Profile Dialog

- [x] 4.1 Create `src/modules/profile/components/EditProfileDialog.vue` reusing PrimeVue `Dialog` and `@/components/DialogFooter.vue`
- [x] 4.2 Integrate PrimeVue `DatePicker` for Date of Birth selection with date range constraints (birth date in the past)
- [x] 4.3 Connect Edit Profile button in `ProfileView.vue` to open the dialog and handle save updates

## 5. Change Password Dialog

- [x] 5.1 Create `src/modules/profile/components/ChangePasswordDialog.vue` reusing PrimeVue `Dialog` and `@/components/DialogFooter.vue`
- [x] 5.2 Implement validation fields: Current Password, New Password, Confirm Password with mismatch prevention
- [x] 5.3 Connect the "Update" button in Security & Credentials card to open the Change Password dialog

## 6. Unit Testing & Quality Assurance

- [x] 6.1 Create unit test `src/modules/profile/composables/useProfile.spec.ts` covering validation, date formatting, and avatar handling
- [x] 6.2 Ensure profile test coverage meets the repository threshold (min 80%)

## 7. Pre-Commit Quality Gate & Git Hook Verification

- [x] 7.1 Run `npm run type-check` (`vue-tsc`) to verify zero TypeScript errors
- [x] 7.2 Run `npm run lint` (`eslint . --fix`) to enforce code formatting
- [x] 7.3 Run `npm run test:coverage` to confirm all unit tests pass with $\ge 80\%$ coverage
- [x] 7.4 Run `npm run build-only` to ensure production Vite build passes
- [x] 7.5 Commit changes referencing Redmine Issue `#485023` (`git commit -m "... refs #485023"`)
