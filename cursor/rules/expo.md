# Expo Cursor AI Rules

## Project Setup

- Use Expo CLI for project management
- Configure app.json/app.config.js properly
- Use TypeScript for type safety
- Implement proper navigation structure
- Use Expo managed workflow when possible

## Navigation

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Components

- Use React Native components
- Implement proper styling with StyleSheet
- Use proper platform-specific code
- Implement proper accessibility
- Use proper performance optimization

## Styling

- Use StyleSheet for performance
- Implement responsive design
- Use proper color schemes
- Implement proper typography
- Use proper spacing and layout

## State Management

- Use React Context for global state
- Implement proper local state management
- Use AsyncStorage for persistence
- Implement proper data synchronization
- Use proper error handling

## API Integration

- Use proper HTTP client (axios/fetch)
- Implement proper error handling
- Use proper loading states
- Implement proper caching
- Use proper authentication

## Performance

- Use proper image optimization
- Implement proper list rendering
- Use proper memory management
- Monitor app performance
- Use proper bundle optimization

## Platform Specific Code

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
});
```

## Testing

- Use Jest for unit testing
- Use React Native Testing Library
- Test navigation flows
- Test API integration
- Use proper mocking

## Deployment

- Use EAS Build for builds
- Configure proper app store metadata
- Use proper versioning
- Implement proper CI/CD
- Use proper monitoring

## Security

- Use proper authentication
- Implement secure storage
- Use proper network security
- Validate all inputs
- Use proper permissions

## Best Practices

- Follow React Native conventions
- Use proper error boundaries
- Implement proper logging
- Use proper development workflow
- Monitor app crashes