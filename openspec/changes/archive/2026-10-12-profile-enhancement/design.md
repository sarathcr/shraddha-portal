# Design: Profile Management & Enhancement

## Architectural Decisions & Component Strategy

### 1. View Structure & Component Composition

Rather than bloating `ProfileView.vue` with inline dialog templates, the profile module structure will be organized cleanly:

```text
src/modules/profile/
├── components/
│   ├── EditProfileDialog.vue     # Reuses Dialog & DialogFooter.vue
│   └── ChangePasswordDialog.vue  # Reuses Dialog & DialogFooter.vue
├── composables/
│   └── useProfile.ts             # Profile state, avatar handling, and form submission
└── views/
    └── ProfileView.vue           # Profile hero card & personal details grid
```

### 2. Reuse of Existing Codebase Assets

- **PrimeVue Components**:
  - `DatePicker` (`fluid`, `dateFormat="yy-mm-dd"`, maxDate set to today)
  - `Dialog` (header, modal, responsive width)
  - `Toast` for feedback notifications
  - `Tag` for designation badge
- **Custom Project Components**:
  - Reusing `src/components/DialogFooter.vue` for consistent modal footer buttons (`@save`, `@cancel`, loading state).
- **Date Handling**:
  - Reusing `formatDateForAPI` and `normalizeDOB` from `src/utils/dateUtils.ts`.
- **Validation**:
  - Lightweight Yup/Vee-Validate or standard reactive form validation matching project conventions.

### 3. Avatar Upload & Preview State

- Hidden `<input type="file" accept="image/png, image/jpeg" ref="avatarInputRef" />`.
- Hover overlay over the avatar badge with camera icon (`pi pi-camera`) and upload tooltip.
- Client-side validation:
  - MIME type check: `['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)`
  - Size check: `file.size <= 2 * 1024 * 1024` (2MB).
- Instant preview via `URL.createObjectURL(file)` with cleanup on component unmount.

### 4. Git & Pre-Commit Hook Compliance Strategy

Every modified file and new component must comply with `.husky/pre-commit`:

- Strict TypeScript types (zero `any`).
- ESLint and Prettier formatting verified via `npm run lint`.
- Unit tests created for `useProfile.ts` and dialog components to satisfy the repository's 80% coverage threshold (`npm run test:coverage`).
- Production build verified via `npm run build-only`.
