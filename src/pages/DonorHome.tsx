import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, TrendingUp, Award, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DonorHome = () => {
  const navigate = useNavigate();

  interface DonorData {
    full_name: string;
    totalDonations: number;
    itemsDonated: number;
    lastDonation: string;
    impactScore: number;
    recentDonations: { month: string; items: number }[];
  }

  interface ChartData {
    month: string;
    items: number;
  }

  const [donorData, setDonorData] = useState<DonorData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  useEffect(() => {
    const requestLocation = () => {
      if (navigator.geolocation) {
        setShowLocationPrompt(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setShowLocationPrompt(false);
            // You can send location to backend here if needed
            console.log('Location obtained:', position.coords);
          },
          (err) => {
            setLocationError('Location access was denied or unavailable');
            setShowLocationPrompt(false);
            console.error('Error getting location:', err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        setLocationError('Geolocation is not supported by your browser');
      }
    };

    // Request location after a slight delay to allow page to load
    const locationTimer = setTimeout(requestLocation, 1000);

    const fetchDonorData = async () => {
      try {
        const donorId = localStorage.getItem('donor_id');
        if (!donorId) {
          throw new Error('Donor ID not found in local storage');
        }

        const response = await axios.get(
          `https://classical-lorinda-blaaaaug-8f2c0766.koyeb.app/donordetails?donor_id=${donorId}`
        );
        setDonorData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch donor data');
      } finally {
        setLoading(false);
      }
    };

    const fetchDonationHistory = async () => {
      try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        
        const dummyData = months.map((month, index) => ({
          month: `${month} ${currentYear}`,
          items: Math.floor(Math.random() * 50) + 10
        }));

        setChartData(dummyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch donation history');
      }
    };

    fetchDonorData();
    fetchDonationHistory();

    return () => clearTimeout(locationTimer);
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  if (!donorData) {
    return <div className="text-center mt-10 text-lg text-red-500">No donor data available.</div>;
  }

  const { full_name, totalDonations, itemsDonated, lastDonation, impactScore } = donorData;
  const maxItems = Math.max(...chartData.map((d) => d.items), 1);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Location Permission Modal */}
      {showLocationPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center mb-4">
              <MapPin className="h-8 w-8 text-rose-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Enable Location Services</h3>
            </div>
            <p className="text-gray-600 mb-6">
              To help you find nearby donation centers and track your impact, we'd like to access your location. 
              Please allow location permissions in your browser.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowLocationPrompt(false)}
                className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100"
              >
                Not Now
              </button>
              <button 
                onClick={() => window.location.reload()} // Refresh to trigger permission prompt again
                className="px-4 py-2 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600"
              >
                Allow Location
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Location status */}
        {locationError && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            {locationError} - Some location-based features may not be available
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl shadow-xl p-4 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome back, {full_name}!</h1>
              <p className="text-rose-100">
                {location ? (
                  `We've found donation centers near you (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
                ) : (
                  'Your generosity continues to make a difference in our community.'
                )}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/donateitems')}
                className="bg-white text-rose-600 px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all text-sm md:text-base"
              >
                Make a Donation
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/History')}
                className="bg-white text-rose-600 px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all text-sm md:text-base"
              >
                History
              </motion.button>
            </div>
          </div>
        </div>

        {error && <div className="text-center mb-4 text-red-500">{error}</div>}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { icon: Package, label: 'Total Donations', value: totalDonations },
            { icon: TrendingUp, label: 'Items Donated', value: itemsDonated },
            {
              icon: Calendar,
              label: 'Last Donation',
              value: lastDonation !== 'N/A' ? new Date(lastDonation).toLocaleDateString() : 'N/A',
            },
            { icon: Award, label: 'Impact Score', value: impactScore },
          ].map(({ icon: Icon, label, value }, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center">
                <Icon className="h-8 w-8 text-rose-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Full Width Animated Wave Chart */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-6 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Donation Impact Over Time</h2>
          <div className="h-64 w-full flex items-end">
            {Array.from({ length: 30 }).map((_, index) => {
              const height = 20 + Math.sin(index * 0.5) * 15 + Math.random() * 10;
              return (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ 
                    height: `${height}%`,
                    transition: {
                      delay: index * 0.05,
                      duration: 0.5,
                      type: 'spring',
                      damping: 10
                    }
                  }}
                  className="flex-1 max-w-[16px] bg-gradient-to-t from-rose-300 to-rose-500 rounded-t-full mx-auto"
                  style={{ originY: 1 }}
                  whileHover={{ 
                    height: `${height + 20}%`,
                    transition: { duration: 0.2 }
                  }}
                />
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DonorHome;