"""
Rate limiting middleware for API requests.
Implements token bucket algorithm with Redis backend.
"""

import time
from typing import Callable, Optional, Tuple

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from config.settings import settings


class InMemoryRateLimiter:
    """In-memory rate limiter using token bucket algorithm."""
    
    def __init__(self):
        self.buckets: dict[str, dict] = {}
    
    def _get_bucket(self, key: str) -> dict:
        """Get or create a bucket for a key."""
        now = time.time()
        if key not in self.buckets:
            self.buckets[key] = {
                "tokens": settings.RATE_LIMIT_PER_MINUTE,
                "last_update": now
            }
        return self.buckets[key]
    
    def _refill_bucket(self, bucket: dict) -> None:
        """Refill tokens based on time passed."""
        now = time.time()
        time_passed = now - bucket["last_update"]
        # Refill at rate of RATE_LIMIT_PER_MINUTE tokens per minute
        tokens_to_add = time_passed * (settings.RATE_LIMIT_PER_MINUTE / 60)
        bucket["tokens"] = min(
            settings.RATE_LIMIT_PER_MINUTE,
            bucket["tokens"] + tokens_to_add
        )
        bucket["last_update"] = now
    
    def is_allowed(self, key: str, cost: int = 1) -> Tuple[bool, int, int]:
        """
        Check if request is allowed and consume tokens.
        
        Returns:
            Tuple of (is_allowed, remaining_tokens, retry_after_seconds)
        """
        bucket = self._get_bucket(key)
        self._refill_bucket(bucket)
        
        if bucket["tokens"] >= cost:
            bucket["tokens"] -= cost
            return True, int(bucket["tokens"]), 0
        else:
            # Calculate when tokens will be available
            tokens_needed = cost - bucket["tokens"]
            retry_after = int(tokens_needed * 60 / settings.RATE_LIMIT_PER_MINUTE) + 1
            return False, 0, retry_after


# Global rate limiter instance
rate_limiter = InMemoryRateLimiter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for rate limiting API requests."""
    
    # Endpoints that don't require rate limiting
    EXEMPT_PATHS = {
        "/",
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json",
    }
    
    # Cost multipliers for different endpoints
    ENDPOINT_COSTS = {
        "/api/v1/analyze/video": 5,  # Video analysis is more expensive
        "/api/v1/analyze/batch": 10,  # Batch is most expensive
        "/api/v1/analyze/image": 2,  # Image analysis
        "/api/v1/analyze/url": 2,
    }
    
    def _get_client_key(self, request: Request) -> str:
        """Get unique identifier for the client."""
        # Try to get API key from header
        api_key = request.headers.get(settings.API_KEY_HEADER)
        if api_key:
            return f"api_key:{api_key}"
        
        # Fall back to IP address
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Get the first IP in the chain
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        
        return f"ip:{client_ip}"
    
    def _get_cost(self, path: str) -> int:
        """Get the cost for a specific endpoint."""
        for endpoint, cost in self.ENDPOINT_COSTS.items():
            if path.startswith(endpoint):
                return cost
        return 1
    
    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """Process the request with rate limiting."""
        path = request.url.path
        
        # Skip rate limiting for exempt paths
        if path in self.EXEMPT_PATHS:
            return await call_next(request)
        
        # Get client identifier and cost
        client_key = self._get_client_key(request)
        cost = self._get_cost(path)
        
        # Check rate limit
        is_allowed, remaining, retry_after = rate_limiter.is_allowed(
            client_key, cost
        )
        
        if not is_allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "rate_limit_exceeded",
                    "message": "Too many requests. Please try again later.",
                    "retry_after": retry_after,
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(settings.RATE_LIMIT_PER_MINUTE),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time()) + retry_after),
                },
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_PER_MINUTE)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(
            int(time.time()) + 60  # Reset in 1 minute
        )
        
        return response
