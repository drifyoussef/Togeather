import { renderHook } from '@testing-library/react-hooks';
import fetchMock from 'jest-fetch-mock';
import { useFetchUsers } from './useFetchUsers';
import { BrowserRouter as Router } from 'react-router-dom';

fetchMock.enableMocks();

describe('useFetchUsers', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchMock.resetMocks();
    });

    it('should fetch and set users and preferred gender', async () => {
        const mockUserResponse = { preferredGender: 'male' };
        const mockUsersResponse = [
            { id: 1, userGender: 'male', isMutual: true },
            { id: 2, userGender: 'female', isMutual: false },
        ];

        localStorage.setItem('token', 'fake-token');
        fetchMock.mockResponses(
            [JSON.stringify(mockUserResponse), { status: 200 }],
            [JSON.stringify(mockUsersResponse), { status: 200 }]
        );

        const { result, waitForNextUpdate } = renderHook(() => useFetchUsers(), {
            wrapper: (props: { children: React.ReactNode }) => <Router>{props.children}</Router>,
        });

        await waitForNextUpdate();

        expect(result.current.preferredGender).toBe('male');
        expect(result.current.users).toEqual(mockUsersResponse);
    });
});