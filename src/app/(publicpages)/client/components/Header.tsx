type HeaderProps = {
  children?: React.ReactNode;
};

export default function Header({ children }: HeaderProps) {
  return (
    <div
      className="relative h-[500px] w-full rounded-b-3xl overflow-hidden"
      style={{
        backgroundImage: `url(/images/wallpaper-6.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-sky-900/50" /> {/* overlay */}
      <div className="relative z-10 flex flex-col justify-center h-full px-6">
        {children}
      </div>
    </div>
  );
}
