// src/services/userService.js
export const registerUser = async (userData) => {
    // Methode POST pour envoyer les données de l'utilisateur lors de son inscription
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        
        // Si la réponse n'est pas ok, on renvoie une erreur
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error registering user');
        }

        // Sinon, on renvoie les données de la réponse
        const data = await response.json();
        console.log('REPONSE DU REGISTER:', data); // Log the response to check if the token is present
        return data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};
