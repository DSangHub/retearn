import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Retern.app | Delivered to your door. Returned from your door.", description: "Take the errand out of online returns. Customer, driver and merchant accounts for doorstep pickup." };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
