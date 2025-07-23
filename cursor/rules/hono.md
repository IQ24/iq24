# Hono.js Cursor AI Rules

## Framework Setup

- Use Hono.js for lightweight API development
- Implement proper TypeScript configuration
- Use proper middleware patterns
- Implement proper error handling
- Use environment-specific configurations

## API Structure

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { validator } from 'hono/validator';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Route handlers
app.get('/api/health', (c) => {
  return c.json({ status: 'healthy' });
});

app.post('/api/users', validator('json', (value, c) => {
  // Validation logic
  return value;
}), async (c) => {
  const data = await c.req.json();
  // Handle user creation
  return c.json({ success: true });
});
```

## Middleware

- Use built-in middleware when possible
- Implement custom middleware for specific needs
- Use proper error handling middleware
- Implement authentication middleware
- Use logging middleware for debugging

## Validation

- Use Hono's validator middleware
- Implement proper input validation
- Use schema validation libraries
- Validate all user inputs
- Return proper error messages

## Error Handling

```typescript
import { HTTPException } from 'hono/http-exception';

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      { error: err.message },
      err.status
    );
  }
  
  console.error(err);
  return c.json(
    { error: 'Internal Server Error' },
    500
  );
});
```

## Authentication

- Implement JWT authentication
- Use proper session management
- Implement role-based access control
- Use secure cookie handling
- Implement proper logout

## Database Integration

- Use proper database connection pooling
- Implement proper transaction handling
- Use prepared statements
- Implement proper error handling
- Use database migrations

## Performance

- Use proper caching strategies
- Implement request optimization
- Use proper database indexes
- Monitor API performance
- Use compression middleware

## Security

- Implement proper CORS configuration
- Use HTTPS in production
- Validate all inputs
- Use proper authentication
- Implement rate limiting

## Testing

- Use testing frameworks like Vitest
- Test all API endpoints
- Test middleware functionality
- Test error handling
- Use proper mocking

## Deployment

- Use proper environment variables
- Implement proper logging
- Use proper monitoring
- Implement proper backup strategies
- Use proper CI/CD pipelines

## Best Practices

- Follow REST API conventions
- Use proper HTTP status codes
- Implement proper documentation
- Use proper versioning
- Monitor API usage