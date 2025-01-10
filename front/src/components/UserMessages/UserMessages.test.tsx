import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import UserMessages from './UserMessages';
import fetchMock from 'jest-fetch-mock';
import { useFetchUsers } from '../../hooks/useFetchUsers';

jest.mock('../../hooks/useFetchUsers');
jest.mock('socket.io-client', () => {
    return jest.fn(() => ({
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
    }));
});

fetchMock.enableMocks();

describe('UserMessages', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchMock.resetMocks();
    });

    it('should render user messages and handle sending a message', async () => {
        const mockMutualMatches = [
            { _id: '1', firstname: 'John', age: 30, job: 'Developer', imageUrl: 'profile.jpg' },
        ];
        (useFetchUsers as jest.Mock).mockReturnValue({ mutualMatches: mockMutualMatches });

        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('currentUserId', '2');
        localStorage.setItem('firstname', 'Jane');

        fetchMock.mockResponseOnce(JSON.stringify([]));

        render(
            <Router>
                <UserMessages />
            </Router>
        );
    });

    it('should handle errors when fetching messages', async () => {
        const mockMutualMatches = [
            { _id: '1', firstname: 'John', age: 30, job: 'Developer', imageUrl: 'profile.jpg' },
        ];
        (useFetchUsers as jest.Mock).mockReturnValue({ mutualMatches: mockMutualMatches });

        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('currentUserId', '2');

        fetchMock.mockRejectOnce(new Error('Error fetching messages'));

        render(
            <Router>
                <UserMessages />
            </Router>
        );
    });

    it('should display loading message when messages are not loaded', () => {
        const mockMutualMatches = [
            { _id: '1', firstname: 'John', age: 30, job: 'Developer', imageUrl: 'profile.jpg' },
        ];
        (useFetchUsers as jest.Mock).mockReturnValue({ mutualMatches: mockMutualMatches });

        render(
            <Router>
                <UserMessages />
            </Router>
        );

    });
});
