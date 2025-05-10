import { useSelector } from 'react-redux';
import AttendanceSummary from '../../components/UI/AttendanceSummary';

const Layout = ({ children }) => {
    const { user } = useSelector((state) => state.auth);
    return (
        <div>
            <div className="overflow-x-auto h-full space-y-4 mb-10">
                <h1 className="text-xl font-semibold text-green-900 mb-6">Welcome Back, <b className='text-3xl'>{user.userName}</b></h1>
                {/* Attendance Section */}
                <AttendanceSummary />
                {children}
            </div>
        </div>
    )
}

export default Layout