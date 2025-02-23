import React, { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Bell, Shield, Guitar as Hospital, Users, BookOpen, AlertCircle, MapPin, ChevronRight, X } from 'lucide-react';

interface Alert {
  id: string | number; // Allow both string (from backend) and number (hardcoded)
  title: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number; // in kilometers
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  description: string;
  preventiveMeasures: string[];
}

interface SymptomReport {
  location: string;
  description: string;
}

// Hardcoded alerts
const initialAlerts: Alert[] = [
  {
    id: 1,
    title: 'Dengue Outbreak Alert',
    location: 'Thiruvananthapuram',
    coordinates: {
      lat: 8.5241,
      lng: 76.9366
    },
    radius: 10,
    severity: 'high',
    timestamp: '2 hours ago',
    description: 'Multiple cases of dengue fever reported in the area. Please take necessary precautions.',
    preventiveMeasures: [
      'Eliminate standing water around homes',
      'Use mosquito nets and repellents',
      'Wear long-sleeved clothes',
      'Keep surroundings clean and free from water containers'
    ]
  },
  {
    id: 2,
    title: 'Water Quality Warning',
    location: 'Kochi',
    coordinates: {
      lat: 9.9312,
      lng: 76.2673
    },
    radius: 5,
    severity: 'medium',
    timestamp: '5 hours ago',
    description: 'Elevated levels of contaminants detected in local water supply.',
    preventiveMeasures: [
      'Boil water before drinking',
      'Use water purifiers',
      'Avoid direct consumption of tap water',
      'Store water in clean containers'
    ]
  },
  {
    id: 3,
    title: 'Leptospirosis Risk',
    location: 'Kozhikode',
    coordinates: {
      lat: 11.2588,
      lng: 75.7804
    },
    radius: 8,
    severity: 'low',
    timestamp: '1 day ago',
    description: 'Increased risk of leptospirosis due to recent flooding.',
    preventiveMeasures: [
      'Wear protective footwear',
      'Avoid wading in flood water',
      'Cover any open wounds',
      'Seek immediate medical attention if symptoms appear'
    ]
  }
];

const educationalContent = [
  {
    id: 1,
    title: 'Understanding Disease Prevention',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400',
    readTime: '5 min read'
  },
  {
    id: 2,
    title: 'Water Safety Guidelines',
    image: 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&w=400',
    readTime: '4 min read'
  },
  {
    id: 3,
    title: 'Proper Hand Hygiene',
    image: 'https://images.unsplash.com/photo-1605622967726-8c1d4c6e9f89?auto=format&fit=crop&w=400',
    readTime: '3 min read'
  }
];

const keralaDistricts = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod'
];

function App() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [nearbyAlerts, setNearbyAlerts] = useState<Alert[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [symptomReport, setSymptomReport] = useState<SymptomReport>({
    location: '',
    description: ''
  });
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>(initialAlerts); // Initialize with hardcoded alerts

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const handleSubmitReport = async () => {
    try {
      // Prepare the data to match the backend's expected format
      const reportData = {
        location: symptomReport.location,
        description: symptomReport.description,
      };

      // Send the symptom report to the backend
      const response = await fetch('http://127.0.0.1:5000/submit-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      // Get the new alert data from the backend
      const newAlert = await response.json();

      // Add the new alert to the existing alerts
      setRecentAlerts(prevAlerts => [...prevAlerts, newAlert]);

      // Reset form and close modal
      setSymptomReport({
        location: '',
        description: ''
      });
      setShowReportModal(false);

      // Optionally, show a success message
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  useEffect(() => {
    // Fetch alerts from the backend
    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/alerts');
        const data = await response.json();
        // Merge hardcoded alerts with fetched alerts
        setRecentAlerts(prevAlerts => [...initialAlerts, ...data]);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts();
  }, []);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);

          // Check which alerts are within radius
          const alerts = recentAlerts.filter(alert => {
            const distance = calculateDistance(
              userPos.lat,
              userPos.lng,
              alert.coordinates.lat,
              alert.coordinates.lng
            );
            return distance <= alert.radius;
          });

          setNearbyAlerts(alerts);

          // Show notifications for nearby alerts
          alerts.forEach(alert => {
            if (Notification.permission === "granted") {
              new Notification(`Health Alert: ${alert.title}`, {
                body: `${alert.description}\nLocation: ${alert.location}`,
                icon: '/notification-icon.png'
              });
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                  new Notification(`Health Alert: ${alert.title}`, {
                    body: `${alert.description}\nLocation: ${alert.location}`,
                    icon: '/notification-icon.png'
                  });
                }
              });
            }
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [recentAlerts]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: 'AIzaSyAjjIn17l-6uyNlZnjOEsZNnzoLGeIWCi0',
      version: 'weekly',
    });

    loader.load().then(() => {
      const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: { lat: 10.8505, lng: 76.2711 }, // Center of Kerala
        zoom: 8,
      });

      // Add markers for alerts
      recentAlerts.forEach(alert => {
        const marker = new google.maps.Marker({
          position: alert.coordinates,
          map,
          title: alert.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: alert.severity === 'high' ? '#ef4444' : 
                      alert.severity === 'medium' ? '#f59e0b' : '#22c55e',
            fillOpacity: 0.7,
            strokeWeight: 1,
            scale: 8
          }
        });

        // Add circle for radius
        new google.maps.Circle({
          map,
          center: alert.coordinates,
          radius: alert.radius * 1000, // Convert km to meters
          fillColor: alert.severity === 'high' ? '#ef4444' : 
                    alert.severity === 'medium' ? '#f59e0b' : '#22c55e',
          fillOpacity: 0.1,
          strokeColor: alert.severity === 'high' ? '#ef4444' : 
                      alert.severity === 'medium' ? '#f59e0b' : '#22c55e',
          strokeWeight: 1
        });

        marker.addListener('click', () => {
          setSelectedAlert(alert);
        });
      });

      // Add user location marker if available
      if (userLocation) {
        new google.maps.Marker({
          position: userLocation,
          map,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#3b82f6',
            fillOpacity: 0.7,
            strokeWeight: 1,
            scale: 8
          }
        });
      }

      setMapLoaded(true);
    });
  }, [userLocation, recentAlerts]);  // Depend on recentAlerts

  return (
    <div className="min-h-screen bg-gray-50">
    

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Health Resources Map</h2>
                <p className="text-sm text-gray-500">View alerts and health facilities near you</p>
              </div>
              <div id="map" className="h-[400px] w-full"></div>
            </div>

            {/* Educational Content */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Educational Resources</h2>
                <p className="text-sm text-gray-500">Learn about health and prevention</p>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {educationalContent.map(content => (
                  <div key={content.id} className="group cursor-pointer">
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <img
                        src={content.image}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{content.title}</h3>
                    <p className="text-sm text-gray-500">{content.readTime}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100">
                    <Bell className="h-6 w-6 text-blue-600" />
                    <span className="ml-2 text-sm font-medium text-blue-900">Alerts</span>
                  </button>
                  <button className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100">
                    <Shield className="h-6 w-6 text-green-600" />
                    <span className="ml-2 text-sm font-medium text-green-900">Prevention</span>
                  </button>
                  <button className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100">
                    <Hospital className="h-6 w-6 text-purple-600" />
                    <span className="ml-2 text-sm font-medium text-purple-900">Resources</span>
                  </button>
                  <button className="flex items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100">
                    <Users className="h-6 w-6 text-orange-600" />
                    <span className="ml-2 text-sm font-medium text-orange-900">Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
                {nearbyAlerts.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    {nearbyAlerts.length} alert(s) in your area
                  </p>
                )}
              </div>
              <div className="divide-y divide-gray-200">
                {recentAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <MapPin className={`h-5 w-5 ${
                          alert.severity === 'high' ? 'text-red-500' :
                          alert.severity === 'medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-gray-500">{alert.location}</p>
                        <p className="mt-1 text-xs text-gray-400">{alert.timestamp}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Symptoms */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900">Report Symptoms</h2>
                <p className="mt-1 text-sm text-gray-500">Help us track disease spread anonymously</p>
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{selectedAlert.title}</h2>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className={`h-5 w-5 ${
                    selectedAlert.severity === 'high' ? 'text-red-500' :
                    selectedAlert.severity === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`} />
                  <span className="ml-2 text-sm text-gray-500">{selectedAlert.location}</span>
                </div>

                <div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedAlert.severity === 'high' ? 'bg-red-100 text-red-800' :
                    selectedAlert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)} Severity
                  </div>
                </div>

                <p className="text-gray-600">{selectedAlert.description}</p>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Preventive Measures:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedAlert.preventiveMeasures.map((measure, index) => (
                      <li key={index} className="text-gray-600">{measure}</li>
                    ))}
                  </ul>
                </div>

                <p className="text-sm text-gray-500">
                  Alert issued: {selectedAlert.timestamp}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Symptom Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Report Symptoms</h2>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Location Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={symptomReport.location}
                    onChange={(e) => setSymptomReport(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select District</option>
                    {keralaDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    value={symptomReport.description}
                    onChange={(e) => setSymptomReport(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Describe your symptoms or any other relevant information..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;