import { mount } from '@cypress/react';
import '../../src/index.css';
declare global {
    namespace Cypress {
        interface Chainable<Subject = any> {
            mount: typeof mount;
        }
    }
}
export {};
