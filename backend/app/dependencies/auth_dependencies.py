"""Authentication and authorization dependencies for route protection.

Provides reusable FastAPI dependencies for:
- Bearer token extraction and validation
- Current user retrieval
- Role-based access control
"""

from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.enums import UserRole
from app.core.database import get_db_session
from app.exceptions.auth_exceptions import (
    ForbiddenException,
    InactiveUserException,
    InvalidTokenException,
    UnauthorizedException,
)
from app.schemas.auth import CurrentUserResponse
from app.services.auth_service import AuthService

security_scheme = HTTPBearer(auto_error=False)


async def get_token_from_header(
    credentials: HTTPAuthorizationCredentials | None = Security(security_scheme),
) -> str:
    """Extract and validate the Bearer token from the Authorization header.

    Args:
        credentials: The HTTP Authorization header credentials.

    Returns:
        The JWT token string.

    Raises:
        UnauthorizedException: If no token is provided.
    """
    if credentials is None:
        raise UnauthorizedException()
    return credentials.credentials


async def get_current_user(
    token: str = Depends(get_token_from_header),
    session: AsyncSession = Depends(get_db_session),
) -> CurrentUserResponse:
    """Retrieve the current authenticated user from the JWT token.

    Args:
        token: The JWT access token from the Authorization header.
        session: The database session.

    Returns:
        The current user's profile information.

    Raises:
        InvalidTokenException: If the token is invalid.
        InactiveUserException: If the user account is inactive.
    """
    auth_service = AuthService(session)
    return await auth_service.get_current_user(token)


async def get_current_active_user(
    current_user: CurrentUserResponse = Depends(get_current_user),
) -> CurrentUserResponse:
    """Ensure the current user account is active.

    Args:
        current_user: The current authenticated user.

    Returns:
        The current user if their account is active.

    Raises:
        InactiveUserException: If the user account is inactive.
    """
    if not current_user.is_active:
        raise InactiveUserException()
    return current_user


def require_role(required_role: UserRole) -> Any:
    """Create a dependency that requires a minimum role level.

    Role hierarchy: SUPER_ADMIN > ADMIN > EDITOR

    Args:
        required_role: The minimum role required for access.

    Returns:
        A FastAPI dependency function that validates the user's role.

    Raises:
        ForbiddenException: If the user's role is insufficient.
    """
    role_hierarchy: dict[UserRole, int] = {
        UserRole.EDITOR: 1,
        UserRole.ADMIN: 2,
        UserRole.SUPER_ADMIN: 3,
    }

    async def role_checker(
        current_user: CurrentUserResponse = Depends(get_current_active_user),
    ) -> CurrentUserResponse:
        """Check if the current user has the required role level.

        Args:
            current_user: The current active user.

        Returns:
            The current user if they have sufficient permissions.

        Raises:
            ForbiddenException: If the user's role is insufficient.
        """
        user_role_level = role_hierarchy.get(current_user.role, 0)
        required_role_level = role_hierarchy.get(required_role, 0)

        if user_role_level < required_role_level:
            raise ForbiddenException()

        return current_user

    return role_checker


# Pre-built role dependencies for convenience
require_super_admin = require_role(UserRole.SUPER_ADMIN)
require_admin = require_role(UserRole.ADMIN)
require_editor = require_role(UserRole.EDITOR)