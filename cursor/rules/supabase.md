# Supabase Cursor AI Rules

## Project Setup

- Use Supabase CLI for local development
- Configure environment variables properly
- Use row-level security (RLS) for all tables
- Implement proper database migrations
- Use TypeScript for type safety

## Database Design

- Use proper naming conventions (snake_case)
- Implement proper foreign key constraints
- Use indexes for performance optimization
- Implement proper triggers for auditing
- Use views for complex queries

## Authentication

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Authentication with proper error handling
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};
```

## Row Level Security (RLS)

- Enable RLS on all tables
- Create policies for different user roles
- Test policies thoroughly
- Use proper user context in policies
- Implement proper audit trails

## Real-time Subscriptions

- Use subscriptions for live updates
- Implement proper cleanup for subscriptions
- Handle connection errors gracefully
- Use filters to reduce unnecessary updates
- Implement proper error handling

## Edge Functions

- Use TypeScript for edge functions
- Implement proper error handling
- Use proper CORS configuration
- Test functions locally
- Monitor function performance

## Storage

- Use proper bucket policies
- Implement file upload validation
- Use proper file naming conventions
- Implement proper cleanup
- Monitor storage usage

## Performance

- Use proper indexes
- Implement query optimization
- Use connection pooling
- Monitor query performance
- Use proper caching strategies

## Security

- Use environment variables for secrets
- Implement proper input validation
- Use prepared statements
- Monitor for security issues
- Implement proper logging

## Testing

- Use Supabase test database
- Test RLS policies
- Test edge functions
- Test authentication flows
- Test real-time subscriptions

## Best Practices

- Follow Supabase conventions
- Use proper error handling
- Implement proper logging
- Monitor performance
- Use proper backup strategies