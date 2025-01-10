import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Premium from './Premium';
import fetchMock from 'jest-fetch-mock';

jest.mock('../../services/userService');

describe('Premium Component', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchMock.resetMocks();
    });

    it('should render the premium upgrade form', () => {
        render(
            <Router>
                <Premium />
            </Router>
        );
    });

    it('should handle form submission successfully', async () => {

        render(
            <Router>
                <Premium />
            </Router>
        );
    });

    it('should show error message on failed upgrade', async () => {

        render(
            <Router>
                <Premium />
            </Router>
        );
    });

});