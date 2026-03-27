"use client";
import React from "react";
import { usePathname } from "next/navigation";

const Navigation = () => {
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "Home" },
        { href: "/menu", label: "Menu" },
        { href: "/about", label: "About" },
        { href: "/reviews", label: "Reviews" },
        { href: "/contact", label: "Contact" },
        { href: "/faq", label: "FAQ" }
    ];

    return (
        <nav>
            <ul className="list-none flex flex-wrap justify-center gap-y-6 gap-x-3 md:gap-5 p-0 m-0">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <li key={item.href}>
                            <a 
                                href={item.href} 
                                className={`font-bold transition-all duration-200 px-4 py-2 rounded-lg border-2 ${
                                    isActive 
                                        ? "bg-yellow text-white border-yellow shadow-md" 
                                        : "bg-white text-hot-pink border-white hover:bg-yellow hover:text-white hover:border-yellow hover:shadow-md"
                                }`}
                            >
                                {item.label}
                            </a>
                        </li>
                    );
                })}
                
                {/* Order/Basket Icon - Hidden for testing */}
                {/* Uncomment when ready to launch ordering feature
                <li>
                    <a 
                        href="/menu/order"
                        className={`font-bold transition-all duration-200 px-4 py-2 rounded-lg border-2 flex items-center gap-2 ${
                            pathname?.startsWith("/menu/order")
                                ? "bg-yellow text-white border-yellow shadow-md" 
                                : "bg-white text-hot-pink border-white hover:bg-yellow hover:text-white hover:border-yellow hover:shadow-md"
                        }`}
                        title="Order Online"
                    >
                        <i className="fas fa-shopping-basket"></i>
                        <span>Order</span>
                    </a>
                </li>
                */}
            </ul>
        </nav>
    );
};

export default Navigation;
