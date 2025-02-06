import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../pages/fireBaseConfig';
import { format } from 'date-fns';
import FoodLoader from './FoodLoader';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const orgId = localStorage.getItem('orgId');

  useEffect(() => {
    console.log('ActivityLog mounted, orgId:', orgId); // Debug log

    const fetchActivities = async () => {
      try {
        console.log('Fetching activities...'); // Debug log
        const chronicleRef = collection(db, 'chronicle');
        const q = query(
          chronicleRef,
          where('orgId', '==', orgId),
          orderBy('timestamp', 'desc'),
          limit(50)
        );

        const querySnapshot = await getDocs(q);
        console.log('Query snapshot:', querySnapshot.size); // Debug log

        const activitiesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Activity data:', data); // Debug log
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate()
          };
        });

        setActivities(activitiesData);
        console.log('Activities set:', activitiesData); // Debug log
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orgId) {
      fetchActivities();
    } else {
      console.log('No orgId found'); // Debug log
      setLoading(false);
    }
  }, [orgId]);

  // Add a debug render log
  console.log('Rendering ActivityLog, loading:', loading, 'activities:', activities);

  const getActivityIcon = (action) => {
    switch (action) {
      case 'order_created':
        return '📝';
      case 'status_update':
        return '🔄';
      default:
        return '📋';
    }
  };

  const getActivityMessage = (activity) => {
    switch (activity.action) {
      case 'order_created':
        return `New order #${activity.details.orderId} created for table ${activity.details.tableNumber} with ${activity.details.items} items`;
      case 'status_update':
        return `Order #${activity.details.orderId} status changed from ${activity.details.oldStatus} to ${activity.details.newStatus}`;
      default:
        return 'Unknown activity';
    }
  };

  if (loading) {
    return (
        <div style={{ marginTop: '100px' }}>
            <FoodLoader/>
        </div>
    );
  }

  if (!orgId) {
    return <div className="p-4">Please log in to view activities.</div>;
  }

  if (activities.length === 0) {
    return <div className="p-4">No activities found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4" style={{ marginTop: '100px' }}>
      <h2 className="text-2xl font-bold mb-6">Activity Log</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl">
                      {getActivityIcon(activity.action)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {getActivityMessage(activity)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {activity.timestamp ? format(activity.timestamp, 'MMM d, yyyy h:mm a') : 'No timestamp'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {activity.userId}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;