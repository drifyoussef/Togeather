import React from 'react'
import { UserModel } from '../../models/User.model'

interface BannedProps {
  user: UserModel
}

export default function Banned({user}: BannedProps) {

    const redirectToHome = () => {
        window.location.href = '/banned';
    }
    
  return (
    <div>
        <div>Vous avez été banni pour {user.banReason}, vous serez débanni le {user.banEnd.toLocaleDateString()}</div>
        <p>Vous pouvez envoyer une demande de débanissement à imredzcsgo@gmail.com</p>
        <button onClick={redirectToHome}>Retourner à l'accueil</button>
    </div>
  )
}
