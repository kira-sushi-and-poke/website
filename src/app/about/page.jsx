import React from "react";
import AboutUs from "@/components/AboutUs";
import Reviews from "@/components/Reviews";

export const metadata = {
    title: "About Us | Our Story & Mission",
    description: "Learn about Kira Sushi and Poke's commitment to serving fresh, authentic Japanese cuisine in Chester-le-Street. Discover our story, values, and what makes us special.",
    openGraph: {
        title: "About Kira Sushi and Poke",
        description: "Discover our passion for fresh Japanese sushi and poke bowls in Chester-le-Street",
    }
};

const AboutPage = () => {
    return (
        <div className="p-5">
            <AboutUs />
            <Reviews />
        </div>
    );
};

export default AboutPage;
