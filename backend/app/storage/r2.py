"""Cloudflare R2 storage provider (S3-compatible API)."""

from __future__ import annotations

import asyncio
import os
from typing import BinaryIO

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from loguru import logger

from app.core.config import settings
from app.storage.base import StorageProvider

# boto3 1.36+ sends CRC32 checksums that R2 rejects unless these are set.
os.environ.setdefault("AWS_REQUEST_CHECKSUM_CALCULATION", "when_required")
os.environ.setdefault("AWS_RESPONSE_CHECKSUM_VALIDATION", "when_required")


def _build_s3_config() -> Config:
    """Build a boto3 client config compatible with Cloudflare R2."""
    kwargs: dict = {"signature_version": "s3v4"}
    try:
        return Config(
            **kwargs,
            request_checksum_calculation="when_required",
            response_checksum_validation="when_required",
        )
    except TypeError:
        return Config(**kwargs)


class R2StorageProvider(StorageProvider):
    """Store media objects in a Cloudflare R2 bucket."""

    def __init__(self) -> None:
        self._bucket = settings.R2_BUCKET_NAME
        self._public_base_url = settings.R2_PUBLIC_BASE_URL.rstrip("/")
        self._client = boto3.client(
            "s3",
            endpoint_url=settings.r2_s3_endpoint,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name="auto",
            config=_build_s3_config(),
        )
        logger.info(
            "Cloudflare R2 storage ready (bucket={}, public={})",
            self._bucket,
            self._public_base_url,
        )

    async def save_file(
        self,
        file: BinaryIO,
        file_path: str,
        content_type: str | None = None,
    ) -> str:
        body = file.read()
        extra_args: dict[str, str] = {
            "CacheControl": "public, max-age=31536000, immutable",
        }
        if content_type:
            extra_args["ContentType"] = content_type

        await asyncio.to_thread(
            self._client.put_object,
            Bucket=self._bucket,
            Key=file_path,
            Body=body,
            **extra_args,
        )
        logger.info("File saved to R2: {}", file_path)
        return await self.generate_url(file_path)

    async def delete_file(self, file_path: str) -> bool:
        try:
            await asyncio.to_thread(
                self._client.delete_object,
                Bucket=self._bucket,
                Key=file_path,
            )
            logger.info("File deleted from R2: {}", file_path)
            return True
        except ClientError as exc:
            logger.warning("Failed to delete R2 object {}: {}", file_path, exc)
            return False

    async def move_file(self, source_path: str, dest_path: str) -> bool:
        try:
            await asyncio.to_thread(
                self._client.copy_object,
                Bucket=self._bucket,
                CopySource={"Bucket": self._bucket, "Key": source_path},
                Key=dest_path,
            )
            await asyncio.to_thread(
                self._client.delete_object,
                Bucket=self._bucket,
                Key=source_path,
            )
            logger.info("File moved in R2: {} -> {}", source_path, dest_path)
            return True
        except ClientError as exc:
            logger.warning(
                "Failed to move R2 object {} -> {}: {}",
                source_path,
                dest_path,
                exc,
            )
            return False

    async def file_exists(self, file_path: str) -> bool:
        try:
            await asyncio.to_thread(
                self._client.head_object,
                Bucket=self._bucket,
                Key=file_path,
            )
            return True
        except ClientError:
            return False

    async def generate_url(self, file_path: str) -> str:
        return f"{self._public_base_url}/{file_path.lstrip('/')}"

    async def generate_thumbnail(self, file_path: str) -> str | None:
        return None
