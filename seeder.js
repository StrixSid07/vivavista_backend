const mongoose = require('mongoose');
const Deal = require('./models/Deal');
const Hotel = require('./models/Hotel');
const Destination = require('./models/Destination');
const Blog = require('./models/Blog');
const Review = require('./models/Review');
const Newsletter = require('./models/Newsletter');

mongoose.connect('mongodb://localhost:27017/viva-vista', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const seedData = async () => {
    try {
        // Clear existing data
        await Deal.deleteMany({});
        await Hotel.deleteMany({});
        await Destination.deleteMany({});
        await Blog.deleteMany({});
        await Review.deleteMany({});
        await Newsletter.deleteMany({});

        // Insert Destinations
        const destinations = await Destination.insertMany([
            { name: 'Maldives', country: 'Maldives', image: 'maldives.jpg', isPopular: true },
            { name: 'Dubai', country: 'UAE', image: 'dubai.jpg', isPopular: true },
            { name: 'Paris', country: 'France', image: 'paris.jpg', isPopular: true },
            { name: 'Bangkok', country: 'Thailand', image: 'bangkok.jpg', isPopular: true },
            { name: 'New York', country: 'USA', image: 'newyork.jpg', isPopular: true }
        ]);

        // Create a destination mapping for easy lookup
        const destinationMap = {};
        destinations.forEach(dest => destinationMap[dest.name] = dest._id);

        // Insert Hotels
        const hotels = await Hotel.insertMany([
            { name: 'Luxury Beach Resort', location: 'Maldives', locationId: '1', tripAdvisorRating: 4.8 },
            { name: 'Downtown Dubai Hotel', location: 'Dubai', locationId: '2', tripAdvisorRating: 4.6 },
            { name: 'Eiffel Tower View Hotel', location: 'Paris', locationId: '3', tripAdvisorRating: 4.7 }
        ]);

        // Map hotels by name for quick lookup
        const hotelMap = {};
        hotels.forEach(hotel => hotelMap[hotel.name] = hotel._id);

        // Insert Deals (Now with Destination)
        const deals = await Deal.insertMany([
            {
                title: 'Maldives Luxury Escape',
                description: 'Enjoy 5 nights in a beachfront villa with all-inclusive meals.',
                images: ['maldives-deal.jpg'],
                availableCountries: ['UK', 'USA', 'Canada'],
                destination: destinationMap['Maldives'],
                prices: [
                    {
                        country: 'UK',
                        airport: 'LHR',
                        hotel: hotelMap['Luxury Beach Resort'],
                        date: new Date('2025-06-15'),
                        price: 1500,
                        flightDetails: {
                            outbound: { departureTime: '14:00', arrivalTime: '19:30', airline: 'British Airways', flightNumber: 'BA123' },
                            returnFlight: { departureTime: '21:00', arrivalTime: '02:30', airline: 'British Airways', flightNumber: 'BA456' }
                        }
                    }
                ],
                hotels: [hotelMap['Luxury Beach Resort']],
                boardBasis: 'All Inclusive',
                isTopDeal: true,
                distanceToCenter: '500m',
                distanceToBeach: '100m'
            },
            {
                title: 'Dubai City Break',
                description: 'Explore Dubai with a 4-night stay in a luxury downtown hotel.',
                images: ['dubai-deal.jpg'],
                availableCountries: ['UK', 'USA'],
                destination: destinationMap['Dubai'],
                prices: [
                    {
                        country: 'USA',
                        airport: 'JFK',
                        hotel: hotelMap['Downtown Dubai Hotel'],
                        date: new Date('2025-07-20'),
                        price: 1200,
                        flightDetails: {
                            outbound: { departureTime: '10:00', arrivalTime: '20:00', airline: 'Emirates', flightNumber: 'EK202' },
                            returnFlight: { departureTime: '22:00', arrivalTime: '08:00', airline: 'Emirates', flightNumber: 'EK203' }
                        }
                    }
                ],
                hotels: [hotelMap['Downtown Dubai Hotel']],
                boardBasis: 'Full Board',
                isTopDeal: false,
                distanceToCenter: '1km',
                distanceToBeach: '5km'
            }
        ]);

        console.log("✅ Data Seeded Successfully!");
    } catch (error) {
        console.error("❌ Error seeding data: ", error);
    } finally {
        mongoose.connection.close();
    }
};

seedData();
