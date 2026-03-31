// Centralized review data for Kira Sushi & Poke
// Used by both Reviews.jsx (grid layout) and CarouselReviews.jsx (carousel)

export const reviews = {
    google: [],
    facebook: [
        {
            id: 4,
            name: "Rubee Mellon",
            rating: 5,
            comment: "They are lovely people. Their sushi menu is creative and not just what everyone else would offer. The food is fresh and incredibly tasty. I would definitely recommend that everyone pay them a visit :)",
            date: "21 Mar 2026",
            platform: "facebook"
        },
        {
            id: 8,
            name: "Craig Birkett",
            rating: 5,
            comment: "High quality sushi made to order. Their signature Kira Rolls were phenomenal and the Salmon Teriyaki bowl a generous portion. Super fresh ingredients and friendly staff. Makes the high street a better place! Hope it succeeds.",
            date: "4 Mar 2026",
            platform: "facebook"
        },
        {
            id: 9,
            name: "Caroline Jones",
            rating: 5,
            comment: "We had the chicken katsu and the chicken dumplings. It was totes delish and generous portions, 10/10!",
            date: "17 Mar 2026",
            platform: "facebook"
        },
        {
            id: 6,
            name: "Rosie Martin",
            rating: 5,
            comment: "Absolutely stunning sushi....I got Kira and best sushi I've ever tasted.....staff so welcoming and highly recommend to everyone x",
            date: "20 Jan 2026",
            platform: "facebook"
        },
        {
            id: 7,
            name: "Alana Chipchase",
            rating: 5,
            comment: "100% recommend the katsu chicken curry fresh ingredients super tasty 👌🏻 will be back again ! Xx",
            date: "10 Jan 2026",
            platform: "facebook"
        },
        {
            id: 11,
            name: "Emma Louise Lee",
            rating: 5,
            comment: "This place is just amazing, the food is beautiful and so carefully prepared with such attention to detail! I will definitely be back! 100% recommend! Xx",
            date: "21 Mar 2026",
            platform: "facebook"
        }
    ],
    tripadvisor: [
        {
            id: 10,
            name: "Matt T",
            comment: "Some of the best sushi I have ever had and I mean that with no exaggeration! The presentation was incredible. Would certainly recommend!",
            rating: 5,
            date: "27 Mar 2026",
            platform: "tripadvisor"
        },
        {
            id: 5,
            name: "StevefromWashington",
            rating: 5,
            comment: "Excellent fresh sushi and very tasty chicken katsu curry. Top quality food at sensible prices.",
            date: "28 Feb 2026",
            platform: "tripadvisor"
        }
    ]
};

// Flattened array of all reviews for easy iteration, sorted by date (newest first)
export const allReviews = [...reviews.google, ...reviews.facebook, ...reviews.tripadvisor].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA; // Descending order (newest first)
});

// Helper function to get platform icon class
export const getPlatformIcon = (platform) => {
    switch(platform) {
        case "google": return "fa-google";
        case "facebook": return "fa-facebook";
        case "tripadvisor": return "fa-kiwi-bird";
        default: return "fa-star";
    }
};

// Helper function to get platform color class
export const getPlatformColor = (platform) => {
    switch(platform) {
        case "google": return "text-blue-600";
        case "facebook": return "text-blue-700";
        case "tripadvisor": return "text-green-600";
        default: return "text-hot-pink";
    }
};
