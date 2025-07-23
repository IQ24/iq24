# React Cursor AI Rules

## Component Architecture

- Use functional components with hooks
- Implement proper component composition
- Use React.memo for performance optimization
- Implement proper error boundaries
- Use TypeScript for all components

## Hooks and State Management

- Use useState for local component state
- Use useEffect for side effects
- Implement custom hooks for reusable logic
- Use useCallback and useMemo for optimization
- Use useContext for global state when appropriate

## Component Patterns

```typescript
// Compound component pattern
const Modal = ({ children, onClose }: ModalProps) => {
  return (
    <div className="modal">
      {children}
    </div>
  );
};

Modal.Header = ({ children }: { children: React.ReactNode }) => (
  <div className="modal-header">{children}</div>
);

Modal.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="modal-body">{children}</div>
);

Modal.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="modal-footer">{children}</div>
);
```

## Props and TypeScript

- Define proper interfaces for component props
- Use React.PropsWithChildren for components with children
- Implement proper default props
- Use generic components when appropriate
- Type event handlers properly

## Performance Optimization

- Use React.memo for pure components
- Implement proper key props for lists
- Use lazy loading for code splitting
- Optimize re-renders with useCallback
- Use React DevTools for profiling

## Event Handling

- Use proper event handler patterns
- Implement proper form handling
- Use controlled components for forms
- Handle async operations properly
- Implement proper loading states

## Accessibility

- Use semantic HTML elements
- Implement proper ARIA attributes
- Use proper keyboard navigation
- Implement focus management
- Test with screen readers

## Testing

- Use React Testing Library
- Test component behavior, not implementation
- Use proper test utilities
- Mock external dependencies
- Test error boundaries

## Common Pitfalls to Avoid

- Don't mutate state directly
- Don't use array indices as keys
- Don't forget dependency arrays in useEffect
- Don't over-optimize with useMemo/useCallback
- Don't use inline objects as props

## Best Practices

- Keep components small and focused
- Use composition over inheritance
- Implement proper error handling
- Use consistent naming conventions
- Follow React patterns and conventions