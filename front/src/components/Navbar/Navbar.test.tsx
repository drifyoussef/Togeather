import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './Navbar';
import fetchMock from 'jest-fetch-mock';
import { useFetchUsers } from '../../hooks/useFetchUsers';

jest.mock('../../hooks/useFetchUsers');
jest.mock('sweetalert2', () => ({
    fire: jest.fn(),
}));

describe('Navbar Component', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchMock.resetMocks();
        (useFetchUsers as jest.Mock).mockReturnValue({ mutualMatches: [] });
    });

    it('should render without crashing', () => {
        render(
            <Router>
                <Navbar />
            </Router>
        );
    });
});