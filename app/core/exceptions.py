class VaultFlowException(Exception):
    """Base exception for VaultFlow."""

    def __init__(
        self,
        message: str,
        status_code: int = 400,
    ):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class AuthenticationError(VaultFlowException):
    def __init__(self, message="Authentication failed"):
        super().__init__(
            message,
            status_code=401,
        )


class AuthorizationError(VaultFlowException):
    def __init__(self, message="Access denied"):
        super().__init__(
            message,
            status_code=403,
        )


class ValidationError(VaultFlowException):
    def __init__(self, message="Validation failed"):
        super().__init__(
            message,
            status_code=400,
        )


class ResourceNotFoundError(VaultFlowException):
    def __init__(self, message="Resource not found"):
        super().__init__(
            message,
            status_code=404,
        )


class VaultError(VaultFlowException):
    def __init__(self, message="Vault error"):
        super().__init__(
            message,
            status_code=400,
        )
