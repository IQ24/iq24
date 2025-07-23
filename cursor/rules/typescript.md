# TypeScript Cursor AI Rules

## Configuration

- Use TypeScript 5.x with strict mode enabled
- Configure path mapping for clean imports
- Use composite projects for monorepo structure
- Enable all strict type checking options
- Use ESLint with TypeScript rules

## Type Definitions

- Define interfaces for all data structures
- Use type unions for state management
- Implement proper generic constraints
- Use mapped types for transformations
- Define utility types for common patterns

## Code Organization

- Organize types in dedicated `.types.ts` files
- Use barrel exports for clean imports
- Group related types together
- Implement proper module boundaries
- Use namespace for complex type hierarchies

## Best Practices

- Use `const assertions` for immutable data
- Implement proper error handling with Result types
- Use discriminated unions for state management
- Implement proper async/await patterns
- Use type guards for runtime validation

## Common Patterns

```typescript
// Result type for error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Generic API response
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Event handler types
type EventHandler<T = Event> = (event: T) => void;

// Component props with children
interface ComponentProps extends React.PropsWithChildren {
  className?: string;
  variant?: 'primary' | 'secondary';
}
```

## Type Safety

- Use strict null checks
- Implement proper optional chaining
- Use type assertions sparingly
- Validate external data at boundaries
- Use branded types for domain modeling

## Performance

- Use type-only imports when possible
- Implement proper tree shaking
- Use declaration merging carefully
- Optimize compilation with project references
- Monitor type checking performance

## Testing

- Type test files with proper extensions
- Use type assertions in tests
- Implement mock types for testing
- Test type narrowing and guards
- Use utility types for test helpers