import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from './Home';
import { useFetchUsers } from '../../hooks/useFetchUsers';
import fetchMock from 'jest-fetch-mock';

jest.mock('../../hooks/useFetchUsers');

describe('Home Component', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchMock.resetMocks();
    });

    it('should render the home component with categories', () => {
        (useFetchUsers as jest.Mock).mockReturnValue({ users: [], preferredGender: 'both', mutualMatches: [] });

        render(
            <Router>
                <Home />
            </Router>
        );
    });

    it('should display loading message when users are loading', () => {
        (useFetchUsers as jest.Mock).mockReturnValue({ users: [], preferredGender: 'both', mutualMatches: [] });

        render(
            <Router>
                <Home />
            </Router>
        );
    });

    it('should display users when loaded', async () => {
        const mockUsers = [
            { _id: '1', firstname: 'John', age: 30, job: 'Developer', favoriteCategory: 'Pizza', userGender: 'male', preferredGender: 'both', imageUrl: 'profile.jpg' },
        ];
        (useFetchUsers as jest.Mock).mockReturnValue({ users: mockUsers, preferredGender: 'both', mutualMatches: [] });

        render(
            <Router>
                <Home />
            </Router>
        );
    });

    it('should display no users message when no users are available', async () => {
        (useFetchUsers as jest.Mock).mockReturnValue({ users: [], preferredGender: 'both', mutualMatches: [] });

        render(
            <Router>
                <Home />
            </Router>
        );
    });

    it('should display mutual matches when loaded', async () => {
        const mockMutualMatches = [
            { _id: '1', firstname: 'John', imageUrl: 'profile.jpg' },
        ];
        (useFetchUsers as jest.Mock).mockReturnValue({ users: [], preferredGender: 'both', mutualMatches: mockMutualMatches });

        render(
            <Router>
                <Home />
            </Router>
        );
    });

    it('should display loading message when mutual matches are loading', () => {
        (useFetchUsers as jest.Mock).mockReturnValue({ users: [], preferredGender: 'both', mutualMatches: [] });

        render(
            <Router>
                <Home />
            </Router>
        );
    });

    it('should display no mutual matches message when no matches are available', async () => {
        (useFetchUsers as jest.Mock).mockReturnValue({ users: [], preferredGender: 'both', mutualMatches: [] });

        render(
            <Router>
                <Home />
            </Router>
        );
    });
});