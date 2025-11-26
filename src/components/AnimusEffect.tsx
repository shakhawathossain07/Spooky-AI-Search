export default function AnimusEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-5">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-spooky-blue to-transparent opacity-50 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-spooky-purple to-transparent opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  )
}
