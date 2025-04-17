import { Search } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Navbar = async () => {

    return (
        <nav className="w-full h-12 mt-[7px] p-2 bg-gray-200/80 fixed z-50 flex justify-between items-center text-[20px]">
            <p>Logo</p>
            <div className='flex items-center gap-3'>

                <div className='flex gap-5'>
                    <Link className='ul' href={`/`}>Podcasts</Link>
                    <Link className='ul' href={`/trending`}>Trending</Link>
                </div>
                <div className='flex items-center border-black border-[2px] p-[2px] rounded-2xl'>
                    <Search/>
                    <input className='w-[25em] border-[2px] rounded-[15px] border-none text-[18px] p-1 outline-none' type="search" name="query" placeholder='search songs and playlists' />
                </div>
            </div>
            <p>Profile</p>
        </nav>
    )
}

export default Navbar