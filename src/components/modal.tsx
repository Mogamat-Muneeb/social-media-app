export function Modal({
  title,
  toggleClick,
  children,
}: {
  title: any;
  toggleClick: any;
  children: any;
}) {
  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center w-screen min-h-screen overflow-y-scroll transition-opacity duration-300 bg-black bg-opacity-60 z-[100] ">
        {children}
      </div>
    </div>
  );
}
