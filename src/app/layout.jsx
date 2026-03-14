import React from 'react';
import './globals.css';

export const metadata = {
    title: 'Kira Sushi and Poke',
    description: 'Welcome to our restaurant',
    icons: {
        icon: '/favicon.svg',
    },
};

const Layout = ({ children }) => {
    return (
        <html lang="en">
            <body>
                <header className="bg-hot-pink text-white p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img 
                                src="/kira-sushi-and-poke-logo.png" 
                                alt="Kira Sushi and Poke Logo"
                                className="h-25 w-auto"
                            />
                        </div>
                        <nav>
                            <ul className="list-none flex gap-5 p-0 m-0">
                                <li><a href="/" className="text-yellow font-bold">Home</a></li>
                                <li><a href="/menu" className="text-yellow font-bold">Menu</a></li>
                            </ul>
                        </nav>
                    </div>
                </header>
                <main>{children}</main>
                <footer>
                    <p>&copy; {new Date().getFullYear()} Kira Sushi and Poke. All rights reserved.</p>
                </footer>
            </body>
        </html>
    );
};

export default Layout;
