import { ReactNode } from 'react'
import { MountOptions, MountReturn } from '@cypress/react'

declare global {
    namespace Cypress {
        interface Chainable {
            mount(
                component: ReactNode,
                options?: MountOptions
            ): Chainable<MountReturn>
        }
    }
}

export {}
