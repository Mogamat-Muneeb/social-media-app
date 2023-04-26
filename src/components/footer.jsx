import { useLocation } from "react-router-dom";

export const Footer = () => {
  const pathName = useLocation();
  return (
    <div
      className={`flex items-center justify-center h-20 mt-5 shadow bg-white  ${
        pathName.pathname === "/"
          ? "bottom-0 relative right-0 left-0 "
          : "bottom-0 sticky right-0 left-0"
      }`}
    >
      <p className="hidden md:block">
        ©{new Date().getFullYear()}
        <span className="text-[#ff3040] px-1">Circledop.</span> Made with ❤️ by
        Mog Muneeb Davids
      </p>
      <p className="flex flex-col md:hidden">
        <span className="">
          ©{new Date().getFullYear()}{" "}
          <span className="text-[#ff3040] px-1">Circledop.</span>
        </span>
        <span>Made with ❤️ by Mog Muneeb Davids</span>
      </p>
    </div>
  );
};
