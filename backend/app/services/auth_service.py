"""Authentication service containing all auth business logic."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.enums import UserRole
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    validate_password_strength,
    verify_password,
)
from app.exceptions.auth_exceptions import (
    ExpiredTokenException,
    InactiveUserException,
    InvalidCredentialsException,
    InvalidTokenException,
    PasswordValidationException,
)
from app.models.admin_user import AdminUser
from app.repositories.admin_user_repository import AdminUserRepository
from app.schemas.auth import (
    ChangePasswordRequest,
    CurrentUserResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    ResetPasswordRequest,
)
from app.services.token_blacklist_service import TokenBlacklistService


class AuthService:
    """Authentication service handling all auth-related business logic.

    Provides methods for login, token refresh, logout, password
    management, and user retrieval.
    """

    def __init__(self, session: AsyncSession) -> None:
        """Initialize the auth service with a database session.

        Args:
            session: The async database session.
        """
        self.repository = AdminUserRepository(session)
        self.blacklist_service = TokenBlacklistService()

    async def login(self, request: LoginRequest) -> LoginResponse:
        """Authenticate a user and return tokens with user details.

        Args:
            request: The login credentials (email and password).

        Returns:
            A LoginResponse containing tokens and user information.

        Raises:
            InvalidCredentialsException: If email or password is incorrect.
            InactiveUserException: If the user account is inactive.
        """
        user = await self.repository.get_by_email(request.email)

        if user is None or not verify_password(request.password, user.password_hash):
            raise InvalidCredentialsException()

        if not user.is_active:
            raise InactiveUserException()

        # Update last login timestamp
        await self.repository.update_last_login(user.id)

        # Generate tokens
        access_token = create_access_token(subject=str(user.id))
        refresh_token = create_refresh_token(subject=str(user.id))

        user_response = self._build_user_response(user)

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user_response,
        )

    async def refresh(self, request: RefreshRequest) -> LoginResponse:
        """Refresh an expired access token using a valid refresh token.

        Args:
            request: The refresh token payload.

        Returns:
            A new LoginResponse with fresh tokens and user details.

        Raises:
            InvalidTokenException: If the refresh token is invalid.
            ExpiredTokenException: If the refresh token has expired.
            InactiveUserException: If the user account is inactive.
        """
        payload = self._validate_token(request.refresh_token, expected_type="refresh")

        user = await self.repository.get_by_id(payload["sub"])
        if user is None:
            raise InvalidTokenException()

        if not user.is_active:
            raise InactiveUserException()

        # Generate new tokens
        access_token = create_access_token(subject=str(user.id))
        refresh_token = create_refresh_token(subject=str(user.id))

        user_response = self._build_user_response(user)

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=user_response,
        )

    async def logout(self, access_token: str, refresh_token: Optional[str] = None) -> None:
        """Logout a user by blacklisting their tokens.

        Args:
            access_token: The access token to blacklist.
            refresh_token: Optional refresh token to also blacklist.
        """
        payload = decode_token(access_token)
        exp = payload.get("exp")
        if exp is not None:
            await self.blacklist_service.blacklist_token(access_token, exp)

        if refresh_token is not None:
            refresh_payload = decode_token(refresh_token)
            refresh_exp = refresh_payload.get("exp")
            if refresh_exp is not None:
                await self.blacklist_service.blacklist_token(refresh_token, refresh_exp)

    async def get_current_user(self, token: str) -> CurrentUserResponse:
        """Retrieve the currently authenticated user from a JWT token.

        Args:
            token: The JWT access token.

        Returns:
            The current user's profile information.

        Raises:
            InvalidTokenException: If the token is invalid or blacklisted.
            InactiveUserException: If the user account is inactive.
        """
        payload = self._validate_token(token, expected_type="access")

        # Check if token is blacklisted
        if await self.blacklist_service.is_blacklisted(token):
            raise InvalidTokenException()

        user = await self.repository.get_by_id(payload["sub"])
        if user is None:
            raise InvalidTokenException()

        if not user.is_active:
            raise InactiveUserException()

        return self._build_user_response(user)

    async def change_password(
        self,
        user_id: object,
        request: ChangePasswordRequest,
    ) -> None:
        """Change the password for an authenticated user.

        Args:
            user_id: The UUID of the user changing their password.
            request: The current and new password payload.

        Raises:
            InvalidCredentialsException: If the current password is incorrect.
            PasswordValidationException: If the new password is too weak.
        """
        user = await self.repository.get_by_id(user_id)
        if user is None:
            raise InvalidCredentialsException()

        if not verify_password(request.current_password, user.password_hash):
            raise InvalidCredentialsException()

        # Validate new password strength
        is_valid, error_message = validate_password_strength(request.new_password)
        if not is_valid:
            raise PasswordValidationException(error_message)

        # Update password
        user.password_hash = hash_password(request.new_password)
        await self.repository.session.flush()

    async def forgot_password(self, request: ForgotPasswordRequest) -> dict[str, str]:
        """Initiate the forgot password flow.

        This is a structural implementation. In production, this would
        send an email with a reset token.

        Args:
            request: The email address to send reset instructions to.

        Returns:
            A message indicating that reset instructions were sent.
        """
        user = await self.repository.get_by_email(request.email)

        # Always return success to avoid email enumeration
        if user is not None:
            # In production: generate reset token and send email
            pass  # Placeholder for email sending logic

        return {
            "message": (
                "If an account with that email exists, "
                "password reset instructions have been sent."
            ),
        }

    async def reset_password(self, request: ResetPasswordRequest) -> dict[str, str]:
        """Reset a password using a reset token.

        This is a structural implementation. In production, this would
        validate the reset token from the email link.

        Args:
            request: The reset token and new password.

        Returns:
            A message indicating the password was reset.

        Raises:
            PasswordValidationException: If the new password is too weak.
        """
        # Validate new password strength
        is_valid, error_message = validate_password_strength(request.new_password)
        if not is_valid:
            raise PasswordValidationException(error_message)

        # In production: validate reset token and find user
        # user = await self.repository.get_by_reset_token(request.token)
        # user.password_hash = hash_password(request.new_password)

        return {
            "message": "Password has been reset successfully.",
        }

    def _validate_token(
        self,
        token: str,
        expected_type: str,
    ) -> dict[str, Any]:
        """Validate a JWT token and verify its type.

        Args:
            token: The JWT token string.
            expected_type: The expected token type ("access" or "refresh").

        Returns:
            The decoded token payload.

        Raises:
            InvalidTokenException: If the token is invalid.
            ExpiredTokenException: If the token has expired.
        """
        try:
            payload = decode_token(token)
        except JWTError:
            raise InvalidTokenException()  # noqa: B904

        token_type = payload.get("type")
        if token_type != expected_type:
            raise InvalidTokenException()

        # Check expiration
        exp = payload.get("exp")
        if exp is not None and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
            raise ExpiredTokenException()

        return payload

    def _build_user_response(self, user: AdminUser) -> CurrentUserResponse:
        """Build a CurrentUserResponse from an AdminUser model instance.

        Args:
            user: The AdminUser model instance.

        Returns:
            A CurrentUserResponse with the user's details.
        """
        return CurrentUserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            last_login=user.last_login,
            created_at=user.created_at,
        )