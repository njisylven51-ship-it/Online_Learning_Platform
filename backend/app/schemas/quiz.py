from uuid import UUID

from pydantic import BaseModel, Field


class QuestionCreate(BaseModel):
    prompt: str = Field(min_length=1)
    question_type: str = "single_choice"
    choices: list[str] = Field(min_length=2)
    correct_answers: list[int] = Field(min_length=1)
    points: float = Field(default=1, gt=0)
    position: int = 0


class QuizCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    passing_score: float = Field(default=60, ge=0, le=100)
    max_attempts: int = Field(default=3, ge=1)
    questions: list[QuestionCreate] = Field(min_length=1)


class QuizAnswer(BaseModel):
    answers: dict[UUID, list[int]]
