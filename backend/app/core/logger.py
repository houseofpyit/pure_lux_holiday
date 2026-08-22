from __future__ import annotations

import logging
import sys
from pathlib import Path

from loguru import logger

from app.core.config import settings


class InterceptHandler(logging.Handler):
    """Redirect standard Python logging to Loguru.

    This ensures all third-party library logs (e.g., uvicorn,
    sqlalchemy) are captured through Loguru's unified logging
    system with consistent formatting.
    """

    def emit(self, record: logging.LogRecord) -> None:
        """Forward a log record to Loguru."""
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno  # type: ignore[assignment]

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level,
            record.getMessage(),
        )


def setup_logging() -> None:
    """Configure Loguru logging for the application.

    Sets up console and file logging with structured formatting.
    File logs are written to the logs directory for persistence
    and debugging.
    """
    log_format: str = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )

    log_level: str = "DEBUG" if settings.DEBUG else "INFO"

    # Remove default handler
    logger.remove()

    # Console handler
    logger.add(
        sys.stdout,
        format=log_format,
        level=log_level,
        colorize=True,
        backtrace=settings.DEBUG,
        diagnose=settings.DEBUG,
    )

    # File handler
    log_path: Path = Path("logs")
    log_path.mkdir(parents=True, exist_ok=True)

    logger.add(
        log_path / "app_{time:YYYY-MM-DD}.log",
        format=log_format,
        level=log_level,
        rotation="1 day",
        retention="30 days",
        compression="gz",
        backtrace=True,
        diagnose=False,
        enqueue=True,
    )

    # Capture all standard library logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    # Configure specific loggers
    for logger_name in ("uvicorn", "uvicorn.access", "sqlalchemy.engine"):
        logging.getLogger(logger_name).handlers = [InterceptHandler()]
        logging.getLogger(logger_name).propagate = False

    logger.info("Logging system initialized at {} level", log_level)