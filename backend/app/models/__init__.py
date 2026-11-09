"""Database models. Importing this module registers all SQLModel tables."""
from app.models.user import User
from app.models.instructor import Instructor
from app.models.category import Category
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.resource import Resource
from app.models.video import Video, VideoProgress
from app.models.quiz import Quiz, Question, QuizAttempt
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.enrolment import Enrolment
from app.models.payment import Payment
from app.models.progress import Progress
from app.models.certificate import Certificate
from app.models.notification import Notification
from app.models.audit_log import AuditLog

__all__ = ["User", "Instructor", "Category", "Course", "Module", "Lesson", "Resource", "Video", "VideoProgress", "Quiz", "Question", "QuizAttempt", "Assignment", "AssignmentSubmission", "Enrolment", "Payment", "Progress", "Certificate", "Notification", "AuditLog"]
