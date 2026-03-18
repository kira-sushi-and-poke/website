"use client";
import React, { useState } from "react";

const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "What are your opening hours?",
            answer: "We're open Monday through Sunday from 11:00 AM to 7:00 PM. Check our social media for any holiday hours or special closures."
        },
        {
            question: "Do you offer delivery or takeaway?",
            answer: "Unfortunately not at the moment. We are currently operating as a dine-in only restaurant. We hope to offer takeaway and delivery options in the future, so stay tuned!"
        },
        {
            question: "Do you have gluten-free options?",
            answer: "Yes! We offer gluten-free options including sashimi (sliced raw fish), nigiri (fish on rice), and poke bowls made with rice. Please note that soy sauce naturally contains gluten. Always inform our staff about your gluten sensitivity when ordering, as cross-contamination may occur in our kitchen."
        },
        {
            question: "Do you have vegetarian or vegan options?",
            answer: "Yes, we offer several vegetarian and vegan options including cucumber rolls, avocado rolls, vegetable poke bowls, and our Garden Futomaki. We also have vegan gyoza and various veggie inarizushi options. Please inform our staff about your dietary requirements, and we'll be happy to guide you through our plant-based selections."
        },
        {
            question: "Are there any allergens in your food?",
            answer: "Our menu contains common allergens including fish, shellfish, soy, sesame, eggs, and gluten. Some items may contain traces of nuts. We take allergies seriously—please inform our staff of any dietary restrictions or allergies when ordering, and we'll provide detailed information about specific dishes and take appropriate precautions where possible."
        },
        {
            question: "Is your fish fresh?",
            answer: "Absolutely! We source high-quality, fresh fish daily to ensure the best taste and quality in our sushi and poke bowls. Our commitment to freshness is what makes every dish special."
        },
        {
            question: "Can I make reservations or book for large groups?",
            answer: "We operate primarily on a walk-in basis for regular dining. However, for large groups or special occasions, please contact us through our social media channels (Instagram or Facebook) and we'll do our best to accommodate your needs."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept cash, all major credit and debit cards, and contactless payments including Apple Pay and Google Pay."
        },
        {
            question: "Where can I park?",
            answer: "Parking is available at Market Hall Car Park on Front Street. There's also loading-only parking directly in front of the restaurant for quick pickups."
        },
        {
            question: "How can I stay updated on daily specials?",
            answer: "Follow us on Instagram (@kira_sushi_and_poke) and Facebook! We post our daily specials, new menu items, promotional offers, and behind-the-scenes content regularly."
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Generate FAQ Schema for SEO
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema)
                }}
            />
            <div className="py-8 md:py-12 px-5 md:px-10 max-w-4xl mx-auto">
                <h1 className="text-2xl md:text-4xl font-bold mb-4 text-hot-pink text-center">
                    FAQ | Kira Sushi & Poke
                </h1>
                <p className="text-center text-gray-600 mb-8">
                    Find answers about our gluten-free sashimi, vegan poke bowls, opening hours, allergen information, and everything else you need to know about dining at Kira Sushi and Poke in Chester-le-Street.
                </p>

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

                {/* Contact CTA */}
                <div className="mt-12 bg-yellow/10 border-2 border-yellow rounded-lg p-6 text-center">
                    <h2 className="text-2xl font-bold text-hot-pink mb-3">
                        Still have questions?
                    </h2>
                    <p className="text-gray-700 mb-4">
                        We're here to help! Get in touch with us through social media for quick responses.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a 
                            href="https://www.instagram.com/kira_sushi_and_poke" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-hot-pink text-white px-6 py-3 rounded-lg hover:bg-yellow transition-colors font-bold"
                        >
                            <i className="fab fa-instagram mr-2"></i>
                            Instagram
                        </a>
                        <a 
                            href="https://www.facebook.com/people/Kira-Sushi-Poke/61583413766423/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-hot-pink text-white px-6 py-3 rounded-lg hover:bg-yellow transition-colors font-bold"
                        >
                            <i className="fab fa-facebook mr-2"></i>
                            Facebook
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FAQPage;
