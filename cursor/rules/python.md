# Python Cursor AI Rules

## Language Version and Setup

- Use Python 3.11+ for optimal performance
- Use virtual environments (venv) for project isolation
- Follow PEP 8 style guidelines
- Use type hints throughout the codebase
- Implement proper docstring conventions (Google style)

## Project Structure

```
src/
├── __init__.py
├── main.py
├── models/
│   ├── __init__.py
│   └── user.py
├── services/
│   ├── __init__.py
│   └── ai_service.py
├── utils/
│   ├── __init__.py
│   └── helpers.py
└── tests/
    ├── __init__.py
    └── test_main.py
```

## AI/ML Specific Rules

- Use FastAPI for API development
- Implement proper async/await patterns
- Use Pydantic for data validation
- Implement proper error handling for AI operations
- Use structured logging for AI processing

## Dependencies

- Use requirements.txt or pyproject.toml
- Pin dependency versions
- Use virtual environments
- Implement proper dependency injection
- Use poetry for dependency management

## Code Quality

- Use black for code formatting
- Use flake8 for linting
- Use mypy for type checking
- Use isort for import sorting
- Use pre-commit hooks

## Error Handling

```python
from typing import Optional, Union
import logging

logger = logging.getLogger(__name__)

class AIProcessingError(Exception):
    """Custom exception for AI processing errors"""
    pass

def process_ai_request(data: dict) -> Union[dict, None]:
    try:
        # AI processing logic
        return result
    except Exception as e:
        logger.error(f"AI processing failed: {e}")
        raise AIProcessingError(f"Failed to process: {e}")
```

## Async Programming

- Use asyncio for concurrent operations
- Implement proper context managers
- Use async/await for I/O operations
- Handle cancellation properly
- Use connection pooling for databases

## Testing

- Use pytest for testing
- Implement proper test fixtures
- Use mocking for external dependencies
- Test async code properly
- Maintain high test coverage

## Performance

- Use caching for expensive operations
- Implement proper memory management
- Use generators for large datasets
- Profile code performance
- Use appropriate data structures

## Security

- Validate all inputs
- Use environment variables for secrets
- Implement proper authentication
- Use HTTPS for all communications
- Sanitize outputs properly

## AI/ML Best Practices

- Implement proper model versioning
- Use proper data preprocessing
- Implement model monitoring
- Handle model failures gracefully
- Use proper evaluation metrics