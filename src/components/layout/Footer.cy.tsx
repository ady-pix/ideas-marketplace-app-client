import { BrowserRouter } from 'react-router-dom'
import Footer from './Footer'

describe('<Footer />', () => {
    beforeEach(() => {
        cy.mount(
            <BrowserRouter>
                <Footer />
            </BrowserRouter>
        )
    })

    it('renders', () => {
        cy.get('footer').should('exist')
    })

    it('displays the correct company information', () => {
        cy.get('footer h2').should('contain', 'Ideady')
        cy.get('footer p').should('contain', 'The marketplace for innovative ideas')
    })

    it('contains the correct quick links', () => {
        cy.get('footer a').should('have.length', 2)
        cy.get('footer a').eq(0).should('contain', 'Browse Ideas')
        cy.get('footer a').eq(1).should('contain', 'Submit Your Idea')
    })

    it('renders the "Browse Ideas" link', () => {
        cy.get('a[href="/ideas"]').should('have.text', 'Browse Ideas')
    })
    
    it('renders the "Submit Your Idea" link', () => {
        cy.get('a[href="/create-idea"]').should('have.text', 'Submit Your Idea')
    })
    
    it('displays the current year in the copyright text', () => {
        const currentYear = new Date().getFullYear()
        cy.get('footer').should('contain', currentYear)
    })

    it('has the correct background and text color classes', () => {
        cy.get('footer').should('have.class', 'bg-gray-800')
        cy.get('footer').should('have.class', 'text-white')
    })
})
