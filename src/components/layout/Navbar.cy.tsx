import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { OnlineUsersContext } from '../../context/OnlineUsersContext'
import Navbar from './Navbar'
import React, { useState } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import type { Timestamp } from 'firebase/firestore'

// Types
interface User extends Partial<FirebaseUser> {
    uid: string
    email: string
    displayName: string
    photoURL: string | null
    emailVerified: boolean
}

interface UserProfile {
    displayName: string
    email: string
    photoURL: string | null
    createdAt: Timestamp | null
    isOnline: boolean
}

// Mock data
const mockUser: User = {
    uid: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
}

const mockUserProfile: UserProfile = {
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: null,
    createdAt: null,
    isOnline: true,
}

// Mock OnlineUsersProvider
const MockOnlineUsersProvider = ({
    children,
}: {
    children: React.ReactNode
}) => (
    <OnlineUsersContext.Provider
        value={{
            onlineUsers: [
                {
                    id: '123',
                    displayName: 'Test User',
                    photoURL:
                        'https://www.upwork.com/mc/documents/Anna-facial-expression.png',
                    lastSeen: null,
                },
                {
                    id: '456',
                    displayName: 'Test User 2',
                    photoURL: '',
                    lastSeen: null,
                },
                {
                    id: '789',
                    displayName: 'Test User 3',
                    photoURL:
                        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpY1LpNsoB721iMtGPRlzNT2nAzRH3w9_zl9GBzSKcFXRg9mKc_G9lSVXMxncN0jFRclQ&usqp=CAU',
                    lastSeen: null,
                },
            ],
        }}
    >
        {children}
    </OnlineUsersContext.Provider>
)

// Custom Auth Provider
const CustomAuthProvider = ({
    children,
    initialUser = null,
    initialUserProfile = null,
    onLogout,
}: {
    children: React.ReactNode
    initialUser?: User | null
    initialUserProfile?: UserProfile | null
    onLogout?: () => Promise<void>
}) => {
    const [currentUser, setCurrentUser] = useState<User | null>(initialUser)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(
        initialUserProfile
    )
    const [loading] = useState(false)

    const logout = async () => {
        if (onLogout) {
            await onLogout()
        }
        setCurrentUser(null)
        setUserProfile(null)
    }

    return (
        <AuthContext.Provider
            value={{
                currentUser: currentUser as FirebaseUser | null,
                userProfile,
                loading,
                login: async () => {},
                signup: async () => {},
                logout,
                loginWithGoogle: async () => {},
                updateUserProfile: async () => {},
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

describe('Navbar', () => {
    const mountNavbar = (props = {}) => {
        return cy.mount(
            <CustomAuthProvider {...props}>
                <MockOnlineUsersProvider>
                    <MemoryRouter>
                        <Navbar />
                    </MemoryRouter>
                </MockOnlineUsersProvider>
            </CustomAuthProvider>
        )
    }

    const mountAuthenticatedNavbar = (props = {}) => {
        return cy.mount(
            <CustomAuthProvider
                initialUser={mockUser}
                initialUserProfile={mockUserProfile}
                {...props}
            >
                <MockOnlineUsersProvider>
                    <MemoryRouter>
                        <Navbar />
                    </MemoryRouter>
                </MockOnlineUsersProvider>
            </CustomAuthProvider>
        )
    }

    const mountAuthenticatedNavbarWithRouter = (initialEntries: string[]) => {
        return cy.mount(
            <CustomAuthProvider
                initialUser={mockUser}
                initialUserProfile={mockUserProfile}
            >
                <MockOnlineUsersProvider>
                    <MemoryRouter initialEntries={initialEntries}>
                        <Navbar />
                    </MemoryRouter>
                </MockOnlineUsersProvider>
            </CustomAuthProvider>
        )
    }

    describe('Unauthenticated State', () => {
        it('shows login and register links in desktop view', () => {
            cy.viewport('macbook-13')
            mountNavbar()

            cy.get('a').contains('Login').should('be.visible')
            cy.get('a').contains('Register').should('be.visible')
            cy.get('button[aria-label="Show online users"]').should('not.exist')
            cy.get(
                'button[aria-label="Toggle desktop profile dropdown"]'
            ).should('not.exist')
        })

        it('shows login and register links in mobile view', () => {
            cy.viewport('iphone-6')
            mountNavbar()

            cy.get('button[aria-label="Mobile Toggle menu"]')
                .should('be.visible')
                .should('exist')
                .click({ force: true })

            cy.get('[data-testid="mobile-menu"]').within(() => {
                cy.get('a').contains('Login').should('be.visible')
                cy.get('a').contains('Register').should('be.visible')
            })
        })
    })

    describe('Authentication', () => {
        it('shows online users, profile photo and menu, and logout button in desktop view', () => {
            cy.viewport('macbook-13')
            mountAuthenticatedNavbar()

            // Verify profile menu button is visible
            cy.get('button[aria-label="Toggle desktop profile dropdown"]')
                .should('be.visible')
                .click()

            // Verify profile menu is visible and contains logout button
            cy.get('[data-testid="desktop-profile-dropdown"]')
                .should('be.visible')
                .within(() => {
                    cy.get('button').contains('Logout').should('be.visible')
                })

            // Close profile menu
            cy.get('body').click(0, 0)

            // Click on online users button
            cy.get('button[aria-label="Show online users"]')
                .should('be.visible')
                .should('exist')
                .click({ force: true })

            // Verify online users dropdown is visible
            cy.get('div[data-testid="online-users-dropdown"]')
                .should('be.visible')
                .should('exist')

            // Verify all online users are displayed
            cy.get('div[data-testid="online-users-dropdown"]').within(() => {
                cy.get('[data-testid="online-user"]').should('have.length', 3)

                // Verify first user
                cy.get('[data-testid="online-user"]')
                    .first()
                    .within(() => {
                        cy.get('img').should(
                            'have.attr',
                            'src',
                            'https://www.upwork.com/mc/documents/Anna-facial-expression.png'
                        )
                        cy.get('span').contains('Test User').should('exist')
                    })

                // Verify second user
                cy.get('[data-testid="online-user"]')
                    .eq(1)
                    .within(() => {
                        cy.get('img')
                            .should('have.attr', 'src')
                            .and('match', /^data:image\/svg\+xml/)
                        cy.get('span').contains('Test User 2').should('exist')
                    })

                // Verify third user
                cy.get('[data-testid="online-user"]')
                    .eq(2)
                    .within(() => {
                        cy.get('img').should(
                            'have.attr',
                            'src',
                            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpY1LpNsoB721iMtGPRlzNT2nAzRH3w9_zl9GBzSKcFXRg9mKc_G9lSVXMxncN0jFRclQ&usqp=CAU'
                        )
                        cy.get('span').contains('Test User 3').should('exist')
                    })
            })

            // Click outside to close dropdown
            cy.get('body').click(0, 0)

            // Verify dropdown is closed
            cy.get('div[data-testid="online-users-dropdown"]').should(
                'not.exist'
            )
        })

        it('shows online users, profile photo and menu, and logout button in mobile view', () => {
            cy.viewport('iphone-6')
            mountAuthenticatedNavbar()

            // Verify and open profile section is visible
            cy.get('[alt="Profile"]').should('be.visible')
            cy.get('button[aria-label="Open mobile profile menu"]')
                .should('exist')
                .click({ force: true })

            // Verify profile menu is visible and contains logout button
            cy.get('[data-testid="mobile-profile-dropdown"]')
                .should('be.visible')
                .within(() => {
                    cy.get('img').should('be.visible')
                    cy.get('h2').contains('Test User').should('be.visible')
                    cy.get('p')
                        .contains('test@example.com')
                        .should('be.visible')
                    cy.get('a').contains('View Profile').should('be.visible')
                    cy.get('button').contains('Logout').should('be.visible')
                    cy.get('button')
                        .contains('Close')
                        .should('be.visible')
                        .click({ force: true })
                })

            // Close profile menu
            cy.get('body').click(0, 0)

            // Open Mobile menu
            cy.get('button[aria-label="Mobile Toggle menu"]')
                .should('be.visible')
                .should('exist')
                .click({ force: true })

            // Verify profile menu is visible in mobile menu
            cy.get('[data-testid="mobile-menu"]').within(() => {
                // Verify logout button is visible
                cy.get('button').contains('Logout').should('be.visible')

                // Click on online users button in mobile menu
                cy.get('[aria-label="Show online users"]')
                    .should('be.visible')
                    .should('exist')
                    .click({ force: true })

                // Verify online users are displayed in mobile menu
                cy.get('[data-testid="online-user"]').should('have.length', 3)

                // Verify first user
                cy.get('[data-testid="online-user"]')
                    .first()
                    .within(() => {
                        cy.get('img').should(
                            'have.attr',
                            'src',
                            'https://www.upwork.com/mc/documents/Anna-facial-expression.png'
                        )
                        cy.get('span').contains('Test User').should('exist')
                    })

                // Verify second user
                cy.get('[data-testid="online-user"]')
                    .eq(1)
                    .within(() => {
                        cy.get('img')
                            .should('have.attr', 'src')
                            .and('match', /^data:image\/svg\+xml/)
                        cy.get('span').contains('Test User 2').should('exist')
                    })

                // Verify third user
                cy.get('[data-testid="online-user"]')
                    .eq(2)
                    .within(() => {
                        cy.get('img').should(
                            'have.attr',
                            'src',
                            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpY1LpNsoB721iMtGPRlzNT2nAzRH3w9_zl9GBzSKcFXRg9mKc_G9lSVXMxncN0jFRclQ&usqp=CAU'
                        )
                        cy.get('span').contains('Test User 3').should('exist')
                    })
            })

            // Close mobile menu
            cy.get('button[aria-label="Mobile Toggle menu"]').click()

            // Verify mobile menu is closed
            cy.get('[data-testid="mobile-menu"]').should('not.exist')
        })

        it('clears user data on logout', () => {
            const onLogout = cy.stub().as('onLogout')
            cy.viewport('macbook-13')

            mountAuthenticatedNavbar({ onLogout })

            cy.get('button[aria-label="Toggle desktop profile dropdown"]')
                .should('be.visible')
                .click()

            cy.get('button').contains('Logout').click()
            cy.get('@onLogout').should('have.been.calledOnce')
            cy.get('div[data-testid="profile-menu"]').should('not.exist')
        })
    })

    describe('Active Nav Item', () => {
        it('sets the nav item to active when its route is active', () => {
            cy.viewport('macbook-13')
            mountAuthenticatedNavbarWithRouter(['/ideas'])

            cy.get('a')
                .contains('Ideas')
                .should('have.class', 'border-b-2')
                .and('have.class', 'border-accent')

            cy.get('a')
                .contains('Home')
                .should('not.have.class', 'border-b-2')
                .and('not.have.class', 'border-accent')
        })

        it('changes active nav item when route changes', () => {
            cy.viewport('macbook-13')
            mountAuthenticatedNavbarWithRouter(['/ideas'])

            cy.get('a')
                .contains('Ideas')
                .should('have.class', 'border-b-2')
                .and('have.class', 'border-accent')

            cy.get('a').contains('Home').click()

            cy.get('a')
                .contains('Home')
                .should('have.class', 'border-b-2')
                .and('have.class', 'border-accent')

            cy.get('a')
                .contains('Ideas')
                .should('not.have.class', 'border-b-2')
                .and('not.have.class', 'border-accent')

            cy.get('a').contains('Create Idea').click()

            cy.get('a')
                .contains('Create Idea')
                .should('have.class', 'bg-secondary')
                .and('have.class', 'hover:bg-secondary/90')

            cy.get('a')
                .contains('Home')
                .should('not.have.class', 'border-b-2')
                .and('not.have.class', 'border-accent')
        })
    })
})
