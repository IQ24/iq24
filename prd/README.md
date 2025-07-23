# IQ24 PRD (Product Requirements Document) Templates

This directory contains standardized PRD templates for different types of development work in the IQ24 platform.

## Available Templates

### [Agent PRD Template](./templates/agent-prd-template.md)
Use this template for defining AI agents in the IQ24 platform, including:
- Prospect Discovery Agent (PDA)
- Validation & Enrichment Agent (VEA)  
- Outreach Personalization Agent (OPA)
- Campaign Execution Agent (CEA)
- Analytics & Feedback Loop Agent (AFLA)
- Compliance Guardian Agent (CGN)
- AI Learning Orchestrator (ALO)

### [Feature PRD Template](./templates/feature-prd-template.md)
Use this template for defining new features across the platform, including:
- Dashboard features
- Website features
- Mobile app features
- API features
- Admin features

### [API PRD Template](./templates/api-prd-template.md)
Use this template for defining new APIs and API endpoints, including:
- RESTful APIs
- GraphQL APIs
- WebSocket APIs
- Internal service APIs
- External integration APIs

## How to Use These Templates

1. **Choose the Right Template**: Select the template that best matches your project type
2. **Copy the Template**: Create a new file using the template as a starting point
3. **Customize**: Fill in all sections with project-specific information
4. **Review**: Have stakeholders review the PRD before implementation
5. **Maintain**: Keep the PRD updated as requirements evolve

## PRD Naming Convention

Use the following naming convention for PRD files:
- **Agents**: `agent-{agent-code}-{version}.md` (e.g., `agent-pda-v1.md`)
- **Features**: `feature-{feature-name}-{version}.md` (e.g., `feature-dashboard-analytics-v1.md`)
- **APIs**: `api-{api-name}-{version}.md` (e.g., `api-user-management-v1.md`)

## PRD Review Process

1. **Draft**: Author creates initial PRD draft
2. **Technical Review**: Engineering team reviews technical feasibility
3. **Design Review**: Design team reviews UX/UI requirements
4. **Security Review**: Security team reviews security requirements
5. **Business Review**: Product and business teams review business requirements
6. **Approval**: Stakeholders approve the PRD
7. **Implementation**: Development team implements based on PRD

## PRD Status Tracking

Each PRD should maintain status tracking:
- **Draft**: Initial creation and iteration
- **Review**: Under stakeholder review
- **Approved**: Approved for implementation
- **In Progress**: Currently being implemented
- **Completed**: Implementation finished
- **Deployed**: Live in production
- **Deprecated**: No longer in use

## Best Practices

### Writing Effective PRDs
- **Be Specific**: Use concrete, measurable requirements
- **Include Context**: Explain why features are needed
- **Consider Edge Cases**: Think about error scenarios
- **Define Success**: Include clear success metrics
- **Stay Updated**: Keep PRDs current with changes

### Technical Considerations
- **Architecture**: Consider system architecture impact
- **Performance**: Define performance requirements
- **Scalability**: Plan for future growth
- **Security**: Include security requirements
- **Compliance**: Consider regulatory requirements

### User Experience
- **User-Centered**: Focus on user needs and problems
- **Accessibility**: Include accessibility requirements
- **Mobile-First**: Consider mobile experience
- **Internationalization**: Plan for global users
- **Usability**: Define usability requirements

## Common PRD Sections

All PRDs should include these core sections:
- **Overview**: Executive summary and context
- **Requirements**: Functional and non-functional requirements
- **Technical Architecture**: System design and integration
- **User Experience**: UI/UX design requirements
- **Security**: Security and compliance requirements
- **Testing**: Testing strategy and acceptance criteria
- **Timeline**: Implementation schedule and milestones
- **Success Metrics**: How success will be measured

## Related Documentation

- **Technical Specifications**: Detailed technical implementation docs
- **API Documentation**: API reference and examples
- **User Documentation**: End-user guides and tutorials
- **Architecture Decision Records**: Technical decision documentation
- **Design System**: UI/UX design guidelines

## Questions or Issues?

If you have questions about these templates or need help creating a PRD:
1. Review existing PRDs for examples
2. Check the documentation links above
3. Reach out to the product team
4. Create an issue in the project repository