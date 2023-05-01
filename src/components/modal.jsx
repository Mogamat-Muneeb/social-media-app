export function Modal({ title, toggleClick, children }) {
  return (
    <div onClick={toggleClick}>
      <div className="fixed inset-0 flex items-center justify-center w-screen min-h-screen overflow-y-scroll transition-opacity duration-300 bg-black bg-opacity-60 ">
        {children}
      </div>
    </div>
  );
}
