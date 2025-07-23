# Next.js Cursor AI Rules

## Framework and Architecture

- Use Next.js 15 with App Router (app directory structure)
- Implement TypeScript throughout the codebase
- Use Server Components by default, Client Components only when necessary
- Implement proper loading states and error boundaries
- Use Next.js built-in optimizations (Image, Font, etc.)

## File Structure

```
app/
├── (auth)/          # Route groups for authentication
├── (dashboard)/     # Protected dashboard routes
├── api/            # API routes
├── globals.css     # Global styles
├── layout.tsx      # Root layout
├── loading.tsx     # Loading UI
├── error.tsx       # Error handling
├── not-found.tsx   # 404 page
└── page.tsx        # Home page
```

## Components

- Create reusable components in `components/` directory
- Use functional components with hooks
- Implement proper TypeScript interfaces for props
- Use forwardRef for components that need ref forwarding
- Implement proper accessibility (ARIA attributes)

## Styling

- Use Tailwind CSS for styling
- Create custom CSS variables for theming
- Use CSS modules for component-specific styles when needed
- Implement responsive design (mobile-first)

## Data Fetching

- Use Server Components for initial data loading
- Implement proper loading states with Suspense
- Use React Query/SWR for client-side data fetching
- Cache API responses appropriately
- Handle errors gracefully

## State Management

- Use React Context for global state when needed
- Implement Zustand for complex state management
- Use local state (useState) for component-specific state
- Implement proper state persistence when required

## Performance

- Implement proper code splitting
- Use dynamic imports for heavy components
- Optimize images with Next.js Image component
- Implement proper caching strategies
- Monitor bundle size and performance metrics

## Security

- Implement proper authentication and authorization
- Use CSRF protection
- Sanitize user inputs
- Implement proper session management
- Use environment variables for sensitive data

## Testing

- Write unit tests with Jest and React Testing Library
- Implement integration tests for API routes
- Use Playwright for end-to-end testing
- Test accessibility with axe-core
- Maintain high test coverage

## Best Practices

- Follow Next.js conventions and best practices
- Use TypeScript strict mode
- Implement proper error handling
- Use semantic HTML elements
- Follow accessibility guidelines (WCAG)
- Implement proper SEO optimization

## Code Quality

- Use ESLint with Next.js configuration
- Format code with Prettier
- Use Husky for git hooks
- Implement proper commit message conventions
- Use TypeScript for type safety