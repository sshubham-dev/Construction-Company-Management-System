import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../../features/notification/notificationSlice';
import moment from 'moment';
import axios from 'axios';

const Notification = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { seenNotifications, unseenNotifications } = useSelector(state => state.notifications);
  const [activeTab, setActiveTab] = useState('unseen');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchNotifications(user._id));
      const interval = setInterval(() => {
        dispatch(fetchNotifications(user._id));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [dispatch, user]);

  const groupedByDate = (notifications) => {
    return notifications.reduce((acc, curr) => {
      const dateKey = moment(curr.createdAt).format('MMMM YYYY'); // or group by week using 'YYYY-[W]WW'
      acc[dateKey] = acc[dateKey] ? [...acc[dateKey], curr] : [curr];
      return acc;
    }, {});
  };

  const currentList = activeTab === 'unseen' ? unseenNotifications : seenNotifications;
  const grouped = groupedByDate(currentList);
  const handleNotificationClick = async (id) => {
    try {
      await axios.patch(`/api/v1/notification/${user._id}/mark-read/${id}`);
      dispatch(fetchNotifications(user._id));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };


  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('unseen')} className={`px-4 py-2 rounded ${activeTab === 'unseen' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Unseen</button>
        <button onClick={() => setActiveTab('seen')} className={`px-4 py-2 rounded ${activeTab === 'seen' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Seen</button>
      </div>

      {Object.entries(grouped).map(([date, msgs], idx) => (
        <div key={idx} className="mb-6 space-y-3" >
          <h3 className="text-xl font-semibold mb-4">{date}</h3>
          {msgs.map((msg, index) => (
            <div key={index}
              onClick={() => activeTab === 'unseen' && handleNotificationClick(msg._id)}
              className={`cursor-pointer px-3 py-2 rounded-md text-sm text-gray-700 border ${msg.isRead ? 'bg-gray-100' : 'bg-blue-50 hover:bg-blue-100 border-blue-200'}`}
            >
              <div className="font-medium">{msg.title}</div>
              <div>{msg.message}</div>
              <div className="text-xs text-gray-500">{moment(msg.createdAt).format('DD MMM YYYY, hh:mm A')}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Notification;
