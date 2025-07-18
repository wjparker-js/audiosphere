# User Library Test Suite

This directory contains comprehensive tests for the User Library feature of AudioSphere.

## Test Structure

### Unit Tests
- **LibraryHeader.test.tsx**: Tests for the library header component including search functionality
- **LibraryFilters.test.tsx**: Tests for content type filtering system
- **ContentCard.test.tsx**: Tests for the unified content card component
- **useLibrary.test.ts**: Tests for the custom library hook and state management

### Integration Tests
- **library.test.ts**: API endpoint tests for library functionality

### End-to-End Tests
- **library.e2e.test.tsx**: Complete user journey tests simulating real user interactions

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Files
```bash
# Run only unit tests
npm test -- --testPathPattern="__tests__/library"

# Run only API tests
npm test -- --testPathPattern="api"

# Run only E2E tests
npm test -- --testPathPattern="e2e"
```

## Test Coverage Requirements

The test suite maintains a minimum of 80% coverage across:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Scenarios Covered

### Core Functionality
- ✅ Library data fetching and display
- ✅ Content type filtering (All, Albums, Playlists, Blog Posts)
- ✅ Search functionality with debouncing
- ✅ Sorting by date, title, type, and last modified
- ✅ View mode switching (grid/list)
- ✅ Content selection and bulk actions

### User Interactions
- ✅ Content card hover states and quick actions
- ✅ Context menu functionality (right-click)
- ✅ Confirmation dialogs for destructive actions
- ✅ Navigation to content detail pages
- ✅ Mobile touch interactions and gestures

### API Integration
- ✅ Library data API with filtering, sorting, and pagination
- ✅ Bulk actions API (delete, publish, unpublish)
- ✅ Individual content management APIs
- ✅ Error handling and validation

### Performance & Accessibility
- ✅ Performance monitoring and optimization
- ✅ Image lazy loading and caching
- ✅ Virtual scrolling for large collections
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation support

### Mobile Experience
- ✅ Responsive design across screen sizes
- ✅ Touch-friendly interactions (44px minimum targets)
- ✅ Mobile-specific context menus
- ✅ Pull-to-refresh functionality
- ✅ Swipe gestures for quick actions

### Error Handling
- ✅ Network error handling
- ✅ Empty state displays
- ✅ Loading states and skeletons
- ✅ Graceful degradation

## Mock Strategy

### External Dependencies
- **Next.js Router**: Mocked to test navigation without actual routing
- **Framer Motion**: Simplified to avoid animation complexity in tests
- **Database**: Mocked to test API logic without database dependency
- **Fetch API**: Mocked to control API responses and test error scenarios

### Performance Mocks
- **IntersectionObserver**: For lazy loading tests
- **ResizeObserver**: For responsive behavior tests
- **Performance API**: For performance monitoring tests

## Test Data

### Sample Content
Tests use realistic sample data that matches the production data structure:
- Albums with cover art, track counts, and metadata
- Playlists with track counts and privacy settings
- Blog posts with excerpts, view counts, and publication status

### Edge Cases
- Empty libraries
- Large content collections (100+ items)
- Network failures and timeouts
- Invalid user permissions
- Malformed API responses

## Continuous Integration

Tests are configured to run automatically on:
- Pull request creation
- Code commits to main branch
- Scheduled nightly runs

### CI Requirements
- All tests must pass
- Coverage thresholds must be met
- No console errors or warnings
- Performance benchmarks must be maintained

## Debugging Tests

### Common Issues
1. **Async Operations**: Use `waitFor` for async state changes
2. **User Events**: Use `userEvent` instead of `fireEvent` for realistic interactions
3. **Mocking**: Ensure all external dependencies are properly mocked
4. **Cleanup**: Tests should clean up after themselves to avoid interference

### Debug Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with debug information
npm test -- --detectOpenHandles --forceExit

# Run a single test file with debugging
npm test -- --testNamePattern="specific test name" --verbose
```

## Contributing

When adding new features to the User Library:

1. **Write tests first** (TDD approach)
2. **Cover all user interactions** and edge cases
3. **Test both success and failure scenarios**
4. **Ensure mobile compatibility** is tested
5. **Verify accessibility** requirements are met
6. **Update this documentation** with new test scenarios

### Test Naming Convention
- **Unit tests**: `ComponentName.test.tsx`
- **Hook tests**: `useHookName.test.ts`
- **API tests**: `api-endpoint.test.ts`
- **E2E tests**: `feature.e2e.test.tsx`

### Test Structure
```typescript
describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  describe('specific functionality', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

This comprehensive test suite ensures the User Library feature is robust, reliable, and provides an excellent user experience across all devices and scenarios.