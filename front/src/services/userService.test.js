import fetchMock from 'jest-fetch-mock';
import { registerUser } from './userService'; // Adjust the path as necessary

fetchMock.enableMocks();

describe('registerUser', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('should register a user successfully', async () => {
        const mockUserData = { username: 'testuser', password: 'password123' };
        const mockResponseData = { message: 'User registered successfully' };

        fetchMock.mockResponseOnce(JSON.stringify(mockResponseData), {
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await registerUser(mockUserData);

        expect(result).toEqual(mockResponseData);
        expect(fetchMock).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/users/register`, expect.any(Object));
    });

    it('should throw an error if registration fails', async () => {
        const mockUserData = { username: 'testuser', password: 'password123' };
        const mockErrorResponse = { message: 'Error registering user' };

        fetchMock.mockResponseOnce(JSON.stringify(mockErrorResponse), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });

        await expect(registerUser(mockUserData)).rejects.toThrow('Error registering user');
        expect(fetchMock).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/users/register`, expect.any(Object));
    });
});