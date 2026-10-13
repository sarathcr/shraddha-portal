# Capability: Profile Management Delta Specification

## ADDED Requirements

### Requirement: Remove Dummy Two-Factor Authentication

The Two-Factor Authentication card presenting unverified dummy status ("Enabled via Authenticator") MUST be removed from the Profile view.

#### Scenario: 2FA card is not rendered

- **WHEN** user visits the Profile view
- **THEN** the Security & Credentials section renders only the Password management card
- **AND** no Two-Factor Authentication card or placeholder elements exist in the DOM.

---

### Requirement: Avatar Profile Picture Upload

Users MUST be able to upload a custom profile picture with immediate visual feedback and client-side validation.

#### Scenario: Valid avatar image upload

- **GIVEN** user clicks the avatar upload trigger
- **WHEN** user selects a valid image file (`.png`, `.jpg`, `.jpeg`) with file size $\le$ 2MB
- **THEN** an instant preview of the uploaded image replaces the default initials badge
- **AND** a success toast notification informs the user that the image has been selected.

#### Scenario: Invalid file format rejection

- **WHEN** user attempts to upload a non-image file (e.g. `.pdf`, `.svg`, `.txt`)
- **THEN** the upload is rejected
- **AND** an error toast notifies the user: "Only PNG, JPG, or JPEG images are supported".

#### Scenario: File size exceeds 2MB limit

- **WHEN** user selects an image file larger than 2MB
- **THEN** the upload is rejected
- **AND** an error toast notifies the user: "Image size must be less than 2MB".

---

### Requirement: Personal Information & Date of Birth (DOB) Editing

Users MUST be able to view and edit their personal information, including Full Name, Phone Number, and Date of Birth.

#### Scenario: View Date of Birth

- **WHEN** user views the Personal Information card
- **THEN** a "Date of Birth" attribute card is displayed alongside Full Name, Email Address, Designation, and Phone Number.

#### Scenario: Edit personal details with DatePicker

- **GIVEN** user clicks "Edit Profile"
- **WHEN** the edit dialog appears
- **THEN** a PrimeVue `DatePicker` is presented for the Date of Birth field
- **AND** existing user details (Name, Email, Phone, DOB) are pre-populated.

#### Scenario: Save edited profile details

- **WHEN** user enters valid details and clicks "Save" in the dialog footer
- **THEN** the date is formatted using `formatDateForAPI`
- **AND** the profile view updates with the new information
- **AND** a success toast confirms: "Profile updated successfully".

---

### Requirement: Password Change Modal

Users MUST be able to update their password through a dedicated dialog with validation.

#### Scenario: Open password update dialog

- **WHEN** user clicks "Update" in the Password security card
- **THEN** a modal dialog opens with fields for Current Password, New Password, and Confirm New Password.

#### Scenario: Password mismatch validation

- **WHEN** user enters a New Password and a differing Confirm Password
- **THEN** a validation message indicates "Passwords must match"
- **AND** the submit action is disabled.

#### Scenario: Successful password change

- **WHEN** user provides valid matching passwords and clicks Save
- **THEN** the dialog closes
- **AND** a success toast confirms: "Password updated successfully".
