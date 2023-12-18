"use client"
import { signOut } from "next-auth/react"
import React from "react"

const Home = () => {
  return (
    <div>
      <button onClick={() => signOut({ callbackUrl: "/login" })}>
        Log out
      </button>
    </div>
  )
}

export default Home
