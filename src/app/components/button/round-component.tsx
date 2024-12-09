interface RoundComponentProps {
  children: React.ReactNode
}

const RoundComponent = ({ children }: RoundComponentProps) => (
  <div className="p-1"><span className={`px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-black`}>
    {children}
  </span></div>
)

export default RoundComponent