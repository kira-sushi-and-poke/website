import AboutUs from '../components/AboutUs';

const HomePage = () => {
    return (
        <div>
            {/* Work in Progress Notice */}
            <div className="bg-yellow py-3 px-8 text-center border-b-4 border-hot-pink">
                <p className="text-lg font-semibold text-white">
                    🚧 Website Under Construction - Work in Progress 🚧
                </p>
            </div>
            
            <div className="bg-white py-16 px-8 text-center border-b-8 border-hot-pink">
                <h1 className="text-4xl md:text-5xl font-bold text-hot-pink">
                    Welcome to Kira - Sushi & Poke!
                </h1>
                <p className="text-xl mt-4 text-yellow">Experience the flavors that bring joy!</p>
            </div>
            <AboutUs />
        </div>
    );
};

export default HomePage;
