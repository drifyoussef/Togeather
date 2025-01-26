import React, {
  useState,
  useCallback,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { registerUser } from "../../services/userService";
import "./Register.css";
import { RxCross2 } from "react-icons/rx";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

const Register: React.FC = () => {
  const navigate = useNavigate();
  // Ajout des états pour les champs du formulaire
  const [name, setName] = useState<string>("");
  const [firstname, setFirstname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [birthdate, setBirthdate] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [userGender, setUserGender] = useState<string>("");
  const [preferredGender, setPreferredGender] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [favoriteCategory, setFavoriteCategory] = useState<string>("");
  const [job, setJob] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [passions, setPassions] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>(""); // Add state for image URL
  const [imageFile, setImageFile] = useState<File | null>(null); // Add state for image file
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fonction pour calculer l'âge à partir de la date de naissance
  const calcAge = useCallback((birthdate: string): number => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }, []);

  // Upload de l'image de profil
  const handleImageUpload = async (file: File) => {
    //console.log("File :", file);
    if (!file) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Upload l'image API
      const imageResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await imageResponse.json();
      setImageUrl(result.imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Si les conditions ne sont pas acceptées ou l'âge est inférieur à 18 ans ou aucun fichier image n'est sélectionné ne pas soumettre le formulaire
    if (!termsAccepted) {
      setError("Vous devez accepter les conditions d'utilisation.");
      return;
    }
    const age = calcAge(birthdate);
    if (age < 18) {
      setError("Vous devez avoir au moins 18 ans pour vous inscrire.");
      return;
    }

    if (!imageFile) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      // Upload the image first
      const imageResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await imageResponse.json();
      //console.log(result, "result");

      const imageUrl = result.imageUrl;

      // Données utilisateur à envoyer au serveur pour l'incription
      const userData = {
        imageUrl,
        name,
        firstname,
        email,
        age,
        password,
        userGender,
        job,
        preferredGender,
        passions,
        favoriteCategory,
      };

      // Inscription de l'utilisateur
      const response = await registerUser(userData);
      if (response) {
        //console.log("User registered successfully:", response);
        // Rediriger l'utilisateur vers la page de connexion
        navigate("/auth/login");
      } else {
        throw new Error("Error registering user");
      }
    } catch (error) {
      // Gérer les erreurs d'inscription
      console.error("Error registering user:", error);
      setError("An error occurred during registration.");
    }
  };

  // Ouvrir et fermer la modal des conditions d'utilisation
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Gérer le changement de l'input pour la modification des données (RGPD)
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  // Gérer l'appui sur la touche Entrée pour ajouter une passion
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPassion(inputValue);
    }
  };

  // Ajouter une passion à la liste
  const addPassion = (passion: string) => {
    if (passion.trim() !== "" && !passions.includes(passion.trim())) {
      setPassions([...passions, passion.trim()]);
      setInputValue("");
    }
  };

  // Supprimer une passion de la liste
  const removePassion = (passion: string) => {
    setPassions(passions.filter((p) => p !== passion));
  };

  // Gérer le clic sur l'icône d'édition pour importer une image de profil
  const handleEditClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file); // Mise à jour du fichier image
        handleImageUpload(file); // Upload de l'image
        const reader = new FileReader();
        reader.onload = (e: any) => {
          setImageUrl(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  return (
    <div className="div-register">
      <form
        id="userForm"
        className="register-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="profileImage">
          {imageUrl ? (
            <div className="user-img-profile-container">
              <img src={`${process.env.REACT_APP_API_URL}/${imageUrl}`} alt="User" className="user-img-register" />
              <div
                className="edit-button-container-profile"
                onClick={handleEditClick}
              >
                <FaEdit className="edit-button" />
              </div>
            </div>
          ) : (
            <div className="user-img-profile-container">
              <img
                src="https://www.w3schools.com/w3images/avatar2.png"
                alt="default-userimage"
                className="profileImageIcon"
              />
              <div
                className="edit-button-container-profile"
                onClick={handleEditClick}
              >
                <FaEdit className="edit-button" />
              </div>
            </div>
          )}
        </div>
        <div className="name-firstname-div">
          <label>
            Nom:
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Prénom:
            <input
              type="text"
              name="firstname"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="email-password-div">
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Mot de passe:
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <label>
          Date de naissance:
          <input
            type="date"
            name="age"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            required
          />
        </label>
        <label>
          Métier:
          <input
            type="text"
            name="job"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            required
          />
        </label>
        <label>
          Categorie de restaurant préférée:
          <select
            className="favoriteCategory"
            name="favoriteCategory"
            value={favoriteCategory}
            onChange={(e) => setFavoriteCategory(e.target.value)}
            required
          >
            <option value="">
              --Veuillez choisir votre catégorie préférée--
            </option>
            <option value="Asiatique">Asiatique</option>
            <option value="Pizza">Pizza</option>
            <option value="Poulet">Poulet</option>
            <option value="Sandwich">Sandwich</option>
            <option value="Mexicain">Mexicain</option>
            <option value="Burger">Burger</option>
            <option value="Glaces">Glaces</option>
            <option value="Boissons">Boissons</option>
          </select>
        </label>
        <label htmlFor="passionInput">Quels sont vos passions?</label>
        <textarea
          id="passionInput"
          className="passionInput"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Veuillez entrer une passion et appuyer sur Entrer"
        />
        <div id="passionContainer" className="passionContainer">
          {passions.map((passion, index) => (
            <div key={index} className="passionTag">
              {passion}
              <span className="remove" onClick={() => removePassion(passion)}>
                <RxCross2 />
              </span>
            </div>
          ))}
        </div>
        <input type="hidden" name="passions" value={passions.join(",")} />
        <div>
          <p className="genderLabel">Genre:</p>
          <div className="labelInputs">
            <label htmlFor="homme">
              Homme
              <input
                type="radio"
                name="userGender"
                value="homme"
                onChange={(e) => setUserGender(e.target.value)}
                required
              />
            </label>
            <label htmlFor="femme">
              Femme
              <input
                type="radio"
                name="userGender"
                value="femme"
                onChange={(e) => setUserGender(e.target.value)}
                required
              />
            </label>
          </div>
        </div>

        <div>
          <p className="genderLabel">Genre que vous souhaitez voir:</p>
          <div className="labelInputsSeen">
            <label htmlFor="homme">
              Homme
              <input
                type="radio"
                name="preferredGender"
                value="homme"
                onChange={(e) => setPreferredGender(e.target.value)}
                required
              />
            </label>
            <label htmlFor="femme">
              Femme
              <input
                type="radio"
                name="preferredGender"
                value="femme"
                onChange={(e) => setPreferredGender(e.target.value)}
                required
              />
            </label>
            <label htmlFor="both">
              Les deux
              <input
                type="radio"
                name="preferredGender"
                value="both"
                onChange={(e) => setPreferredGender(e.target.value)}
                required
              />
            </label>
          </div>
        </div>

        <div>
          <div className="terms-div">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms" className="accept-terms">
              {" "}
              J'accepte les{" "}
              <span
                onClick={openModal}
                style={{
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                conditions d'utilisation
              </span>
            </label>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit">
          Créer un compte
        </button>
      </form>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Conditions d'utilisation"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "75%",
            height: "75%",
          },
        }}
      >
        <h2>Conditions d'utilisation</h2>
        <div>
          <p>
            Bienvenue sur Togeather. En utilisant
            le site web Togeather, vous acceptez les présentes conditions d'utilisation.
            Veuillez les lire attentivement.
          </p>
          <div>
            <p className="keypoint-terms">1. Collecte et utilisation des données</p>
            <p>
              Lors de l'inscription ou de l'utilisation de nos services, nous
              pouvons collecter les informations suivantes :
            </p>
            <p>
              <span className="data-collected">• Image de profil :</span> utilisée pour personnaliser votre expérience
              et faciliter les interactions avec d'autres utilisateurs.
            </p>
            <p>
              <span className="data-collected">• Nom et prénom :</span> utilisés pour identifier les utilisateurs sur le
              Site.
            </p>
            <p>
              <span className="data-collected">• Email :</span> utilisé pour la communication, la récupération de compte
              et les notifications importantes.
            </p>
            <p>
              <span className="data-collected">• Âge :</span> utilisé pour vérifier l'éligibilité aux services du Site
              et personnaliser l'expérience utilisateur.
            </p>
            <p>
              <span className="data-collected">• Mot de passe :</span> utilisé pour sécuriser l'accès à votre compte. Il
              est crypté et ne peut pas être consulté en clair. En cas de perte
              veuillez envoyer un message au support car il nous n'avons pas encore
              d'outil pour récuperer son mot de passe via un envoi d'email.
            </p>
            <p>
              <span className="data-collected">• Genre :</span> utilisé pour personnaliser les interactions et les
              recommandations.
            </p>
            <p>
              <span className="data-collected">• Emploi :</span> peut être utilisé pour enrichir votre profil
              public ou améliorer les suggestions d'interactions.
            </p>
            <p>
              <span className="data-collected">• Genre préféré :</span> utilisé pour adapter les
              suggestions en fonction de vos préférences.
            </p>
            <p>
              <span className="data-collected">• Passions :</span> utilisées pour faciliter les connexions entre
              utilisateurs partageant des centres d'intérêt communs.
            </p>
            <p>
            <span className="data-collected">• Catégorie favorite :</span> utilisée pour
              personnaliser votre expérience et vos suggestions.
            </p>
          </div>
          <div>
            <p className="keypoint-terms">2. Protection des données personnelles</p>
            <p>
              Nous nous engageons à protéger vos données personnelles
              conformément aux lois en vigueur, notamment le RGPD pour les
              utilisateurs européens. Vos informations ne seront jamais vendues
              à des tiers sans votre consentement explicite.
            </p>
          </div>
          <div>
            <p className="keypoint-terms">3. Responsabilités des utilisateurs</p>
            <p>En utilisant le Togeather, vous vous engagez à :</p>
            <p>
              • Fournir des informations exactes et complètes lors de votre
              inscription.
            </p>
            <p>
              • Respecter les autres utilisateurs et ne pas utiliser Togeather à
              des fins illégales ou nuisibles.
            </p>
            <p>
              • Préserver la confidentialité de vos identifiants de connexion.
            </p>
          </div>
          <div>
            <p className="keypoint-terms">4. Utilisation des services</p>
            <p>
              Nos services sont réservés aux personnes âgées d'au moins 18 ans.
              Toute infraction à cette règle peut entraîner la suspension ou la
              suppression de votre compte.
            </p>
          </div>
          <div>
            <p className="keypoint-terms">5. Limitations de responsabilité</p>
            <p>
              Bien que nous nous efforcions de fournir un service fiable, nous
              ne garantissons pas l'absence d'interruptions ou d'erreurs. En
              aucun cas, nous ne serons responsables des dommages directs ou
              indirects résultant de l'utilisation du site Togeather.
            </p>
          </div>
          <div>
            <p className="keypoint-terms">6. Modification des conditions</p>
            <p>
              Nous nous réservons le droit de modifier les présentes conditions
              d'utilisation à tout moment. Les utilisateurs seront informés de
              tout changement significatif via leur adresse email ou une
              notification sur le site Togeather.
            </p>
          </div>
          <div>
            <p className="keypoint-terms">7. Contact</p>
            <p>
              Pour toute question ou préoccupation concernant ces conditions
              d'utilisation, vous pouvez nous contacter à : imredzcsgo@gmail.com.
            </p>
          </div>
        </div>
        <button onClick={closeModal}>Fermer</button>
      </Modal>
    </div>
  );
};

export default Register;