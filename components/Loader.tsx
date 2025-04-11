import React from 'react'

function Loader() {
  return (
    <>
      <div className='flex items-center justify-center h-screen'>
        <div className='animate-spin rounded-full w-32 h-32 border-b-2 border-blue-500 '></div>
      </div>
    </>
  )
}

export default Loader
