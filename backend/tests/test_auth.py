"""Authentication and authorization test suite.

Tests cover login, token refresh, logout, current user retrieval,
password management, and role-based access control.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
)
from app.models.admin_user import AdminUser


@pytest_asyncio.fixture
async def test_user(test_session) -> AdminUser:
    """Create a test admin user for authentication tests."""
    user = AdminUser(
        name="Test Admin",
        email="admin@test.com",
        password_hash=hash_password("TestPass123!"),
        role="admin",
        is_active=True,
    )
    test_session.add(user)
    await test_session.flush()
    await test_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_editor_user(test_session) -> AdminUser:
    """Create a test editor user for role-based tests."""
    user = AdminUser(
        name="Test Editor",
        email="editor@test.com",
        password_hash=hash_password("TestPass123!"),
        role="editor",
        is_active=True,
    )
    test_session.add(user)
    await test_session.flush()
    await test_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def inactive_user(test_session) -> AdminUser:
    """Create an inactive user for testing inactive account handling."""
    user = AdminUser(
        name="Inactive User",
        email="inactive@test.com",
        password_hash=hash_password("TestPass123!"),
        role="editor",
        is_active=False,
    )
    test_session.add(user)
    await test_session.flush()
    await test_session.refresh(user)
    return user


@pytest.mark.asyncio
async def test_login_success(
    async_client: AsyncClient,
    test_user: AdminUser,
) -> None:
    """Test successful login returns tokens and user details."""
    response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        json={"email": "admin@test.com", "password": "TestPass123!"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@test.com"
    assert data["user"]["name"] == "Test Admin"
    assert data["user"]["role"] == "admin"
    assert data["user"]["is_active"] is True
    assert "id" in data["user"]


@pytest.mark.asyncio
async def test_login_invalid_email(async_client: AsyncClient) -> None:
    """Test login with a non-existent email returns 401."""
    response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        json={"email": "nonexistent@test.com", "password": "TestPass123!"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_login_invalid_password(
    async_client: AsyncClient,
    test_user: AdminUser,
) -> None:
    """Test login with wrong password returns 401."""
    response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        json={"email": "admin@test.com", "password": "WrongPass123!"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_login_inactive_user(
    async_client: AsyncClient,
    inactive_user: AdminUser,
) -> None:
    """Test login with an inactive user returns 403."""
    response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        json={"email": "inactive@test.com", "password": "TestPass123!"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "User account is inactive"


@pytest.mark.asyncio
async def test_refresh_token_success(
    async_client: AsyncClient,
    test_user: AdminUser,
) -> None:
    """Test successful token refresh returns new tokens."""
    # First login to get tokens
    login_response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        json={"email": "admin@test.com", "password": "TestPass123!"},
    )
    login_data = login_response.json()
    refresh_token = login_data["refresh_token"]

    # Now refresh
    response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/refresh",
        json={"refresh_token": refresh_token},
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    # Verify we got new tokens
    assert data["access_token"] != login_data["access_token"]
    assert data["user"]["email"] == "admin@test.com"


@pytest.mark.asyncio
async def test_refresh_token_invalid(async_client: AsyncClient) -> None:
    """Test refresh with an invalid token returns 401."""
    response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/refresh",
        json={"refresh_token": "invalid_token_here"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or malformed token"


@pytest.mark.asyncio
async def test_logout(async_client: AsyncClient, test_user: AdminUser) -> None:
    """Test logout blacklists the access token."""
    # Login first
    login_response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        json={"email": "admin@test.com", "password": "TestPass123!"},
    )
    access_token = login_response.json()["access_token"]
    refresh_token = login_response.json()["refresh_token"]

    # Logout
    response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/logout",
        json={"refresh_token": refresh_token},
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Logout successful"

    # Verify token is blacklisted
    me_response = await async_client.get(
        f"{settings.API_V1_PREFIX}/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user(
    async_client: AsyncClient,
    test_user: AdminUser,
) -> None:
    """Test retrieving the current authenticated user."""
    login_response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        json={"email": "admin@test.com", "password": "TestPass123!"},
    )
    access_token = login_response.json()["access_token"]

    response = await async_client.get(
        f"{settings.API_V1_PREFIX}/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@test.com"
    assert data["name"] == "Test Admin"
    assert data["role"] == "admin"


@pytest.mark.asyncio
async def test_get_current_user_no_token(async_client: AsyncClient) -> None:
    """Test accessing /me without a token returns 401."""
    response = await async_client.get(f"{settings.API_V1_PREFIX}/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_change_password_success(
    async_client: AsyncClient,
    test_user: AdminUser,
) -> None:
    """Test changing password with correct current password."""
    login_response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        json={"email": "admin@test.com", "password": "TestPass123!"},
    )
    access_token = login_response.json()["access_token"]

    response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/change-password",
        json={
            "current_password": "TestPass123!",
            "new_password": "NewSecurePass456!",
        },
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Password changed successfully"

    # Verify we can login with the new password
    login_new = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        json={"email": "admin@test.com", "password": "NewSecurePass456!"},
    )
    assert login_new.status_code == 200


@pytest.mark.asyncio
async def test_change_password_wrong_current(
    async_client: AsyncClient,
    test_user: AdminUser,
) -> None:
    """Test changing password with wrong current password returns 401."""
    login_response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        json={"email": "admin@test.com", "password": "TestPass123!"},
    )
    access_token = login_response.json()["access_token"]

    response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/change-password",
        json={
            "current_password": "WrongPassword!",
            "new_password": "NewSecurePass456!",
        },
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_change_password_weak(
    async_client: AsyncClient,
    test_user: AdminUser,
) -> None:
    """Test changing to a weak password returns 422."""
    login_response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        json={"email": "admin@test.com", "password": "TestPass123!"},
    )
    access_token = login_response.json()["access_token"]

    response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/change-password",
        json={
            "current_password": "TestPass123!",
            "new_password": "weak",
        },
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_jwt_validation_invalid_token(async_client: AsyncClient) -> None:
    """Test that an invalid JWT token is rejected."""
    response = await async_client.get(
        f"{settings.API_V1_PREFIX}/auth/me",
        headers={"Authorization": "Bearer invalid.jwt.token"},
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_jwt_validation_expired_token(async_client: AsyncClient) -> None:
    """Test that an expired JWT token is rejected."""
    # Create a token that expired 1 hour ago
    expired_token = create_access_token(
        subject="test-user-id",
        expires_delta=timedelta(hours=-1),
    )

    response = await async_client.get(
        f"{settings.API_V1_PREFIX}/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_forgot_password(async_client: AsyncClient) -> None:
    """Test forgot password returns success message."""
    response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/forgot-password",
        json={"email": "admin@test.com"},
    )

    assert response.status_code == 200
    assert "message" in response.json()


@pytest.mark.asyncio
async def test_reset_password_weak(async_client: AsyncClient) -> None:
    """Test reset password with weak password returns 422."""
    response = await async_client.post(
        f"{settings.API_V1_PREFIX}/auth/reset-password",
        json={"token": "some-token", "new_password": "weak"},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_password_validation_strength() -> None:
    """Test password strength validation logic."""
    from app.core.security import validate_password_strength

    # Test valid password
    is_valid, msg = validate_password_strength("ValidPass123!")
    assert is_valid is True
    assert msg == ""

    # Test too short
    is_valid, msg = validate_password_strength("Sh1!")
    assert is_valid is False
    assert "8 characters" in msg

    # Test no uppercase
    is_valid, msg = validate_password_strength("alllowercase1!")
    assert is_valid is False
    assert "uppercase" in msg

    # Test no lowercase
    is_valid, msg = validate_password_strength("ALLUPPERCASE1!")
    assert is_valid is False
    assert "lowercase" in msg

    # Test no number
    is_valid, msg = validate_password_strength("NoDigitsHere!")
    assert is_valid is False
    assert "number" in msg

    # Test no special character
    is_valid, msg = validate_password_strength("NoSpecialChar1")
    assert is_valid is False
    assert "special character" in msg