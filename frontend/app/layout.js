import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'EcoConnect',
  description: 'Connecting waste collectors with communities',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
