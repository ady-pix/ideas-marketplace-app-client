import { mount } from '@cypress/react'
import '../../src/Index.css'

declare global {
    namespace Cypress {
        interface Chainable<Subject = any> {
            mount: typeof mount
        }
    }
}

Cypress.Commands.add('mount', mount)

export {}
