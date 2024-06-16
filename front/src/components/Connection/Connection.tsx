import React from 'react'
import './Connection.css'
import { FaLocationDot } from "react-icons/fa6";


export default function Connexion() {
  return (
    <div className='div-container-connection'>
      <div className="top-container">
        <p className="p1-connection">Let's eat together</p>
        <p className="p2-connection">Mangeons ensemble</p>
      </div>
      <div className="search-restaurant-container">
        <div className="search-restaurant">
          <FaLocationDot className='icon-location' />
          <p className="find-restaurant">Trouver un restaurant</p>
        </div>
        
      </div>
      <p className='connection'>Se connecter pour rencontrer des gens</p>
    </div>
  )
}
