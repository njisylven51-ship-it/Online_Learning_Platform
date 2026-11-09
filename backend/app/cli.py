"""Administrative bootstrap commands; privileged account creation is never public."""
import argparse
from getpass import getpass

from sqlmodel import Session, select

from app.core.database import create_db_and_tables, engine
from app.core.security import hash_password
from app.models.user import User


def create_admin(email: str, full_name: str) -> None:
    password = getpass("Administrator password (minimum 10 characters): ")
    if len(password) < 10:
        raise SystemExit("Password must contain at least 10 characters")
    create_db_and_tables()
    normalized_email = email.strip().lower()
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == normalized_email)).first()
        if user:
            if user.role != "administrator":
                raise SystemExit("That email belongs to a non-administrator account; choose a different address")
            raise SystemExit("An administrator with that email already exists")
        session.add(User(email=normalized_email, full_name=full_name.strip(), password_hash=hash_password(password), role="administrator"))
        session.commit()
    print(f"Administrator created: {normalized_email}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    admin = subparsers.add_parser("create-admin")
    admin.add_argument("email")
    admin.add_argument("full_name")
    args = parser.parse_args()
    if args.command == "create-admin":
        create_admin(args.email, args.full_name)


if __name__ == "__main__":
    main()
