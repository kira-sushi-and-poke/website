import React from "react";

const ContactUs = () => {
    return (
        <div className="bg-white border-2 border-hot-pink rounded-lg p-4 md:p-6">
            <div className="bg-yellow/10 border-l-4 border-yellow p-4 mb-4">
                <p className="font-semibold text-gray-800">
                    <i className="fas fa-star text-yellow mr-2"></i>
                    Social media is the fastest way to reach us!
                </p>
            </div>
            <p className="text-gray-700 mb-4">
                Connect with us for daily specials, updates, and quick responses to your questions.
            </p>
            <div className="space-y-3 mb-6">
                <a 
                    href="https://www.instagram.com/kira_sushi_and_poke" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border-2 border-hot-pink rounded-lg hover:bg-hot-pink hover:text-white transition-all group"
                >
                    <i className="fab fa-instagram text-3xl text-hot-pink group-hover:text-white"></i>
                    <div>
                        <p className="font-bold">Instagram</p>
                        <p className="text-sm opacity-75">@kira_sushi_and_poke</p>
                    </div>
                </a>
                <a 
                    href="https://www.facebook.com/people/Kira-Sushi-Poke/61583413766423/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border-2 border-hot-pink rounded-lg hover:bg-hot-pink hover:text-white transition-all group"
                >
                    <i className="fab fa-facebook text-3xl text-hot-pink group-hover:text-white"></i>
                    <div>
                        <p className="font-bold">Facebook</p>
                        <p className="text-sm opacity-75">Kira Sushi Poke</p>
                    </div>
                </a>
            </div>

            <div className="border-t-2 border-hot-pink/20 pt-4 space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-hot-pink mb-2">Email</h3>
                    <p className="text-gray-700 italic">
                        Coming soon
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-hot-pink mb-2">Reservations</h3>
                    <p className="text-gray-700">
                        Walk-ins welcome! We operate primarily as a dine-in restaurant. For large groups or special arrangements, please contact us through social media.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
