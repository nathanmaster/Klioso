## 🚀 Description

<!-- Provide a clear and concise description of what this PR implements -->

**Type of Change:**
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Code refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test coverage improvement

## 🎯 Related Issues

<!-- Link to any related issues or feature requests -->
Closes #(issue_number)
Related to #(issue_number)

## 📋 Changes Made

### Backend Changes
- [ ] New models/migrations created
- [ ] Controllers updated/created
- [ ] Routes added/modified
- [ ] Services/repositories created
- [ ] Validation rules added
- [ ] Tests written/updated

### Frontend Changes
- [ ] New React components created
- [ ] Existing components updated
- [ ] Styling changes (CSS/Tailwind)
- [ ] JavaScript functionality added
- [ ] User interface improvements
- [ ] Responsive design considerations

### Database Changes
- [ ] New migrations created
- [ ] Schema modifications
- [ ] Seed data updated
- [ ] Indexes added/modified

### Configuration Changes
- [ ] Environment variables added
- [ ] Configuration files updated
- [ ] Dependencies added/updated
- [ ] Build process modified

## 🧪 Testing

### Test Coverage
- [ ] Unit tests written and passing
- [ ] Feature tests written and passing
- [ ] Manual testing completed
- [ ] Browser compatibility tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness tested
- [ ] Performance impact assessed

### Test Scenarios
<!-- Describe the key test scenarios you've verified -->

1. **Scenario 1:** Description
   - Steps: 1, 2, 3
   - Expected: Result
   - ✅ Verified

2. **Scenario 2:** Description
   - Steps: 1, 2, 3
   - Expected: Result
   - ✅ Verified

## 📸 Screenshots/Videos

<!-- Include screenshots or videos demonstrating the changes -->

### Before
<!-- Screenshots of the old behavior -->

### After
<!-- Screenshots of the new behavior -->

## 🔍 Code Quality Checklist

### General
- [ ] Code follows project coding standards
- [ ] No debug code (console.log, dd(), etc.) left in
- [ ] Error handling implemented appropriately
- [ ] Security considerations addressed
- [ ] Performance implications considered

### Laravel/PHP
- [ ] Follows Laravel conventions and best practices
- [ ] Proper use of Eloquent relationships
- [ ] Validation rules are comprehensive
- [ ] Authorization checks implemented where needed
- [ ] Database queries are optimized

### React/JavaScript
- [ ] Components are properly structured and reusable
- [ ] Props and state management is appropriate
- [ ] Event handlers are efficient
- [ ] Accessibility considerations (ARIA labels, keyboard navigation)
- [ ] No memory leaks or infinite re-renders

## 🚀 Deployment Considerations

### Database Migrations
- [ ] Migrations are reversible (down() method implemented)
- [ ] No data loss in migrations
- [ ] Migrations tested on sample data
- [ ] Production data migration strategy considered

### Environment Setup
- [ ] New environment variables documented
- [ ] Configuration changes documented
- [ ] Dependencies are compatible
- [ ] Caching considerations addressed

### Rollback Plan
- [ ] Changes can be safely rolled back
- [ ] Database rollback plan exists
- [ ] Asset rollback considered
- [ ] Monitoring and alerting setup

## 📖 Documentation

- [ ] Code is well-commented
- [ ] API endpoints documented (if applicable)
- [ ] README updated (if necessary)
- [ ] User-facing documentation updated
- [ ] Changelog entry prepared

## 🔗 Dependencies

### New Dependencies
<!-- List any new packages or libraries added -->
- Package name: `package-name` - Purpose and justification

### Updated Dependencies
<!-- List any dependencies that were updated -->
- Package name: `package-name` - Version change and reason

## 🎭 Breaking Changes

<!-- If this PR contains breaking changes, describe them here -->

### Changes
1. **Change description:** What changed and why
   - **Impact:** Who/what is affected
   - **Migration:** How to update existing code

### Migration Guide
<!-- Provide step-by-step migration instructions for breaking changes -->

```bash
# Example migration steps
php artisan migrate
npm run build
```

## 🔮 Future Considerations

<!-- Any technical debt, refactoring opportunities, or future improvements to consider -->

- [ ] Technical debt item 1
- [ ] Refactoring opportunity
- [ ] Performance optimization idea
- [ ] Feature enhancement possibility

## 👥 Review Focus Areas

<!-- Guide reviewers on what to focus on -->

Please pay special attention to:
- [ ] **Security:** Authentication/authorization logic
- [ ] **Performance:** Database queries and frontend rendering
- [ ] **UX:** User interface and interaction patterns
- [ ] **Data Integrity:** Database migrations and data handling
- [ ] **Error Handling:** Edge cases and error states

## 📝 Additional Notes

<!-- Any additional context, concerns, or information for reviewers -->

---

**Reviewer Checklist:**
- [ ] Code quality and standards compliance
- [ ] Test coverage is adequate
- [ ] Documentation is complete and accurate
- [ ] Security implications considered
- [ ] Performance impact acceptable
- [ ] Breaking changes properly documented
- [ ] Ready for deployment
