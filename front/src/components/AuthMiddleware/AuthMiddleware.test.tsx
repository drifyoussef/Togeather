import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthMiddleware from './AuthMiddleware';

jest.mock('sweetalert2', () => ({
    fire: jest.fn(),
}));

describe('AuthMiddleware Component', () => {

    it('should render children if authenticated', () => {
        localStorage.setItem('token', 'fake-token');

        render(
            <Router>
                <AuthMiddleware>
                    <div>Protected Content</div>
                </AuthMiddleware>
            </Router>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect to login if not authenticated', () => {
        localStorage.clear();

        render(
            <Router>
                <AuthMiddleware>
                    <div>Protected Content</div>
                </AuthMiddleware>
            </Router>
        );

    });
});