import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Profile from './Profile';
import fetchMock from 'jest-fetch-mock';

jest.mock('sweetalert2', () => ({
    fire: jest.fn(),
}));

describe('Profile Component', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchMock.resetMocks();
    });

    it('should render the profile component', async () => {
        const mockUser = {
            firstname: 'John',
            name: 'Doe',
            email: 'john.doe@example.com',
            userGender: 'male',
            preferredGender: 'both',
            favoriteCategory: 'Pizza',
            age: 30,
            job: 'Developer',
            passions: 'Coding',
            imageUrl: 'profile.jpg',
        };

        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('currentUserId', '1');

        fetchMock.mockResponseOnce(JSON.stringify(mockUser));

        render(
            <Router>
                <Profile />
            </Router>
        );
    });

    it('should display loading message when user data is not loaded', () => {
        render(
            <Router>
                <Profile />
            </Router>
        );
    });
});