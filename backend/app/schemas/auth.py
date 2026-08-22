"""Pydantic schemas for authentication request and response models."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.constants.enums import UserRole


class LoginRequest(BaseModel):
    """Login request payload."""

    email: EmailStr = Field(
        ...,
        description="Admin user email address",
        examples=["admin@pureluxe.com"],
    )
    password: str = Field(
        ...,
        min_length=1,
        description="Admin user password",
        examples=["SecurePass123!"],
    )


class TokenResponse(BaseModel):
    """Token response returned on successful authentication."""

    access_token: str = Field(
        ...,
        description="JWT access token (expires in 30 minutes)",
    )
    refresh_token: str = Field(
        ...,
        description="JWT refresh token (expires in 7 days)",
    )
    token_type: str = Field(
        default="bearer",
        description="Token type for Authorization header",
    )


class LoginResponse(TokenResponse):
    """Login response with user details and tokens."""

    user: "CurrentUserResponse"


class RefreshRequest(BaseModel):
    """Refresh token request payload."""

    refresh_token: str = Field(
        ...,
        description="Valid refresh token to exchange for new tokens",
    )


class CurrentUserResponse(BaseModel):
    """Current authenticated user details."""

    id: str = Field(..., description="User UUID")
    name: str = Field(..., description="User full name")
    email: str = Field(..., description="User email address")
    role: UserRole = Field(..., description="User role")
    is_active: bool = Field(..., description="Whether the user account is active")
    last_login: Optional[datetime] = Field(
        None,
        description="Timestamp of last login",
    )
    created_at: datetime = Field(..., description="Account creation timestamp")

    model_config = {"from_attributes": True}


class ChangePasswordRequest(BaseModel):
    """Change password request payload."""

    current_password: str = Field(
        ...,
        min_length=1,
        description="Current password for verification",
    )
    new_password: str = Field(
        ...,
        min_length=8,
        description="New password meeting strength requirements",
        examples=["NewSecurePass123!"],
    )


class ForgotPasswordRequest(BaseModel):
    """Forgot password request payload."""

    email: EmailStr = Field(
        ...,
        description="Email address to send reset instructions",
    )


class ResetPasswordRequest(BaseModel):
    """Reset password request payload."""

    token: str = Field(
        ...,
        description="Password reset token",
    )
    new_password: str = Field(
        ...,
        min_length=8,
        description="New password meeting strength requirements",
        examples=["NewSecurePass123!"],
    )