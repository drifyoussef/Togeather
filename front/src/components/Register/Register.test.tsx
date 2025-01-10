import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Register from './Register';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('Register', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchMock.resetMocks();
    });

    it('should render the registration form and handle user input', async () => {
        render(
            <Router>
                <Register />
            </Router>
        );
    });

    it('should handle registration errors', async () => {
        fetchMock.mockRejectOnce(new Error('Registration failed'));

        render(
            <Router>
                <Register />
            </Router>
        );
    });
});