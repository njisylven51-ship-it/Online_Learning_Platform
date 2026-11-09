import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, html: str) -> bool:
    if not settings.resend_api_key:
        logger.info("Email skipped because Resend is not configured (recipient=%s, subject=%s)", to, subject)
        return False
    try:
        import resend

        resend.api_key = settings.resend_api_key
        resend.Emails.send({"from": settings.email_from, "to": [to], "subject": subject, "html": html})
        return True
    except Exception:
        logger.exception("Resend delivery failed")
        return False
