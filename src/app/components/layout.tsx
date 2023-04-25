import './globals.css'

const RootLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <div className='px-2 py-3 flex-col text-center'>{children}</div>
  )
}
export default RootLayout;