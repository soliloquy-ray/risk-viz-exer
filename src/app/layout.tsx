import './globals.css'

export const metadata = {
  title: 'Climate Risk Thinking',
  description: 'Solve Problems',
}

const RootLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
export default RootLayout;