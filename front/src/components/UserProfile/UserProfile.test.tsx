import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { BrowserRouter as Router } from 'react-router-dom';
import UserProfile from './UserProfile';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('UserProfile', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchMock.resetMocks();
    });

    it('should render user profile', async () => {
        const mockUser = {
            id: '1',
            firstname: 'John',
            name: 'Doe',
            userGender: 'male',
            preferredGender: 'both',
            favoriteCategory: 'Pizza',
            age: 30,
            job: 'Developer',
            passions: 'Coding',
            imageUrl: 'profile.jpg',
            likedBy: [],
        };

        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('currentUserId', '2');

        fetchMock.mockResponseOnce(JSON.stringify(mockUser));

        renderHook(() => (
            <Router>
                <UserProfile />
            </Router>
        ));
    });
});