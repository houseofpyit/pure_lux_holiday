"""Authentication and authorization router.

Provides endpoints for user authentication, token management,
password management, and user profile retrieval.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, Depends, Query, Security, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.dependencies.auth_dependencies import (
    get_current_active_user,
    get_token_from_header,
    require_admin,
    require_super_admin,
)
from app.schemas.auth import (
    ChangePasswordRequest,
    CurrentUserResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user",
    description=(
        "Authenticate an admin user with email and password. "
        "Returns JWT access and refresh tokens along with user details."
    ),
    responses={
        200: {"description": "Login successful, tokens returned"},
        401: {"description": "Invalid credentials"},
        403: {"description": "User account is inactive"},
    },
)
async def login(
    request: LoginRequest,
    session: AsyncSession = Depends(get_db_session),
) -> LoginResponse:
    """Authenticate a user and return JWT tokens.

    Args:
        request: The login credentials (email and password).
        session: The database session.

    Returns:
        Login response with access token, refresh token, and user details.
    """
    auth_service = AuthService(session)
    return await auth_service.login(request)


@router.post(
    "/refresh",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description=(
        "Exchange a valid refresh token for a new set of "
        "access and refresh tokens."
    ),
    responses={
        200: {"description": "Tokens refreshed successfully"},
        401: {"description": "Invalid or expired refresh token"},
    },
)
async def refresh_token(
    request: RefreshRequest,
    session: AsyncSession = Depends(get_db_session),
) -> LoginResponse:
    """Refresh tokens using a valid refresh token.

    Args:
        request: The refresh token payload.
        session: The database session.

    Returns:
        New login response with fresh tokens and user details.
    """
    auth_service = AuthService(session)
    return await auth_service.refresh(request)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description=(
        "Logout the current user by blacklisting their access token. "
        "Optionally also blacklist the refresh token."
    ),
    responses={
        200: {"description": "Logout successful"},
        401: {"description": "Invalid or missing token"},
    },
)
async def logout(
    access_token: str = Depends(get_token_from_header),
    refresh_token: str | None = Body(
        default=None,
        description="Optional refresh token to also blacklist",
        embed=True,
    ),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    """Logout by blacklisting the current tokens.

    Args:
        access_token: The current access token from the Authorization header.
        refresh_token: Optional refresh token to also blacklist.
        session: The database session.

    Returns:
        A message confirming logout.
    """
    auth_service = AuthService(session)
    await auth_service.logout(access_token, refresh_token)
    return {"message": "Logout successful"}


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user",
    description=(
        "Retrieve the profile of the currently authenticated user. "
        "Requires a valid access token."
    ),
    responses={
        200: {"description": "Current user details returned"},
        401: {"description": "Not authenticated"},
        403: {"description": "User account is inactive"},
    },
)
async def get_me(
    current_user: CurrentUserResponse = Depends(get_current_active_user),
) -> CurrentUserResponse:
    """Return the current authenticated user's profile.

    Args:
        current_user: The current active user from the dependency.

    Returns:
        The current user's profile details.
    """
    return current_user


@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
    summary="Change password",
    description=(
        "Change the password for the currently authenticated user. "
        "Requires the current password and a new password meeting "
        "strength requirements."
    ),
    responses={
        200: {"description": "Password changed successfully"},
        401: {"description": "Current password is incorrect"},
        422: {"description": "New password does not meet requirements"},
    },
)
async def change_password(
    request: ChangePasswordRequest,
    current_user: CurrentUserResponse = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    """Change the password for the authenticated user.

    Args:
        request: The current and new password payload.
        current_user: The current active user.
        session: The database session.

    Returns:
        A message confirming the password change.
    """
    auth_service = AuthService(session)
    await auth_service.change_password(current_user.id, request)
    return {"message": "Password changed successfully"}


@router.post(
    "/forgot-password",
    status_code=status.HTTP_200_OK,
    summary="Request password reset",
    description=(
        "Request a password reset email. If the email exists in the "
        "system, reset instructions will be sent (structural implementation)."
    ),
    responses={
        200: {"description": "Reset instructions sent if email exists"},
    },
)
async def forgot_password(
    request: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    """Request password reset instructions.

    Args:
        request: The email address to send reset instructions to.
        session: The database session.

    Returns:
        A message indicating reset instructions were sent.
    """
    auth_service = AuthService(session)
    return await auth_service.forgot_password(request)


@router.post(
    "/reset-password",
    status_code=status.HTTP_200_OK,
    summary="Reset password",
    description=(
        "Reset a password using a reset token. "
        "This is a structural implementation."
    ),
    responses={
        200: {"description": "Password reset successfully"},
        422: {"description": "New password does not meet requirements"},
    },
)
async def reset_password(
    request: ResetPasswordRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    """Reset a password using a reset token.

    Args:
        request: The reset token and new password.
        session: The database session.

    Returns:
        A message confirming the password reset.
    """
    auth_service = AuthService(session)
    return await auth_service.reset_password(request)