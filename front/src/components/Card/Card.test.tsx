import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Card from './Card';

type Category = 'Asiatique' | 'Pizza' | 'Poulet' | 'Sandwich' | 'Mexicain' | 'Burger' | 'Glaces' | 'Boissons';

describe('Card Component', () => {
    const mockProps = {
        category: 'Pizza' as Category,
        imageUrl: 'profile.jpg',
        subcategory: 'Italian',
        image: 'profile.jpg',
        text: 'John Doe',
        job: 'Developer',
        id: '1',
    };

    it('should render the correct icon for each category', () => {
        const categories = [
            'Asiatique', 'Pizza', 'Poulet', 'Sandwich', 'Mexicain', 'Burger', 'Glaces', 'Boissons'
        ];

        categories.forEach(category => {
            render(
                <Router>
                    <Card {...mockProps} category={category as any} />
                </Router>
            );
        });
    });

    it('should handle missing subcategory gracefully', () => {
        render(
            <Router>
                <Card {...mockProps} subcategory={null as any} />
            </Router>
        );

    });
});