import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../pages/fireBaseConfig';
import { format } from 'date-fns';

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
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <div className="ml-2">Loading activities...</div>
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
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Activity Log</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{getActivityIcon(activity.action)}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{getActivityMessage(activity)}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {activity.timestamp ? format(activity.timestamp, 'MMM d, yyyy h:mm a') : 'No timestamp'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">By {activity.userId}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;