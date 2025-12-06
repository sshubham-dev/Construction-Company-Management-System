export default function ProfileCard({image, name, role, reportingTo, avatar}) {
  return (
        <div className="backdrop-blur-md p-4 rounded-2xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center gap-4 text-white">
          <img
            src={avatar ? avatar : "https://www.w3schools.com/howto/img_avatar.png"}
            alt="Profile"
            className="w-14 h-16 rounded-full border-2 border-white shadow-md"
          />
          <div>
            <h2 className="font-semibold text-xl">{name}</h2>
            <p className="text-sm opacity-80">{role}</p>
            <p className="text-sm opacity-80">{reportingTo}</p>
          </div>
        </div>
  );
}
