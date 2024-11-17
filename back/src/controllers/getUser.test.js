const getUser = require('./getUser'); // Adjust the path as necessary

test('should return user data for a valid user ID', async () => {
	const userId = 1;
	const expectedUser = { id: 1, name: 'John Doe' }; // Example expected user data
	const user = await getUser(userId);
	expect(user).toEqual(expectedUser);
});

test('should throw an error for an invalid user ID', async () => {
	const userId = -1;
	await expect(getUser(userId)).rejects.toThrow('User not found');
});