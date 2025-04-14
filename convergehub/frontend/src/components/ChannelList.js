import React, { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import dynamicIconImports from "lucide-react/dynamicIconImports";

const fallback = <div style={{ background: "#ddd", width: 18, height: 18 }} />;

const menuItems = [
  { title: " Direct Messages", iconName: "message-circle-more", path: "chat" },
  { title: " Collaborative Editor", iconName: "file-text", path: "/editor" },
  { title: " File Sharing", iconName: "folder", path: "/file-sharing" },
  { title: " Task Management", iconName: "check-square", path: "/tasks" },
  { title: " Support & Help Desk", iconName: "life-buoy", path: "/support" },
];

function ChannelList() {
  return (
    <aside className="h-screen max-w-[240px] bg-[#F1F2F7]">
      <nav className="p-4 md:p-5">
        <SidebarSection title="CHANNELS" items={menuItems} />
      </nav>
    </aside>
  );
}

function SidebarSection({ title, items }) {
  return (
    <>
      <h3 className="mx-5 mb-3 mt-10 text-sm font-semibold text-[#4A4E74] tracking-wide">
        {title}
      </h3>
      {items.map((item, index) => (
        <SidebarItem
          key={index}
          title={item.title}
          iconName={item.iconName}
          path={item.path}
        />
      ))}
    </>
  );
}

function SidebarItem({ title, iconName, path }) {
  const Icon = lazy(dynamicIconImports[iconName]);
  const navigate = useNavigate();

  return (
    <a
      onClick={() => navigate(path)}
      className="group flex cursor-pointer items-center gap-3 rounded px-4 py-3 text-sm text-[#4A4E74] transition-all duration-300 hover:bg-[#DEE1F4] hover:text-[#5A6ACF]"
    >
      <Suspense fallback={fallback}>
        <Icon
          size={18}
          className="text-[#5A5F8C] transition-all duration-300 group-hover:text-[#5A6ACF]"
        />
      </Suspense>
      <span>{title}</span>
    </a>
  );
}

export default ChannelList;
