import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../../features/notification/notificationSlice';
import moment from 'moment';
// import InfiniteScroll from 'react-infinite-scroll-component';

const Notification = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { seenNotifications, unseenNotifications } = useSelector(state => state.notifications);
  const [activeTab, setActiveTab] = useState('unseen');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user?._id) dispatch(fetchNotifications(user._id));
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

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('unseen')} className={`px-4 py-2 rounded ${activeTab === 'unseen' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Unseen</button>
        <button onClick={() => setActiveTab('seen')} className={`px-4 py-2 rounded ${activeTab === 'seen' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Seen</button>
      </div>

      {/* <InfiniteScroll
        dataLength={currentList.length}
        next={() => setPage(prev => prev + 1)} // you’d handle pagination in your backend/API call
        hasMore={true}
        loader={<p className="text-center">Loading...</p>}
      > */}
        {Object.entries(grouped).map(([date, msgs], idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{date}</h3>
            {msgs.map((msg, i) => (
              <div key={i} className="bg-white p-3 rounded shadow mb-2 border">
                <div className="font-medium">{msg.title}</div>
                <div>{msg.message}</div>
                <div className="text-xs text-gray-500">{moment(msg.createdAt).format('DD MMM YYYY, hh:mm A')}</div>
              </div>
            ))}
          </div>
        ))}
      {/* </InfiniteScroll> */}
    </div>
  );
};

export default Notification;
