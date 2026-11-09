from fastapi import APIRouter

from app.api.v1 import admin, assignments, auth, certificates, courses, enrolments, instructors, lessons, modules, payments, progress, quizzes, resources, teacher, users, videos

api_router = APIRouter()
for route in (auth.router, users.router, courses.router, modules.router, lessons.router, quizzes.router, assignments.router, enrolments.router, payments.router, certificates.router, admin.router, videos.router, instructors.router, progress.router, resources.router, teacher.router):
    api_router.include_router(route)
