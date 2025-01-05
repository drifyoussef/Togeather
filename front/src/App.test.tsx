// Importation des outils nécessaires pour le test
import { render } from '@testing-library/react'; // Fournit des fonctions pour rendre des composants et interroger le DOM
import App from './App'; // Composant principal de l'application à tester

// Définition du test
test('renders learn react link', () => {
	// Rend le composant `App` dans un environnement de test
	render(<App />);
});