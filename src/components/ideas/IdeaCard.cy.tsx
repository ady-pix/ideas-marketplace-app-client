import { MemoryRouter } from 'react-router-dom'
import IdeaCard from './IdeaCard'
import { type Idea } from '../../types/idea'

const mockIdea: Idea = {
    _id: '1',
    title: 'Test Idea',
    category: 'Technology',
    type: 'Product',
    problemDescription: 'Test problem description',
    solutionDescription: 'Test solution description',
    desiredPrice: 1000,
    requireNDA: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    creator: 'user123',
    creatorInfo: {
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: null,
    },
}

describe('<IdeaCard />', () => {
    const mountIdeaCard = (idea: Idea) => {
        cy.mount(
            <MemoryRouter>
                <IdeaCard idea={idea} />
            </MemoryRouter>
        )
    }

    it('renders without crashing', () => {
        mountIdeaCard(mockIdea)
        cy.get('[data-testid="idea-card"]').should('exist')
    })

    it('displays the idea title correctly', () => {
        mountIdeaCard(mockIdea)
        cy.contains('Test Idea').should('be.visible')
    })

    it('displays the idea type with correct styling', () => {
        // Test Product type
        mountIdeaCard(mockIdea)
        cy.contains('Product')
            .should('be.visible')
            .should('have.class', 'bg-blue-100')
            .should('have.class', 'text-blue-800')

        // Test Service type
        const serviceIdea = { ...mockIdea, type: 'Service' as const }
        mountIdeaCard(serviceIdea)
        cy.contains('Service')
            .should('be.visible')
            .should('have.class', 'bg-green-100')
            .should('have.class', 'text-green-800')
    })

    it('displays the category correctly', () => {
        mountIdeaCard(mockIdea)
        cy.contains('Technology').should('be.visible')
    })

    it('displays the problem description', () => {
        mountIdeaCard(mockIdea)
        cy.contains('Test problem description').should('be.visible')
    })

    it('displays the price correctly formatted', () => {
        mountIdeaCard(mockIdea)
        cy.contains('$1,000').should('be.visible')

        // Test with larger price
        const expensiveIdea = { ...mockIdea, desiredPrice: 1234567 }
        mountIdeaCard(expensiveIdea)
        cy.contains('$1,234,567').should('be.visible')
    })

    it('displays NDA requirement when required', () => {
        const ndaIdea = { ...mockIdea, requireNDA: true }
        mountIdeaCard(ndaIdea)
        cy.contains('NDA Required')
            .should('be.visible')
            .should('have.class', 'bg-yellow-100')
            .should('have.class', 'text-yellow-800')
    })

    it('does not display NDA badge when not required', () => {
        mountIdeaCard(mockIdea)
        cy.contains('NDA Required').should('not.exist')
    })

    it('displays creator information correctly', () => {
        mountIdeaCard(mockIdea)
        cy.contains('Created by Test User').should('be.visible')

        // Check creator image
        cy.get('img[alt="Test User"]').should('exist')
    })

    it('displays creation date correctly', () => {
        mountIdeaCard(mockIdea)
        cy.contains('1/1/2024').should('be.visible')
    })

    it('has working links to profile and idea details', () => {
        mountIdeaCard(mockIdea)

        // Check profile link
        cy.get('a[href="/profile/user123"]').should('exist')

        // Check idea details link
        cy.get('a[href="/ideas/1"]')
            .should('exist')
            .should('contain', 'View Details')
    })

    it('handles missing creator photo with fallback', () => {
        mountIdeaCard(mockIdea)

        // Trigger image error to test fallback
        cy.get('img[alt="Test User"]').then(($img) => {
            $img[0].dispatchEvent(new Event('error'))
        })

        // Should still display the image element
        cy.get('img[alt="Test User"]').should('exist')
    })

    it('displays all required fields for a complete idea', () => {
        const completeIdea: Idea = {
            ...mockIdea,
            title: 'Complete Test Idea',
            category: 'Health & Wellness',
            type: 'Service',
            problemDescription:
                'A comprehensive problem description that explains the issue in detail',
            desiredPrice: 5000,
            requireNDA: true,
            creatorInfo: {
                displayName: 'John Doe',
                email: 'john@example.com',
                photoURL: 'https://example.com/photo.jpg',
            },
        }

        mountIdeaCard(completeIdea)

        // Verify all fields are present
        cy.contains('Complete Test Idea').should('be.visible')
        cy.contains('Health & Wellness').should('be.visible')
        cy.contains('Service').should('be.visible')
        cy.contains('A comprehensive problem description').should('be.visible')
        cy.contains('$5,000').should('be.visible')
        cy.contains('NDA Required').should('be.visible')
        cy.contains('Created by John Doe').should('be.visible')
        cy.get('img[src="https://example.com/photo.jpg"]').should('exist')
    })
})
