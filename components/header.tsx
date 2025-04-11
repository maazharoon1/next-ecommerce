'use client'

import { ClerkLoaded, SignedIn, SignInButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import Form from 'next/form';
import { TrolleyIcon } from '@sanity/icons'
import { PackageIcon } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import useBasketStore from "@/store/store";

const Header = () => {
    const {user} = useUser()
    const totalItems = useBasketStore((state) => 
    state.items.reduce((total, item) => total + item.quantity, 0)
    );
    

    const createClerkPasskey = async () => {
    try{
      await user?.createPasskey()
      
    } catch (error) {
      console.error("error ", JSON.stringify(error,null,2))
    }
    }

      return (
    <header className="flex justify-between items-center flex-wrap px-4 py-2 ">
      <div className="flex flex-wrap justify-between items-center w-full">
        <Link href='/'
        className="text-2xl font-bold text-blue-500 hover:opacity-50 mx-auto sm:mx-0"
        >
          Denove  
        </Link>
        <Form
         action="/search"
        className=" sm:w-auto sm:flex-1 sm:mx-4 mt-2 sm:mt-0"
       
        >
      <input name="query"  placeholder="Search for products"
      className="bg-gray-100 text-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 border w-[90%] max-w-4xl  "
       />
      {/* <button type="submit">Submit</button> */}
    </Form>
    <div className="flex items-center space-x-4 mt-4 sm:mt-0 flex-1 sm:flex-none"> 
      <Link href='/basket'
      className="flex-1 relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
      <TrolleyIcon className="w-6 h-6"/>

      {totalItems > 0 ?
      <span className="absolute -top-2 -right-4 bg-red-500 text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-xs">
        {totalItems > 99 ? '99+' : totalItems} 
      </span> : null}
      <span className="text-xs sm:text-base">My Basket</span>
      </Link>

    <ClerkLoaded>
     <SignedIn>
      
<Link href="/orders"
    className="flex-1 relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"> 
    <PackageIcon className="w-6 h-6"/>
    <span>My Orders</span>
    </Link>

    </SignedIn>
    {user ? 
    <div className="flex items-center space-x-4">
      <UserButton/>
      <div className="hidden sm:block text-xs">
      <p className=" text-gray-400">Welcome Back</p>
      <p className=" font-bold">{user.fullName}!</p>
      </div>
  
     </div>
    
      : <><SignInButton mode='modal'/></>}

   {user?.passkeys.length === 0 && (
    <button onClick={createClerkPasskey} 
    className="hidden sm:block bg-white hover:bg-blue-700 hover:text-white animate-pulse text-blue-500 font-bold py-2 px-4 rounded border border-blue-300"
    >
      Create passkey 
    </button>
   )}

    </ClerkLoaded>
    </div>
      </div>
    </header>
  )
}

export default Header
