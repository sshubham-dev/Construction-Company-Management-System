import { useSelector } from "react-redux";
import Attendance from "../../components/UI/Attendance";
import ProfileCard from "../../components/UI/ProfileCard";
import Approvals from "../../components/UI/Approvals";
import Performance from "../../components/UI/Performance";
import { useState } from "react";
import Section from "../../components/UI/Section";
import Actions from "../../components/UI/Actions";

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [showApprovals, setShowApprovals] = useState(false);
  return (
    <div className="space-y-6">
      <ProfileCard
        name={user?.userName}
        role={user?.department}
        avatar={user?.avatar}
      />
      <Attendance />
      {user?.department !== "Ceo" && <Performance />}
      <Approvals
        setShowApprovals={setShowApprovals}
        showApprovals={showApprovals}
      />
      {children}
      <Section title="General Action">
        <Actions role={user?.department} />
      </Section>
    </div>
  );
};

export default Layout;
