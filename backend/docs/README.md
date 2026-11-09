# Backend setup and technical notes

The backend is a FastAPI modular monolith. SQLModel connects to PostgreSQL using `DATABASE_URL`; on startup it creates missing tables with `SQLModel.metadata.create_all`. This does not alter existing table schemas. For development schema changes, back up data and recreate the local database or apply a reviewed SQL change manually. No Alembic migrations are used.

## Run locally

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Create PostgreSQL database `learning_platform` and set DATABASE_URL as needed.
python run.py
```

Open `/docs` for OpenAPI. Liveness is available at `/health`. All API routes use `/api/v1/`.

Public registration always creates a student. An administrator must provision the first administrator account directly in PostgreSQL; public registration cannot grant privileged roles. Students apply through `POST /api/v1/instructors/applications`; administrators review and approve applications before course authoring is enabled.

Use `python -m app.cli create-admin admin@example.com "Platform Administrator"` from the `backend/` directory to create the first administrator with a hidden interactive password prompt.

Protected lessons, resources, and videos require an active enrolment, except explicitly preview lessons in published courses. Teachers are restricted to their own courses. Administrator-only review and user management actions are recorded in audit logs where applicable.

## File uploads

Videos and resources are uploaded directly from a trusted client to Cloudinary using short-lived signed upload parameters from the backend, then confirmed with the backend. The backend verifies uploaded asset metadata through the Cloudinary API; video bytes are not buffered by FastAPI. Configure Cloudinary credentials before enabling upload signatures. For production, configure Cloudinary access controls and a private delivery policy before serving sensitive documents.

`CLOUDINARY_UPLOAD_FOLDER` is the shared root (default `learning-platform`). Upload destinations are selected server-side by purpose and owner: course thumbnails, profiles, lessons, resources, assignments, and videos each receive a fixed subfolder. The browser does not submit a folder path. `CLOUDINARY_FOLDER_MODE` defaults to `fixed` to preserve the current signed `folder` behavior. If the Cloudinary product environment uses Dynamic Folders, set it to `dynamic`; upload signatures then use `asset_folder` plus `public_id_prefix`, and confirmation checks both Cloudinary's returned `asset_folder` and the complete public ID. Dynamic Folder mode must be confirmed in the Cloudinary console; the application cannot infer an account-level setting from credentials alone.

## Payments and email

Resend delivery is optional; failures are logged and do not stop API requests. In `development` and `test`, `PAYMENT_MODE=mock` enables a deterministic simulator for both MTN and Orange selections. It accepts only `678241562`, `678241563`, `678241564`, and `678241565`; call `POST /api/v1/payments/{payment_id}/verify` to simulate verification. Accepted simulations are marked `is_simulated=true`; other numbers produce a failed payment and never enrol the student. This test endpoint is unavailable in production, and production startup rejects `PAYMENT_MODE=mock`.

Live MTN and Orange credentials still do not define the merchant collection product, authentication, or callback signature contract. The provider adapters therefore fail closed until those are configured; no unverified callback can activate an enrolment. Configure `PAYMENT_MODE=live` only with a completed provider adapter and merchant sandbox validation.

## Tests

Install the requirements, set `DATABASE_URL=sqlite:///./test.db` before importing the application, and run `pytest`. Tests should mock Cloudinary, Resend, and payment provider operations. PostgreSQL remains the production database.
