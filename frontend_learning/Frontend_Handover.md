# CS LEARNING PLATFORM
# COMPLETE FRONTEND TECHNICAL DOCUMENTATION & AI HANDOVER

---

# 1. PROJECT README

## Project Description

A React 19 + TypeScript + Vite Single Page Application (SPA) built for a Computer Science Self-Learning Platform tailored for secondary school students in Cameroon.

## Technology Stack

- Framework: React 19
- Build Tool: Vite 6.x
- Language: TypeScript
- Styling: Tailwind CSS v4
- Routing: React Router v7
- State Management: React Context + Local State
- API Client: Native Fetch API (wrapped)
- Backend: FastAPI

## Installation

1. Clone the repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `VITE_API_BASE_URL=http://localhost:8000/api/v1`.
5. Run `npm run dev`.

## Documentation Index

- PROJECT_OVERVIEW.md
- FRONTEND_ARCHITECTURE.md
- PROJECT_STRUCTURE.md
- ROUTING_AND_NAVIGATION.md
- COMPONENT_DOCUMENTATION.md
- PAGE_DOCUMENTATION.md
- STATE_MANAGEMENT.md
- API_INTEGRATION.md
- AUTHENTICATION_AND_AUTHORIZATION.md
- DESIGN_SYSTEM.md
- USER_FLOWS.md
- FORMS_AND_VALIDATION.md
- ERROR_HANDLING.md
- ENVIRONMENT_CONFIGURATION.md
- DEPENDENCIES.md
- RESPONSIVE_DESIGN.md
- SECURITY_CONSIDERATIONS.md
- TESTING_AND_QUALITY.md
- IMPLEMENTATION_STATUS.md
- KNOWN_ISSUES_AND_TECHNICAL_DEBT.md
- DEVELOPMENT_GUIDE.md
- AI_HANDOVER_GUIDE.md

---

# 2. PROJECT OVERVIEW

## Purpose

The platform allows students to learn computer science independently through structured courses, videos, and assessments. It provides a dedicated workspace for teachers to author content and an administration panel for moderation.

## User Roles

1. Guest: Can browse the public course catalog and register.
2. Student: Can enroll in free courses, simulate payments for paid courses, watch videos, download PDFs, take quizzes, submit assignments, and earn certificates.
3. Teacher: Must be approved by an administrator. Can create courses, upload media, create assessments, and grade student submissions.
4. Administrator: Can manage users, approve instructor applications, moderate courses, and manage course categories.

## Application Boundaries

**Frontend responsibilities:**
- Rendering UI.
- Managing client-side routing.
- Handling local state.
- Enforcing UI guards.
- Formatting API responses.

**Backend responsibilities:**
- Authentication.
- Authorization.
- Data storage.
- Business logic.
- Grading.
- Progress calculation.
- Cloudinary integration.
- PDF certificate generation.

## Current Maturity

- Complete: Authentication, Public Catalog, Student Dashboard, Classroom, Teacher Authoring, Admin Moderation.
- Partial: Payment Mock Simulator, Video Tracking.
- Missing: In-app notifications UI, Public certificate verification page.
- Needs further testing: Student quiz-taking UI.

---

# 3. FRONTEND ARCHITECTURE

## Entry Point

1. `index.html` loads `src/main.tsx`.
2. `main.tsx` mounts `<App />` into the DOM.
3. `App.tsx` wraps the application in `<AppProviders>`.
4. AppProviders includes `<BrowserRouter>` and `<AuthProvider>`.
5. `AppRouter` in `src/app/router.tsx` handles route rendering.

## Component Architecture

The application follows a feature-based architecture.

- Pages (`src/features/*/pages`): Composed of layouts and reusable UI components.
- Layouts (`src/layouts`): Define structural shells such as Navbar, Sidebar, Topbar and Outlet.
- UI Components (`src/components/ui`): Reusable primitives such as Button, Input, Card, Badge and Modal.
- Feature Components (`src/features/*/components`): Domain-specific components such as CourseCard, VideoPlayer and LessonManager.

## Data Flow

Page Component → Custom Hook → Feature Service → Central API Client → FastAPI Backend.

## Lazy Loading

Routes are split using `React.lazy()` and wrapped in a `<Suspense>` boundary in `src/app/router.tsx`.

---

# 4. PROJECT STRUCTURE

## `src/app/`

- `router.tsx`: Central route definitions and role-based guards.
- `providers.tsx`: Composes BrowserRouter and AuthProvider.
- `guards/`: Contains AuthGuard, GuestGuard and RoleGuard.

## `src/components/`

- `ui/`: Button, Input, Modal, Badge and Textarea.
- `feedback/`: Loading, Error and Empty states.
- `navigation/`: DesktopSidebar, MobileBottomNav, Topbar and PublicNavbar.
- `common/`: PageHeader, Pagination and SearchBar.

## `src/features/`

Feature-sliced architecture. Each feature folder contains:

- `components/`: Feature-specific UI.
- `hooks/`: React hooks for state and API integration.
- `pages/`: Route-level components.
- `services/`: API call functions.
- `types.ts`: Feature-specific TypeScript interfaces.

## `src/services/`

- `api/client.ts`: Centralized fetch wrapper handling base URL, authentication headers, JSON serialization and error normalization.
- `storage/session.ts`: Manages sessionStorage for JWT.

## `src/contexts/`

- `AuthContext.tsx`: Provides current user state, login and logout functions globally.

---

# 5. ROUTING AND NAVIGATION

## Router

Configured in `src/app/router.tsx` using React Router v7.

## Route Guards

- GuestGuard: Redirects authenticated users away from `/login` and `/register`.
- AuthGuard: Ensures a user is logged in.
- RoleGuard: Ensures the user has the correct role.

## Route Inventory

| Path | Component | Access |
|---|---|---|
| `/` | HomePage | Public |
| `/courses` | CourseCatalog | Public |
| `/courses/:courseId` | CourseDetails | Public |
| `/login` | Login | Guest |
| `/register` | Register | Guest |
| `/student/dashboard` | StudentDashboard | Student |
| `/student/classroom/:courseId` | Classroom | Student |
| `/teacher/dashboard` | TeacherHome | Teacher |
| `/teacher/courses` | MyCourses | Teacher |
| `/teacher/courses/create` | CreateCourse | Teacher |
| `/teacher/courses/:courseId/edit` | EditCourse | Teacher |
| `/admin/dashboard` | AdminHome | Admin |
| `/admin/users` | AdminUsers | Admin |
| `/admin/courses` | AdminCourses | Admin |

## Navigation

- Public: Top horizontal navbar.
- Authenticated desktop: Persistent left sidebar.
- Authenticated mobile: Fixed bottom navigation.
- Mobile navigation includes a custom elevated center button for teachers.

---

# 6. COMPONENT DOCUMENTATION

## Shared UI Components

Located in `src/components/ui/`.

### Button.tsx
- Supports primary, secondary, ghost and danger variants.
- Supports small, medium and large sizes.
- Handles loading states.

### Input.tsx / Textarea.tsx
- Accessible form inputs.
- Support labels and error messages.

### Modal.tsx
- Portal-based modal.
- Supports backdrop click.
- Handles Escape key.

### Badge.tsx
- Status indicators.
- Supports success, warning, danger and neutral variants.

## Feature Components

### VideoPlayer.tsx

Location: `src/features/classroom/components/VideoPlayer.tsx`

Props:
- `videoId: string`
- `onComplete: () => void`

Behavior:
- Fetches a signed playback URL.
- Tracks playback time using a lastSaved ref.
- Sends progress to the backend every 10 seconds via onTimeUpdate.
- Updates backend video duration through onLoadedMetadata.
- Fires onComplete when playback ends.

### LessonManager.tsx

Location: `src/features/teacher/components/LessonManager.tsx`

Behavior:
- Accordion-style lesson list.
- Supports adding lessons, assignments and quizzes.
- Handles Cloudinary uploads directly through fetch.

### AssignmentSection.tsx

Location: `src/features/assignments/components/AssignmentSection.tsx`

Behavior:
- Lists lesson assignments.
- Provides text submission.
- Provides PDF file upload.

### QuizSection.tsx

Location: `src/features/quizzes/components/QuizSection.tsx`

Behavior:
- Lists quizzes.
- Provides radio and checkbox interfaces.
- Submits answers to the backend for grading.

---

# 7. PAGE DOCUMENTATION

## StudentDashboard.tsx

Role: Student.

API requests:
- `GET /enrolments/me`
- `GET /courses/{id}`
- `GET /progress/courses/{id}`

Features:
- Displays enrolled courses.
- Shows completed courses.
- Displays completed lessons.
- Shows a Continue Learning banner.

## Classroom.tsx

Role: Student.

API requests:
- `GET /courses/{id}/modules`
- `GET /lessons/{id}`
- `GET /resources/lessons/{id}`
- `GET /quizzes/lessons/{id}`
- `GET /assignments/lessons/{id}`

Features:
- Sidebar navigation of modules and lessons.
- VideoPlayer integration.
- PDF downloads.
- AssignmentSection.
- QuizSection.
- Mark as Complete button.

## EditCourse.tsx

Role: Teacher.

API requests:
- `GET /courses/mine`
- `GET /courses/{id}/modules`

Features:
- Allows adding modules.
- Expands modules to show LessonManager.

## AdminHome.tsx

Role: Administrator.

API request:
- `GET /admin/dashboard`

Features:
- Displays platform statistics.
- Shows users, courses and pending reviews.

---

# 8. STATE MANAGEMENT

## Global State

Managed through React Context.

### AuthContext

Stores:
- User object.
- isAuthenticated boolean.
- Role string.
- Login function.
- Logout function.

### Token Storage

JWT is stored in sessionStorage through `src/services/storage/session.ts`.

The session is cleared when the browser tab closes.

## Local State

- Form inputs are managed through local useState.
- Server data is stored in custom hooks.
- Example: useStudentDashboard holds courses and stats and refetches on mount.

## Server State

Data is fetched when components mount and stored in hook state.

No global caching library such as React Query is used.

---

# 9. API INTEGRATION

## Core Client

Location: `src/services/api/client.ts`.

Responsibilities:
- Automatically injects `Authorization: Bearer <token>`.
- Handles 204 No Content responses.
- Handles 401 Unauthorized responses.
- Clears the session.
- Triggers a global logout event.
- Normalizes API errors.

## Authentication Endpoints

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`

## Course Endpoints

- `GET /courses`
- `POST /courses`
- `GET /courses/mine`
- `POST /courses/{id}/modules`

## Video Endpoints

- `POST /videos/upload-signature`
- `POST /videos/confirm`
- `GET /videos/{id}/playback`
- `PUT /videos/{id}/progress`

## Assignment Endpoints

- `POST /assignments/upload-signature`
- `POST /assignments/{id}/submissions`

Submission payload:
- `text_submission`
- `file_public_id`

## Payment Endpoints

- `POST /payments`
- `POST /payments/{id}/verify`

Payment creation payload:
- `course_id`
- `provider`
- `phone_number`

## Known Backend Contract Quirks

### Cloudinary Uploads

The backend generates the signature.

The frontend must not include `public_id` in FormData unless it was signed.

PDF files must be uploaded using `/raw/upload`.

### Video Duration

The backend initially saves `duration_seconds: 0` if Cloudinary has not finished processing.

The frontend sends the browser's duration in the progress update to correct it.

---

# 10. AUTHENTICATION AND AUTHORIZATION

## Authentication Lifecycle

1. User submits email and password.
2. Frontend sends credentials to `POST /auth/login`.
3. Backend returns a JWT.
4. Token is saved in sessionStorage.
5. AuthContext retrieves the current user through `GET /auth/me`.
6. User state is populated.

## Authorization

- RoleGuard protects role-specific routes.
- Students access student routes.
- Teachers access teacher routes.
- Administrators access admin routes.

Frontend route guards are only for user experience. Backend authorization must validate every protected request.

## Teacher Approval

`user.instructor_status` can contain:

- pending
- approved
- rejected

Pending teachers see a warning banner and cannot create courses.

---

# 11. DESIGN SYSTEM

## Colors

Configured in `src/index.css` using Tailwind v4 `@theme`.

| Token | Value | Purpose |
|---|---|---|
| Forest | `#1f3d33` | Primary text and dark backgrounds |
| Accent | `#3ead2d` | CTAs and active states |
| White | `#ffffff` | Main backgrounds |
| Tint | `#f5f9f7` | Secondary backgrounds |

## Typography

- Font family: System sans-serif stack.
- Headings use text-forest.
- Body text uses text-ink-muted.

## Components

### Buttons
- Solid lime background with forest text for primary actions.
- Outline style for secondary actions.

### Cards
- White backgrounds.
- Subtle borders.
- Rounded corners using rounded-xl.

### Inputs
- Focus ring uses the accent color.

---

# 12. USER FLOWS

## Course Enrollment and Payment

Student views Course Details
→ Determines whether course is free or paid.

Free course:
1. Click Enrol.
2. Enrolment is processed.
3. Student is redirected to Classroom.

Paid course:
1. Click Buy.
2. Open Payment Checkout.
3. Select MTN or Orange.
4. Enter nine-digit phone number.
5. Send `POST /payments`.
6. Send `POST /payments/{id}/verify`.
7. If successful, refetch enrolments and grant classroom access.
8. If unsuccessful, display an error and allow retry.

## Video Watching Flow

1. Student opens a lesson.
2. VideoPlayer loads.
3. onLoadedMetadata updates backend duration.
4. Playback begins.
5. Every 10 seconds, playback progress is sent to the backend.
6. When playback ends, final position is sent.
7. Student clicks Mark as Complete.
8. Frontend sends `PUT /progress/lessons/{id}`.
9. Backend verifies that the video has been watched to at least 90%.
10. Backend returns success or a conflict response.

---

# 13. FORMS AND VALIDATION

## Authentication Forms

Location: `src/features/auth/pages/`.

Validation: `src/features/auth/validators.ts`.

Rules:
- Email must be valid.
- Password must be 10 to 128 characters.
- Full name must be 2 to 160 characters.

## Course Authoring

CreateCourse fields:
- Title.
- Description.
- Category (optional).
- Level.
- Price.

Backend requires a slug, which is automatically generated in the frontend using `generateSlug()`.

## Assessments

### QuizBuilder

Validates:
- Every question has a prompt.
- Every question has at least two choices.
- At least one correct answer exists.

### AssignmentSection

Requires either text submission or a file before submission.

---

# 14. ERROR HANDLING

## API Errors

The API client normalizes FastAPI errors, including string and array responses, into an ApiError.

## Custom Hooks

Catch ApiError and set a localized error string.

## UI

Displays:
- ErrorState.
- Generic red error text.
- Loading states.
- Empty states.

## Known Limitations

There is no global React ErrorBoundary.

A runtime error in a component can cause the application to display a blank screen.

HTTP 409 responses can contain messages such as:
- Pass the quiz.
- Video watched X seconds of Y seconds.

The frontend displays these messages.

---

# 15. ENVIRONMENT CONFIGURATION

## Environment Files

- `.env`: Ignored by Git.
- `.env.example`: Tracked configuration example.

## Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| VITE_API_BASE_URL | Backend API base URL | Yes |

Default:

`http://localhost:8000/api/v1`

Used in `src/config/env.ts` and the central API client.

---

# 16. DEPENDENCIES

## Runtime Dependencies

- react / react-dom 19.x: UI framework.
- react-router-dom 7.x: Routing.
- tailwindcss: Styling.
- @tailwindcss/vite: Vite styling integration.
- lucide-react: Icons.

Note: Custom SVGs are also used in `src/components/navigation/icons.tsx`.

## Development Dependencies

- TypeScript.
- Vite.
- ESLint.

Inspect package.json and the lockfile for the exact installed versions.

---

# 17. RESPONSIVE DESIGN

## Breakpoints

Standard Tailwind breakpoints:

- sm: 640px.
- md: 768px.
- lg: 1024px.

## Navigation

Mobile:
- `lg:hidden`.
- Fixed bottom navigation.

Desktop:
- `hidden lg:flex`.
- Persistent left sidebar.

## Course Grids

Use responsive layouts such as:

`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

## Sidebar

The desktop sidebar is replaced by mobile navigation on smaller screens.

---

# 18. SECURITY CONSIDERATIONS

## JWT Storage

JWT is stored in sessionStorage.

This reduces persistence after closing the tab but remains accessible to JavaScript and vulnerable to theft through successful XSS.

## XSS

React escapes content by default.

Avoid `dangerouslySetInnerHTML` unless content is safely sanitized.

## Authorization

RoleGuard is only a frontend navigation guard.

The backend must validate every request.

## File Uploads

Files are uploaded directly to Cloudinary.

The backend generates upload signatures and validates file metadata.

Never expose backend secrets or signing credentials in frontend environment variables.

---

# 19. TESTING AND QUALITY

## Automated Tests

The current documentation reports no automated tests implemented and an empty tests folder.

## Linting

ESLint is configured in:

`eslint.config.js`

## Type Checking

TypeScript compilation runs during:

`npm run build`

## Build Verification

The documented build command is:

`npm run build`

The reported build generated a static bundle in `dist/`.

The receiving developer should rerun all checks before making changes.

---

# 20. IMPLEMENTATION STATUS

| Feature | Status | Notes |
|---|---|---|
| Public Course Catalog | COMPLETE | Search and filtering |
| Authentication | COMPLETE | JWT and session persistence |
| Course Enrollment | COMPLETE | Free and paid flows |
| Payment Simulator | COMPLETE | MTN and Orange simulation |
| Classroom Video/PDF | COMPLETE | Progress tracking and downloads |
| Certificates | COMPLETE | Generation and Blob download |
| Teacher Authoring | COMPLETE | Modules, lessons, videos and PDFs |
| Teacher Grading | COMPLETE | Review and grading |
| Admin Moderation | COMPLETE | Teacher and course approval |
| Student Quiz UI | PARTIAL | Answer-format edge cases |
| Notifications UI | MISSING | No frontend interface |

---

# 21. KNOWN ISSUES AND TECHNICAL DEBT

## 1. Cloudinary Video Processing

Videos may upload with `duration_seconds: 0`.

Mitigation: `onLoadedMetadata` in VideoPlayer.tsx sends the actual browser duration to the backend.

## 2. Quiz Answer Format

Frontend sends choice indices such as 0, 1 and 2 as `correct_answers`.

If the backend expects choice values instead, grading can fail.

## 3. No Error Boundary

A runtime error in a React component may cause a blank screen.

## 4. Certificate Download

Uses a manual Blob fetch to avoid authentication issues with ordinary anchor links.

## 5. Assignment Upload

PDF uploads require Cloudinary `/raw/upload` and a `public_id` ending in `.pdf` before backend validation.

---

# 22. DEVELOPMENT GUIDE

## Adding a New Page

1. Create the component in `src/features/<feature>/pages/NewPage.tsx`.
2. Add a route in `src/app/router.tsx` using React.lazy.
3. Apply the appropriate route guard.
4. Add it to `src/config/navigation.ts` if it requires a sidebar link.

## Adding an API Call

1. Add the API method in `src/features/<feature>/services/<feature>Service.ts`.
2. Use the existing central API client.
3. Create a hook in `src/features/<feature>/hooks/`.
4. Manage loading and error states.
5. Use the hook inside the page component.

## Styling

- Use Tailwind utility classes.
- Follow the forest and accent color tokens.
- Reuse Button and Input components.
- Avoid creating duplicate UI primitives.

---

# 23. AI HANDOVER GUIDE

## Project Introduction

You are taking over frontend development of the CS Learning Platform.

The application is built with React 19, TypeScript, Vite and Tailwind CSS.

It communicates with an independent FastAPI backend.

The platform supports:
- Students.
- Teachers.
- Administrators.

The application includes course discovery, enrollment, classroom learning, video playback, assignments, quizzes, payments simulation, teacher authoring and administrative moderation.

## Critical Entry Points

| Responsibility | File |
|---|---|
| Routing | `src/app/router.tsx` |
| Authentication State | `src/contexts/AuthContext.tsx` |
| API Client | `src/services/api/client.ts` |
| Styling Theme | `src/index.css` |
| Application Providers | `src/app/providers.tsx` |
| Session Storage | `src/services/storage/session.ts` |
| Navigation | `src/config/navigation.ts` |

## Golden Rules

1. Never trust frontend roles as a security mechanism. The backend must enforce authorization.
2. Cloudinary upload signatures must come from the backend.
3. Never append unsigned `public_id` values to Cloudinary FormData.
4. PDFs must use Cloudinary `/raw/upload`.
5. PDF public IDs must end in `.pdf` before backend confirmation.
6. VideoPlayer must send actual browser duration to the backend to correct the zero-duration issue.
7. The payment system must remain a simulator. Never integrate real MTN or Orange payment providers.
8. Preserve the existing API contracts.
9. Reuse existing components and hooks whenever possible.
10. Do not introduce duplicate implementations of existing functionality.

## Feature-to-File Reference

| Feature | File |
|---|---|
| Login Flow | `src/features/auth/hooks/useLogin.ts` |
| Payment Simulator | `src/features/payments/pages/PaymentCheckout.tsx` |
| Video Tracking | `src/features/classroom/components/VideoPlayer.tsx` |
| Teacher Grading | `src/features/teacher/pages/TeacherAssignments.tsx` |
| Admin Moderation | `src/features/admin/pages/AdminCourses.tsx` |
| Routing | `src/app/router.tsx` |
| Authentication | `src/contexts/AuthContext.tsx` |
| API Integration | `src/services/api/client.ts` |
| Design Tokens | `src/index.css` |

## Important Warnings

- The backend may have contract mismatches.
- Verify quiz answer formats before changing quiz functionality.
- Verify PDF upload behavior before modifying Cloudinary integration.
- Handle 401 responses correctly because sessionStorage is cleared globally.
- Preserve the video duration healing implementation.
- Verify all existing routes and components before replacing them.

## Development Rules for the Receiving AI

Before implementing any new feature:

1. Read this documentation.
2. Inspect the relevant source files.
3. Understand the current architecture.
4. Identify reusable components.
5. Check existing API service functions.
6. Verify the backend contract.
7. Plan the changes before editing.
8. Implement only the requested functionality.
9. Preserve unrelated working functionality.
10. Run TypeScript checks and production builds.
11. Report exactly which files were changed.
12. Document any remaining limitations.

**The actual source code is the final authority. If this documentation conflicts with the implementation, inspect the source code and update the documentation rather than blindly following outdated descriptions.**

---

# 24. FINAL DOCUMENTATION VERIFICATION

## Reported Directories and Files Inspected

- Root: package.json, vite.config.ts, index.html, .env.example.
- App: src/app/router.tsx, src/app/providers.tsx, src/app/guards/*.
- Services: src/services/api/client.ts, src/services/api/errorHandler.ts, src/services/storage/session.ts.
- Contexts: src/contexts/AuthContext.tsx.
- Styles: src/index.css.
- Features: auth, courses, enrolments, payments, classroom, assignments, quizzes, teacher, admin and student.

## Main Architectural Findings

- Feature-sliced architecture.
- React Router v7.
- Role-based route guards.
- Authentication through React Context.
- Local state for feature data.
- Centralized API client.
- Native Fetch API.

## Reported Implemented Features

- Authentication.
- Public course catalog.
- Course search and details.
- Free and paid enrollment.
- Mock payment simulator.
- Cloudinary media uploads.
- Video playback and progress tracking.
- PDF downloads.
- Assignments and quizzes.
- Teacher course authoring.
- Teacher grading.
- Admin moderation.

## Reported Missing Features

- Global React ErrorBoundary.
- Notifications UI.
- Public certificate verification page, reported as a stub.

## Reported Technical Issues

- Quiz answer format mismatch.
- Cloudinary raw upload metadata.
- Video duration synchronization.
- Missing global runtime error handling.

## Reported Verification Results

- `npm run build`: Reported successful.
- TypeScript compilation: Reported successful.

These results should be independently rerun before relying on them.

## Areas Not Verified

- Exact Pydantic schemas for AssignmentSubmit.
- Exact Pydantic schemas for QuizAttempt.
- Cloudinary folder structure.

---

# END OF FRONTEND TECHNICAL HANDOVER DOCUMENTATION

IMPORTANT: This document consolidates the supplied technical findings. It is not proof that all listed features or checks were independently verified. Always inspect the current frontend and backend source code before making implementation decisions.











new secion start


















# FRONTEND PROJECT FOLDER STRUCTURE AND ARCHITECTURE GUIDE

**Project:** Online Computer Science Learning Platform  
**Application directory:** `frontend_learning`  
**Purpose:** Technical reference for developers and AI coding assistants

---

# 1. PROJECT OVERVIEW

The frontend is organized as a React and TypeScript application using a feature-based architecture.

The source code is primarily located inside `src/`.

The project separates its responsibilities into:

- Application initialization and routing
- Authentication and access control
- Reusable UI components
- Feature-specific modules
- Application layouts
- API communication
- Shared hooks, types, and utilities
- Static assets and public resources
- Automated testing

The feature modules are organized around platform functionality, including authentication, courses, classroom learning, assignments, payments, quizzes, student activities, teacher activities, and administration.

The project contains **91 directories and 264 files**, according to the supplied directory tree.

# 2. ROOT DIRECTORY STRUCTURE

The following is the top-level structure of the frontend project:

    frontend_learning/
    ├── dist/
    ├── public/
    ├── src/
    ├── tests/
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vercel.json
    └── vite.config.ts

## 2.1 Root-level files and directories

| Path | Purpose |
|---|---|
| `dist/` | Production build output generated by the build process. |
| `public/` | Static files served directly by the frontend application. |
| `src/` | Main application source code. |
| `tests/` | Automated testing directory, currently containing E2E and integration folders. |
| `eslint.config.js` | ESLint configuration. |
| `index.html` | Main HTML entry point used by Vite. |
| `package.json` | Project metadata, dependencies, and npm scripts. |
| `package-lock.json` | Locked dependency versions. |
| `README.md` | Existing project documentation. |
| `tsconfig.app.json` | TypeScript configuration for application code. |
| `tsconfig.json` | Main TypeScript configuration. |
| `tsconfig.node.json` | TypeScript configuration for Node-related project files. |
| `vercel.json` | Vercel deployment configuration. |
| `vite.config.ts` | Vite development and build configuration. |

# 3. THE SRC DIRECTORY

The `src/` directory contains the main application implementation.

Its structure is:

    src/
    ├── app/
    ├── assets/
    ├── components/
    ├── config/
    ├── contexts/
    ├── features/
    ├── hooks/
    ├── layouts/
    ├── services/
    ├── types/
    ├── utils/
    ├── App.tsx
    ├── index.css
    └── main.tsx

Each directory has a different responsibility.

# 4. APPLICATION INITIALIZATION AND ROUTING

Location: `src/app/`

    app/
    ├── guards/
    │   ├── AuthGuard.tsx
    │   ├── GuestGuard.tsx
    │   └── RoleGuard.tsx
    ├── App.tsx
    ├── providers.tsx
    └── router.tsx

### App.tsx

Application-level component located inside the application configuration directory.

### providers.tsx

Central location for application providers.

The exact providers and their initialization order must be verified by inspecting the file.

### router.tsx

Contains the application's routing configuration.

Inspect this file when determining:

- Which routes exist
- Which components are assigned to routes
- Which layouts are used
- How nested routes are configured
- Which routes require authentication
- Which routes are restricted by role

### guards/

Contains route protection components.

| File | Apparent responsibility |
|---|---|
| `AuthGuard.tsx` | Protects routes requiring authentication. |
| `GuestGuard.tsx` | Handles routes intended for unauthenticated visitors. |
| `RoleGuard.tsx` | Restricts access based on user roles. |

These responsibilities are inferred from the filenames. Inspect the implementation before changing access-control behavior.

# 5. GLOBAL COMPONENTS

Location: `src/components/`

This directory contains reusable components shared across different application features.

    components/
    ├── common/
    ├── feedback/
    ├── navigation/
    └── ui/

## 5.1 common/

    common/
    ├── ComingSoon.tsx
    ├── PageHeader.tsx
    ├── Pagination.tsx
    └── SearchBar.tsx

Contains general-purpose components that can be reused across multiple pages.

- `ComingSoon.tsx`: Coming-soon interface.
- `PageHeader.tsx`: Reusable page header.
- `Pagination.tsx`: Pagination interface.
- `SearchBar.tsx`: Search input component.

## 5.2 feedback/

    feedback/
    ├── ConfirmDialog.tsx
    ├── EmptyState.tsx
    ├── ErrorState.tsx
    └── LoadingState.tsx

Contains components for communicating application states to users.

- `ConfirmDialog.tsx`: Confirmation dialog.
- `EmptyState.tsx`: Interface displayed when content is unavailable.
- `ErrorState.tsx`: Error presentation.
- `LoadingState.tsx`: Loading presentation.

## 5.3 navigation/

    navigation/
    ├── AnnouncementBar.tsx
    ├── DesktopSidebar.tsx
    ├── icons.tsx
    ├── MobileBottomNav.tsx
    ├── PublicNavbar.tsx
    └── Topbar.tsx

Contains shared navigation components.

- `AnnouncementBar.tsx`: Announcement interface.
- `DesktopSidebar.tsx`: Desktop sidebar navigation.
- `icons.tsx`: Navigation-related icons.
- `MobileBottomNav.tsx`: Mobile bottom navigation.
- `PublicNavbar.tsx`: Public-facing navigation bar.
- `Topbar.tsx`: Top navigation bar.

## 5.4 ui/

    ui/
    ├── Badge.tsx
    ├── Button.tsx
    ├── Card.tsx
    ├── Dropdown.tsx
    ├── Input.tsx
    ├── Modal.tsx
    ├── Select.tsx
    ├── Skeleton.tsx
    └── Textarea.tsx

Contains reusable interface primitives.

These components should be examined before creating new buttons, inputs, dropdowns, cards, modals, badges, or similar UI elements.

Prefer reusing existing components where their behavior and design meet the requirements.

# 6. CONFIGURATION

Location: `src/config/`

    config/
    ├── env.ts
    └── navigation.ts

### env.ts

Central configuration for environment-related values.

Inspect this file before changing API base URLs or other environment-dependent settings.

### navigation.ts

Contains navigation configuration.

Inspect it before modifying shared navigation items, navigation labels, icons, or role-specific navigation behavior.

# 7. GLOBAL CONTEXTS

Location: `src/contexts/`

    contexts/
    └── AuthContext.tsx

### AuthContext.tsx

Contains the authentication context.

This is an important file when investigating:

- Current user information
- Authentication state
- Login and logout behavior
- User session information
- Authentication-related shared state

Its exact implementation must be inspected before modifying authentication behavior.

# 8. FEATURE-BASED ARCHITECTURE

Location: `src/features/`

This is the largest functional section of the application.

Each feature groups related implementation files together.

A typical feature may contain:

- `components/`: Components specific to the feature.
- `hooks/`: Custom React hooks.
- `pages/`: Page-level components.
- `services/`: API communication and feature-related services.
- `types.ts`: Feature-specific TypeScript definitions.

Not every feature contains all these directories.

## 8.1 Admin feature

Location: `src/features/admin/`

    admin/
    ├── hooks/
    │   ├── useAdminDashboard.ts
    │   ├── useAdminUsers.ts
    │   ├── useCourseModeration.ts
    │   └── useInstructorApplications.ts
    ├── pages/
    │   ├── AdminAuditLogs.tsx
    │   ├── AdminCategories.tsx
    │   ├── AdminCourses.tsx
    │   ├── AdminDashboard.tsx
    │   ├── AdminHome.tsx
    │   ├── AdminInstructors.tsx
    │   ├── AdminMore.tsx
    │   ├── AdminProfile.tsx
    │   └── AdminUsers.tsx
    └── services/
        └── adminService.ts

Contains the administration-related implementation.

The filenames indicate functionality related to:

- Admin dashboard
- User management
- Course management
- Course moderation
- Category management
- Instructor applications
- Audit logs
- Admin profile

The `adminService.ts` file is the feature's service entry point.

## 8.2 Assignments feature

Location: `src/features/assignments/`

    assignments/
    ├── components/
    │   └── AssignmentSection.tsx
    ├── hooks/
    │   └── useLessonAssignments.ts
    ├── pages/
    │   └── AssignmentsPage.tsx
    ├── services/
    │   └── assignmentService.ts
    └── types.ts

Contains assignment-related functionality.

Its files include a page, assignment section component, custom hook, service, and TypeScript definitions.

## 8.3 Authentication feature

Location: `src/features/auth/`

    auth/
    ├── hooks/
    │   ├── useChangePassword.ts
    │   ├── useCurrentUser.ts
    │   ├── useForgotPassword.ts
    │   ├── useLogin.ts
    │   ├── useLogout.ts
    │   ├── useRegister.ts
    │   ├── useResetPassword.ts
    │   └── useTeacherRegister.ts
    ├── pages/
    │   ├── ChangePassword.tsx
    │   ├── ForgotPassword.tsx
    │   ├── Login.tsx
    │   ├── Register.tsx
    │   ├── ResetPassword.tsx
    │   └── TeacherRegister.tsx
    ├── services/
    │   └── authService.ts
    ├── types.ts
    └── validators.ts

Contains authentication-related pages and logic.

This feature includes:

- Login
- Registration
- Teacher registration
- Password changes
- Forgot password
- Password reset
- Current-user retrieval
- Login and logout hooks
- Authentication validation

When modifying authentication, inspect the relevant hook, service, context, route guard, and API client together.

## 8.4 Certificates feature

Location: `src/features/certificates/`

    certificates/
    ├── hooks/
    │   └── useCertificates.ts
    ├── pages/
    │   ├── CertificatesPage.tsx
    │   └── CertificateVerify.tsx
    ├── services/
    │   └── certificateService.ts
    └── types.ts

Contains certificate-related functionality.

The filenames indicate certificate retrieval, certificate display, and certificate verification.

## 8.5 Classroom feature

Location: `src/features/classroom/`

    classroom/
    ├── components/
    │   ├── CourseSidebar.tsx
    │   ├── LessonContent.tsx
    │   ├── LessonNavigation.tsx
    │   ├── PdfViewer.tsx
    │   └── VideoPlayer.tsx
    ├── hooks/
    │   ├── useCourseContent.ts
    │   ├── useLesson.ts
    │   └── useVideoPlayback.ts
    ├── pages/
    │   └── Classroom.tsx
    ├── services/
    │   └── classroomService.ts
    └── types.ts

Contains the learning classroom interface.

The file organization indicates support for:

- Course navigation
- Lesson content
- Lesson navigation
- PDF viewing
- Video playback
- Course content retrieval
- Lesson state and playback management

This feature should be inspected before changing how students access and navigate learning materials.

## 8.6 Courses feature

Location: `src/features/courses/`

    courses/
    ├── components/
    │   ├── CategoryFilter.tsx
    │   ├── CourseCardSkeleton.tsx
    │   └── CourseCard.tsx
    ├── hooks/
    │   ├── useCategories.ts
    │   ├── useCourseDetails.ts
    │   ├── useCourses.ts
    │   ├── useInstructorProfile.ts
    │   └── useLessonManager.ts
    ├── pages/
    │   ├── CourseCatalog.tsx
    │   ├── CourseDetails.tsx
    │   └── HomePage.tsx
    ├── services/
    │   └── courseService.ts
    └── types.ts

Contains course discovery and course-related functionality.

The filenames indicate:

- Course catalog
- Course details
- Homepage
- Course cards
- Category filtering
- Course retrieval
- Instructor profile retrieval
- Lesson management

## 8.7 Dashboard feature

Location: `src/features/dashboard/`

    dashboard/
    ├── admin/
    │   └── pages/
    │       └── AdminHome.tsx
    ├── student/
    │   └── pages/
    │       └── StudentDashboard.tsx
    └── teacher/
        └── pages/
            └── TeacherHome.tsx

Contains dashboard-related page components organized by user role.

The directory includes separate locations for admin, student, and teacher dashboards.

**Important:** Similar dashboard components also exist in other feature directories. Do not assume these files are interchangeable. Inspect the router and imports to establish which components are actively used.

## 8.8 Enrolments feature

Location: `src/features/enrolments/`

    enrolments/
    ├── hooks/
    │   ├── useEnrol.ts
    │   └── useMyEnrolments.ts
    ├── services/
    │   └── enrolmentService.ts
    └── types.ts

Contains enrolment-related hooks, service logic, and TypeScript definitions.

Inspect this feature when working on course enrolment and the retrieval of a student's enrolled courses.

## 8.9 Notifications feature

Location: `src/features/notifications/`

    notifications/
    └── types.ts

Currently, the supplied directory tree shows a TypeScript definitions file only.

Do not assume that a complete notification implementation exists based on this directory alone.

## 8.10 Payments feature

Location: `src/features/payments/`

    payments/
    ├── components/
    │   ├── PaymentForm.tsx
    │   ├── PaymentHistory.tsx
    │   ├── PaymentStatus.tsx
    │   └── SimulatorBanner.tsx
    ├── hooks/
    │   ├── useCreatePayment.ts
    │   ├── usePaymentHistory.ts
    │   └── useVerifyPayment.ts
    ├── pages/
    │   ├── PaymentCheckout.tsx
    │   └── PaymentHistory.tsx
    ├── services/
    │   └── paymentService.ts
    └── types.ts

Contains the payment-related frontend implementation.

The directory includes:

- Payment checkout
- Payment history
- Payment form
- Payment status
- Payment simulator banner
- Payment creation hook
- Payment verification hook
- Payment history hook
- Payment service
- Payment TypeScript definitions

### Important payment implementation constraint

This platform must use the backend payment simulator flow.

Do not introduce real MTN or Orange Money provider integrations.

The expected frontend payment sequence is:

1. Collect the course ID, selected provider, and phone number.
2. Create the payment through `POST /payments`.
3. Submit the returned payment ID to `POST /payments/{payment_id}/verify`.
4. Grant course access only when verification returns `succeeded`.

The payment creation payload must contain:

    {
      "course_id": "course_id",
      "provider": "mtn",
      "phone_number": "123456789"
    }

The provider must be either `mtn` or `orange`.

The phone number must contain exactly nine digits.

Do not send an amount in the payment creation request.

The interface must clearly identify the process as a payment simulation.

Inspect the payment service, hooks, types, and checkout page before modifying this flow.

## 8.11 Progress feature

Location: `src/features/progress/`

    progress/
    └── types.ts

The supplied directory tree shows a TypeScript definitions file.

Do not assume additional progress functionality exists without inspecting the actual implementation.

## 8.12 Quizzes feature

Location: `src/features/quizzes/`

    quizzes/
    ├── components/
    │   ├── LessonManager.tsx
    │   ├── QuizBuilder.tsx
    │   └── QuizSection.tsx
    ├── pages/
    │   └── QuizPage.tsx
    ├── services/
    │   └── quizService.ts
    └── types.ts

Contains quiz-related components, pages, services, and type definitions.

The filenames indicate functionality related to:

- Quiz creation
- Quiz presentation
- Quiz sections
- Lesson management
- Quiz API communication

## 8.13 Student feature

Location: `src/features/student/`

    student/
    ├── components/
    │   ├── ContinueLearningCard.tsx
    │   ├── MyCourseCard.tsx
    │   └── StatCard.tsx
    ├── hooks/
    │   ├── useProfile.ts
    │   └── useStudentDashboard.ts
    ├── pages/
    │   ├── StudentDashboard.tsx
    │   ├── StudentMyLearning.tsx
    │   ├── StudentProfile.tsx
    │   └── StudentProgress.tsx
    ├── services/
    │   └── userService.ts
    └── types.ts

Contains student-facing components and pages.

The directory includes:

- Student dashboard
- My learning page
- Student profile
- Student progress
- Continue learning card
- Course card
- Statistics card
- Student dashboard hook
- Profile hook
- User service

## 8.14 Teacher feature

Location: `src/features/teacher/`

    teacher/
    ├── components/
    │   ├── GradeSubmissionModal.tsx
    │   ├── LessonManager.tsx
    │   ├── QuizBuilder.tsx
    │   └── TeacherCourseCard.tsx
    ├── hooks/
    │   ├── GradeSubmissionModal.tsx
    │   ├── useCreateCourse.ts
    │   ├── useLessonManager.ts
    │   ├── useMyCourses.ts
    │   ├── useTeacherAssignments.ts
    │   └── useTeacherDashboard.ts
    ├── pages/
    │   ├── AdminMore.tsx
    │   ├── AdminProfile.tsx
    │   ├── CreateCourse.tsx
    │   ├── EditCourse.tsx
    │   ├── MyCourses.tsx
    │   ├── TeacherAnalytics.tsx
    │   ├── TeacherAssignments.tsx
    │   ├── TeacherDashboard.tsx
    │   ├── TeacherProfile.tsx
    │   └── TeacherStudents.tsx
    └── services/
        └── teacherService.ts

Contains teacher-related functionality.

The filenames indicate:

- Teacher dashboard
- Course creation
- Course editing
- Course management
- Teacher analytics
- Assignment management
- Student management
- Teacher profile
- Grading submissions
- Lesson management
- Quiz building

**Structural observation:** The `hooks/` directory contains a file named `GradeSubmissionModal.tsx`, while the `components/` directory contains a file with the same name. This is unusual and should be investigated before moving, deleting, or renaming either file.

The `pages/` directory also contains `AdminMore.tsx` and `AdminProfile.tsx`. Their placement should be verified against the router and imports.

## 8.15 User feature

Location: `src/features/user/`

    user/
    ├── hooks/
    │   └── useProfile.ts
    └── services/
        └── userService.ts

Contains user-related hook and service files.

There is also a `useProfile.ts` hook and a `userService.ts` file inside the student feature.

Do not assume they have identical responsibilities. Inspect their implementations and imports before consolidating them.

# 9. GLOBAL HOOKS

Location: `src/hooks/`

    hooks/
    ├── useDebounce.ts
    ├── useMediaQuery.ts
    └── usePagination.ts

Contains shared custom React hooks.

- `useDebounce.ts`: Reusable debouncing logic.
- `useMediaQuery.ts`: Media query-related logic.
- `usePagination.ts`: Reusable pagination logic.

These hooks should be considered before creating duplicate implementations inside individual pages.

# 10. APPLICATION LAYOUTS

Location: `src/layouts/`

    layouts/
    ├── AdminLayout.tsx
    ├── PublicLayout.tsx
    ├── StudentLayout.tsx
    └── TeacherLayout.tsx

Contains the main layout components.

| Layout | Intended area |
|---|---|
| `PublicLayout.tsx` | Public-facing pages. |
| `StudentLayout.tsx` | Student application area. |
| `TeacherLayout.tsx` | Teacher application area. |
| `AdminLayout.tsx` | Admin application area. |

Layouts generally provide shared page structure, navigation, and surrounding interface elements.

Inspect each layout before making changes to role-specific navigation or page structure.

# 11. GLOBAL SERVICES

Location: `src/services/`

    services/
    ├── api/
    │   ├── client.ts
    │   └── errorHandler.ts
    └── storage/
        └── session.ts

## 11.1 api/

Contains shared API communication infrastructure.

### client.ts

The central API client.

Inspect this file before:

- Changing the backend base URL.
- Modifying request behavior.
- Changing request headers.
- Modifying authentication handling.
- Changing response handling.
- Introducing a new API communication pattern.

### errorHandler.ts

Contains shared API error-handling logic.

Inspect it when changing how API errors are interpreted or displayed.

## 11.2 storage/

### session.ts

Contains session-related storage functionality.

Inspect this file before changing how authentication or session information is stored and retrieved.

# 12. GLOBAL TYPES

Location: `src/types/`

    types/
    ├── api.ts
    ├── common.ts
    └── user.ts

Contains shared TypeScript definitions.

- `api.ts`: API-related types.
- `common.ts`: Shared application types.
- `user.ts`: User-related types.

Feature-specific types should generally remain inside their corresponding feature unless they are genuinely shared across the application.

# 13. GLOBAL UTILITIES

Location: `src/utils/`

    utils/
    ├── fileValidation.ts
    ├── formatCurrency.ts
    ├── formatDate.ts
    └── validators.ts

Contains reusable utility functions.

- `fileValidation.ts`: File validation utilities.
- `formatCurrency.ts`: Currency formatting.
- `formatDate.ts`: Date formatting.
- `validators.ts`: General validation functions.

Inspect existing utilities before implementing similar functionality elsewhere.

# 14. ASSETS AND STYLING

## 14.1 Source assets

Location: `src/assets/`

    assets/
    ├── hero.png
    ├── react.svg
    └── vite.svg

Contains assets imported directly into application source files.

## 14.2 Global stylesheet

Location: `src/index.css`

Contains the application's global CSS entry point.

Inspect this file before changing:

- Global styles
- Tailwind integration
- CSS variables
- Global typography
- Base element styling
- Shared visual rules

## 14.3 Public assets

Location: `public/`

    public/
    ├── favicon.ico
    ├── favicon.jpeg
    ├── favicon.svg
    ├── icons/
    ├── icons.svg
    └── images/

Contains publicly accessible static assets.

The `icons/` and `images/` directories contain additional resources.

The exact files inside these directories were not expanded in the supplied tree.

# 15. APPLICATION ENTRY POINTS

Two important files exist at the root of `src/`.

### main.tsx

The main frontend entry point.

Inspect this file to understand how the React application is mounted.

### App.tsx

A root-level application component.

There is also an `App.tsx` inside `src/app/`.

These are separate files. Do not assume they are duplicates or that one is unused without inspecting their contents and import relationships.

# 16. TESTING STRUCTURE

Location: `tests/`

    tests/
    ├── e2e/
    └── integration/

The supplied tree shows two testing directories:

- `e2e/`: Intended for end-to-end tests.
- `integration/`: Intended for integration tests.

No test files were listed inside these directories in the supplied tree.

Do not assume the test suite is implemented or passing based only on the presence of these folders.

# 17. BUILD OUTPUT

Location: `dist/`

The `dist/` directory contains the generated production build.

Its structure includes:

    dist/
    ├── assets/
    ├── favicon.ico
    ├── favicon.jpeg
    ├── favicon.svg
    ├── icons/
    ├── icons.svg
    ├── images/
    └── index.html

The `dist/assets/` directory contains generated JavaScript and CSS bundles.

The filenames include compiled versions of application modules, pages, hooks, and services.

**Important development rule:**

Do not directly edit files inside `dist/`.

Make changes to the source files under `src/` and regenerate the build through the project's configured build command.

The `dist/` directory is generated output, not the primary source code.

# 18. HOW THE PROJECT STRUCTURE WORKS TOGETHER

The following is a conceptual representation of how the major directories relate.

    main.tsx
        |
        v
    App.tsx
        |
        v
    app/providers.tsx
        |
        v
    app/router.tsx
        |
        v
    Route Guards
        |
        v
    Application Layouts
        |
        v
    Feature Pages
        |
        v
    Feature Components and Hooks
        |
        v
    Feature Services
        |
        v
    Shared API Client
        |
        v
    Backend API

This is a conceptual architecture based on the directory organization. The actual execution sequence and dependencies must be confirmed by inspecting the relevant source files.

# 19. WHERE TO MAKE CHANGES

Use this table as a starting point when deciding where a change belongs.

| Requirement | Primary location to inspect |
|---|---|
| Login and registration | `features/auth/` |
| Authentication state | `contexts/AuthContext.tsx` |
| Route protection | `app/guards/` |
| Route configuration | `app/router.tsx` |
| Public homepage | `features/courses/pages/HomePage.tsx` |
| Course catalog | `features/courses/` |
| Course details | `features/courses/` |
| Classroom interface | `features/classroom/` |
| PDF and video viewing | `features/classroom/components/` |
| Assignments | `features/assignments/` |
| Quizzes | `features/quizzes/` |
| Payments | `features/payments/` |
| Student dashboard | `features/student/` |
| Student profile | `features/student/` |
| Teacher dashboard | `features/teacher/` |
| Course creation | `features/teacher/pages/` |
| Admin management | `features/admin/` |
| Shared navigation | `components/navigation/` |
| Reusable UI elements | `components/ui/` |
| Loading and error states | `components/feedback/` |
| Shared layouts | `layouts/` |
| API requests | `services/api/` |
| Session storage | `services/storage/` |
| Environment configuration | `config/env.ts` |
| Navigation configuration | `config/navigation.ts` |
| Shared types | `types/` |
| Shared utilities | `utils/` |
| Global styling | `index.css` |
| Application initialization | `main.tsx` and `App.tsx` |

This table identifies likely locations. Always inspect the relevant imports and actual implementation before editing.

# 20. IMPORTANT STRUCTURAL OBSERVATIONS

The supplied directory tree reveals several areas that should be investigated before making architectural changes.

## 20.1 Duplicate-looking components

The following filenames appear in more than one location:

- `App.tsx`
- `AdminHome.tsx`
- `StudentDashboard.tsx`
- `TeacherHome.tsx`
- `AdminMore.tsx`
- `AdminProfile.tsx`
- `LessonManager.tsx`
- `QuizBuilder.tsx`
- `GradeSubmissionModal.tsx`
- `useProfile.ts`
- `userService.ts`

Some may have different responsibilities despite sharing names.

Do not delete, move, merge, or rename these files without checking their imports, exports, and actual functionality.

## 20.2 Feature-specific versus global components

The project has both:

- Global components under `src/components/`
- Feature-specific components under `src/features/`

Use global components for genuinely reusable interface elements.

Keep components inside feature directories when their behavior and purpose are specific to that feature.

Avoid moving components simply to make the folder structure look more uniform.

## 20.3 Multiple dashboard locations

Dashboard-related components appear in:

- `features/dashboard/`
- `features/admin/`
- `features/student/`
- `features/teacher/`

The router should be checked to identify the components currently used by each dashboard route.

## 20.4 Multiple service locations

Services exist both globally and inside individual feature directories.

For example:

- `src/services/api/client.ts`
- `src/features/auth/services/authService.ts`
- `src/features/courses/services/courseService.ts`
- `src/features/payments/services/paymentService.ts`

This suggests a separation between shared API infrastructure and feature-specific API operations.

Preserve this separation unless there is a demonstrated architectural reason to change it.

## 20.5 Build artifacts

The `dist/` directory contains generated bundles.

When investigating application behavior, prioritize the source files under `src/` rather than treating compiled files as the authoritative implementation.

# 21. RULES FOR AI CODING ASSISTANTS

Any AI assistant working on this project must follow these rules.

### Rule 1: Inspect before modifying

Before changing a feature, inspect its existing page, components, hooks, services, and types.

Do not make assumptions based only on filenames.

### Rule 2: Follow the existing architecture

Place new files in the appropriate existing feature directory.

Do not introduce a completely different architecture without a clear reason.

### Rule 3: Reuse existing components

Before creating a new UI component, check:

- `src/components/ui/`
- `src/components/common/`
- `src/components/feedback/`
- The relevant feature's `components/` directory.

### Rule 4: Preserve existing integrations

Do not unnecessarily replace the API client, authentication context, session management, route guards, or existing service implementations.

### Rule 5: Maintain TypeScript consistency

Use the existing TypeScript types and feature-specific definitions.

Avoid introducing unnecessary `any` types or duplicating existing interfaces.

### Rule 6: Keep feature logic organized

Feature-specific functionality should remain within its relevant feature directory unless it is genuinely shared.

### Rule 7: Do not edit generated files

Never directly modify:

- `dist/`
- Generated JavaScript bundles
- Generated CSS bundles

Modify source files instead.

### Rule 8: Protect payment simulation requirements

Never replace the backend payment simulator with real payment-provider integrations.

Follow the existing payment contract and verification requirements.

### Rule 9: Investigate duplicate filenames

Do not assume similarly named files are duplicates.

Check their actual content and usage before changing them.

### Rule 10: Verify changes

After implementation, run the relevant project checks using the scripts defined in `package.json`.

Do not claim that tests or builds passed unless they were actually executed successfully.

# 22. RECOMMENDED INVESTIGATION ORDER FOR A NEW AI

When another AI assistant receives this documentation, it should investigate the frontend in the following order:

1. `package.json`: Understand dependencies and available scripts.
2. `src/main.tsx`: Understand the application entry point.
3. `src/App.tsx`: Understand the root application component.
4. `src/app/providers.tsx`: Understand application providers.
5. `src/app/router.tsx`: Understand routing.
6. `src/app/guards/`: Understand access control.
7. `src/contexts/AuthContext.tsx`: Understand authentication state.
8. `src/layouts/`: Understand role-specific layouts.
9. `src/services/api/`: Understand backend communication.
10. `src/services/storage/`: Understand session handling.
11. `src/features/`: Understand individual platform features.
12. `src/components/`: Understand reusable UI components.
13. `src/config/`: Understand application configuration.
14. `src/types/` and `src/utils/`: Understand shared definitions and utilities.
15. `src/index.css`: Understand global styling.
16. `tests/`: Determine the existing testing coverage.

This order provides a practical path from application initialization to individual feature implementation.

# 23. DOCUMENTATION LIMITATIONS

This document is based on the supplied directory tree.

It describes the observed directory and file organization and provides architectural interpretations based on filenames and placement.

It does not independently establish:

- The exact contents of each source file.
- Which components are actively rendered.
- Which files are unused.
- The exact dependency relationships.
- The actual API implementation.
- Whether every listed feature is fully functional.
- Whether automated tests exist beyond the visible directory structure.
- Whether the current project builds successfully.

An AI assistant must inspect source files before making claims about their implementation.

---

# FINAL HANDOVER INSTRUCTION

Use this document together with the frontend technical documentation.

The technical documentation explains the application's features, implementation details, workflows, and integrations.

This folder structure document explains where those implementations are organized and where future changes should be made.

Together, they should provide a starting point for understanding and maintaining the frontend without repeatedly rediscovering its organization.

**Most important instruction:** Never modify a file simply because its name appears relevant. First inspect its implementation, imports, dependencies, and relationship with the rest of the application.