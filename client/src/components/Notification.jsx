import React, { useEffect, useState, useRef } from 'react';
import { FiBell, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { fetchNotifications } from '../features/notification/notificationSlice';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Notification = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('unseen');
    const dropdownRef = useRef(null); // For outside click
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { seenNotifications, unseenNotifications } = useSelector((state) => state.notifications);

    useEffect(() => {
        if (user?._id) {
            dispatch(fetchNotifications(user._id));
            const interval = setInterval(() => {
                dispatch(fetchNotifications(user._id));
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [dispatch, user?._id]);
    console.log(unseenNotifications)
    // 🟡 Handle outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleDropdown = () => setIsOpen(!isOpen);
    const displayed = (activeTab === 'seen' ? seenNotifications : unseenNotifications)
        .slice() // to avoid mutating the original array
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


    const handleNotificationClick = async (id) => {
        try {
            await axios.patch(`/api/v1/notification/${user._id}/mark-read/${id}`);
            dispatch(fetchNotifications(user._id));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    return (
        <div className="relative top-1" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="relative">
                <FiBell className="text-gray-700" size={20} />
                {unseenNotifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                        {unseenNotifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed sm:absolute right-3 sm:right-0 top-20 sm:top-auto mt-1 md:mt-6 lg:mt-6 xl:mt-6 w-11/12 sm:w-96 bg-white rounded-xl shadow-xl z-50 p-4" >
                    {/* Header with tabs and close icon */}
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('unseen')}
                                className={`px-3 py-1 rounded-full text-sm ${activeTab === 'unseen' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                                Unseen
                            </button>
                            <button
                                onClick={() => setActiveTab('seen')}
                                className={`px-3 py-1 rounded-full text-sm ${activeTab === 'seen' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                                Seen
                            </button>
                        </div>
                        <button onClick={() => setIsOpen(false)}>
                            <FiX size={20} className="text-gray-600 hover:text-red-500" />
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 lg:max-h-80 overflow-y-auto space-y-2 scrollbar-hide py-4">
                        {displayed.length > 0 ? (
                            displayed.map((msg, index) => (
                                <div
                                    key={index}
                                    onClick={() => activeTab === 'unseen' && handleNotificationClick(msg._id)}
                                    className={`cursor-pointer px-3 py-2 rounded-md text-sm text-gray-700 border 
                                        ${msg.isRead ? 'bg-gray-100' : 'bg-blue-50 hover:bg-blue-100 border-blue-200'}`}
                                >
                                    <Link to={msg.link ? msg.link : ''} className="font-semibold">{msg.title}</Link>
                                    <div>{msg.message}</div>
                                    <div className="text-xs text-gray-500">
                                        {moment(msg.createdAt).format('DD MMM, YYYY')}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 text-sm">
                                No {activeTab} messages
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            navigate('/notifications'); // or use React Router's useNavigate
                        }}
                        className="w-full text-center text-blue-600 hover:underline mt-3 text-sm"
                    >
                        Show More
                    </button>
                </div>
            )}
        </div>
    );
};

export default Notification;



// a report recording the work and payment the do include - client name, option dwg start date, option dwg compelte date, working dwg start date, working complete date, 3d view start, 3d view complete, sanction start date, sanction complete date, service dwg start date, service dwg complete date and payment received with date for that client