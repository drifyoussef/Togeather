// src/services/userService.js
export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error registering user');
        }

        return response.json();
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};
