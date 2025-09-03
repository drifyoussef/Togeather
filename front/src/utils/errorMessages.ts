/* TypeScript module for error messages */

export const errorMessages = {
  // Erreurs de validation
  required: "Ce champ est obligatoire",
  email: "Veuillez entrer une adresse e-mail valide",
  password: "Le mot de passe doit contenir au moins 8 caractères",
  passwordMatch: "Les mots de passe ne correspondent pas",
  minLength: (min: number) => `Ce champ doit contenir au moins ${min} caractères`,
  maxLength: (max: number) => `Ce champ ne peut pas dépasser ${max} caractères`,
  
  // Erreurs d'authentification
  invalidCredentials: "Identifiants incorrects",
  userNotFound: "Utilisateur non trouvé",
  userAlreadyExists: "Cet utilisateur existe déjà",
  tokenExpired: "Votre session a expiré, veuillez vous reconnecter",
  accessDenied: "Accès refusé",
  noTokenFound: "Aucun token trouvé",
  
  // Erreurs réseau
  networkError: "Erreur de connexion. Vérifiez votre connexion internet.",
  serverError: "Erreur du serveur. Veuillez réessayer plus tard.",
  timeoutError: "La requête a pris trop de temps. Veuillez réessayer.",
  
  // Erreurs de formulaire
  formSubmissionError: "Erreur lors de l'envoi du formulaire",
  invalidData: "Données invalides",
  uploadError: "Erreur lors du téléchargement du fichier",
  fileSizeError: "Le fichier est trop volumineux",
  fileTypeError: "Type de fichier non autorisé",
  
  // Erreurs d'inscription
  termsNotAccepted: "Vous devez accepter la politique de confidentialité.",
  ageRestriction: "Vous devez avoir au moins 18 ans pour vous inscrire.",
  profileImageRequired: "Vous devez ajouter une image de profil.",
  registrationError: "Une erreur s'est produite lors de l'inscription.",
  imageUploadError: "Erreur lors du téléchargement de l'image",
  
  // Erreurs de connexion
  loginError: "Erreur lors de la connexion.",
  invalidLoginCredentials: "Email ou mot de passe incorrect",
  emailNotConfirmed: "Votre email n'a pas été confirmé",
  
  // Erreurs génériques
  unexpectedError: "Une erreur inattendue s'est produite",
  tryAgain: "Veuillez réessayer",
  contactSupport: "Contactez le support si le problème persiste",
  
  // Messages de succès
  success: "Opération réussie",
  saved: "Sauvegardé avec succès",
  updated: "Mis à jour avec succès",
  deleted: "Supprimé avec succès",
  
  // Messages d'information
  loading: "Chargement en cours...",
  noData: "Aucune donnée disponible",
  noResults: "Aucun résultat trouvé",
  
  // Erreurs spécifiques à l'application
  noMatches: "Aucun match trouvé",
  messageNotSent: "Message non envoyé",
  profileUpdateError: "Erreur lors de la mise à jour du profil",
  fetchUserDataError: "Erreur lors de la récupération des données utilisateur",
  
  // Erreurs de géolocalisation
  locationError: "Impossible d'obtenir votre localisation",
  locationPermissionDenied: "Autorisation de localisation refusée",
  
  // Erreurs de date
  invalidDate: "Date invalide",
  futureDateError: "La date ne peut pas être dans le futur",
  pastDateError: "La date ne peut pas être dans le passé",
  
  // Erreurs de fichier
  noFileSelected: "Aucun fichier sélectionné",
  
  // Erreurs spécifiques au backend
  userIsBanned: "Utilisateur banni",
  errorRegisteringUser: "Erreur lors de l'enregistrement de l'utilisateur",
  errorFetchingUser: "Erreur lors de la récupération de l'utilisateur",
  errorFetchingUsers: "Erreur lors de la récupération des utilisateurs",
  errorUploadingImage: "Erreur lors du téléchargement de l'image"
};

// Fonction pour traduire les erreurs HTTP
export const translateHttpError = (error: any): string => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return errorMessages.invalidData;
      case 401:
        return errorMessages.accessDenied;
      case 403:
        return errorMessages.accessDenied;
      case 404:
        return errorMessages.userNotFound;
      case 409:
        return errorMessages.userAlreadyExists;
      case 422:
        return errorMessages.invalidData;
      case 500:
        return errorMessages.serverError;
      case 503:
        return errorMessages.serverError;
      default:
        return errorMessages.unexpectedError;
    }
  } else if (error.request) {
    return errorMessages.networkError;
  } else {
    return errorMessages.unexpectedError;
  }
};

// Fonction pour traduire les erreurs de validation
export const translateValidationError = (field: string, rule: string): string => {
  switch (rule) {
    case 'required':
      return errorMessages.required;
    case 'email':
      return errorMessages.email;
    case 'password':
      return errorMessages.password;
    case 'confirm_password':
      return errorMessages.passwordMatch;
    default:
      return errorMessages.invalidData;
  }
};

// Fonction pour traduire les messages d'erreur spécifiques du backend
export const translateBackendError = (errorMessage: string): string => {
  // Mapping des messages d'erreur du backend vers les traductions françaises
  const errorMap: { [key: string]: string } = {
    // Erreurs d'authentification
    "Invalid credentials": errorMessages.invalidCredentials,
    "User not found": errorMessages.userNotFound,
    "User already exists": errorMessages.userAlreadyExists,
    "Token expired": errorMessages.tokenExpired,
    "Access denied": errorMessages.accessDenied,
    "No token found": errorMessages.noTokenFound,
    
    // Erreurs d'inscription
    "Error registering user": errorMessages.registrationError,
    "An error occurred during registration": errorMessages.registrationError,
    "You must accept the privacy policy": errorMessages.termsNotAccepted,
    "You must be at least 18 years old": errorMessages.ageRestriction,
    "Profile image is required": errorMessages.profileImageRequired,
    
    // Erreurs de connexion
    "An error occurred during login": errorMessages.loginError,
    "Login failed": errorMessages.loginError,
    "Invalid email or password": errorMessages.invalidLoginCredentials,
    "Email not confirmed": errorMessages.emailNotConfirmed,
    
    // Erreurs de données utilisateur
    "Failed to fetch user data": errorMessages.fetchUserDataError,
    "An error occurred while fetching user data": errorMessages.fetchUserDataError,
    "Error fetching user": errorMessages.errorFetchingUser,
    "Error fetching users": errorMessages.errorFetchingUsers,
    
    // Erreurs de fichier
    "No file selected": errorMessages.noFileSelected,
    "Error uploading image": errorMessages.imageUploadError,
    
    // Erreurs génériques
    "Network error": errorMessages.networkError,
    "Server error": errorMessages.serverError,
    "Unexpected error": errorMessages.unexpectedError,
  };

  // Chercher une correspondance exacte
  if (errorMap[errorMessage]) {
    return errorMap[errorMessage];
  }

  // Chercher une correspondance partielle (contient le mot-clé)
  for (const [englishMessage, frenchMessage] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(englishMessage.toLowerCase())) {
      return frenchMessage;
    }
  }

  // Si aucune correspondance n'est trouvée, retourner le message original
  return errorMessage;
};
