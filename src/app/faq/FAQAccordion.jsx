"use client";
import React, { useState } from "react";

const FAQAccordion = ({ faqs }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-4">
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    className="border-2 border-hot-pink rounded-lg overflow-hidden bg-white"
                >
                    <button
                        onClick={() => toggleFAQ(index)}
                        className="w-full p-4 md:p-5 text-left flex justify-between items-center hover:bg-hot-pink/5 transition-colors"
                    >
                        <span className="font-bold text-hot-pink pr-4">
                            {faq.question}
                        </span>
                        <i className={`fas fa-chevron-${openIndex === index ? 'up' : 'down'} text-yellow flex-shrink-0`}></i>
                    </button>

                    {openIndex === index && (
                        <div className="p-4 md:p-5 pt-0 text-gray-700 border-t-2 border-hot-pink/20">
                            {faq.answer}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FAQAccordion;
