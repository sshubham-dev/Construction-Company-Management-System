import React from 'react'

const Header = ({ title}) => {
  return (
<div className="mb-8">
  <p className="text-xl md:text-2xl lg:text-2xl xl:text-3xl font-extralight tracking-tight text-slate-900 capitalize">
    {title}
  </p>
</div>
  )
}

export default Header