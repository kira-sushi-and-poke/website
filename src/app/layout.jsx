import React from "react";
import "./globals.css";
import OpeningHoursChat from "../components/OpeningHoursChat";
import Navigation from "../components/Navigation";

export const metadata = {
    title: "Kira Sushi and Poke",
    description: "Welcome to our restaurant",
    icons: {
        icon: "/favicon.svg",
    },
};

const Layout = ({ children }) => {
    return (
        <html lang="en">
            <head>
                <link 
                    rel="stylesheet" 
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
                    integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
            </head>
            <body>
                <header className="bg-hot-pink text-white p-5">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center">
                            <img 
                                src="/kira-sushi-and-poke-logo.png" 
                                alt="Kira Sushi and Poke Logo"
                                className="h-25 w-auto"
                            />
                        </div>
                        <Navigation />
                    </div>
                </header>
                <main>{children}</main>
                <OpeningHoursChat />
                <footer className="bg-gray-100 text-center p-4 text-gray-600">
                    <p>&copy; {new Date().getFullYear()} Kira Sushi and Poke. All rights reserved.</p>
                </footer>
            </body>
        </html>
    );
};

export default Layout;
