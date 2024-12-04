import React, {
  useState,
  useCallback,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/userService";
import "./Register.css";
import { RxCross2 } from "react-icons/rx";
import { FaEdit } from "react-icons/fa";

const Register: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [firstname, setFirstname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [birthdate, setBirthdate] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [userGender, setUserGender] = useState<string>("");
  const [preferredGender, setPreferredGender] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [favoriteCategory, setFavoriteCategory] = useState<string>("");
  const [job, setJob] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [passions, setPassions] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>(""); // Add state for image URL
  const [imageFile, setImageFile] = useState<File | null>(null); // Add state for image file
  const navigate = useNavigate();

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const age = calcAge(birthdate);
    const userData = {
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
      imageFile,
    };

    try {
      const response = await registerUser(userData);
      console.log("User registered successfully:", response);
      navigate("/");
    } catch (error) {
      console.error("Error registering user:", error);
      setError("An error occurred during registration.");
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPassion(inputValue);
    }
  };

  const addPassion = (passion: string) => {
    if (passion.trim() !== "" && !passions.includes(passion.trim())) {
      setPassions([...passions, passion.trim()]);
      setInputValue("");
    }
  };

  const removePassion = (passion: string) => {
    setPassions(passions.filter((p) => p !== passion));
  };

  const handleEditClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file); // Set image file
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
      <form id="userForm" className="register-form" onSubmit={handleSubmit}>
        <div className="user-image">
          {imageUrl && <img src={imageUrl} alt="User" className="user-img" />}
          <div className="edit-button-container" onClick={handleEditClick}>
            <FaEdit className="edit-button" />
          </div>
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
            <option value="Burger">Burger</option>
            <option value="Glaces">Glaces</option>
            <option value="Boissons">Boissons</option>
            <option value="Fast Food">Fast Food</option>
          </select>
        </label>
        <label htmlFor="passionInput">Quels sont vos passions?</label>
        <textarea
          id="passionInput"
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
            <label>
              Homme
              <input
                type="radio"
                name="userGender"
                value="homme"
                onChange={(e) => setUserGender(e.target.value)}
                required
              />
            </label>
            <label>
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
            <label>
              Homme
              <input
                type="radio"
                name="preferredGender"
                value="homme"
                onChange={(e) => setPreferredGender(e.target.value)}
                required
              />
            </label>
            <label>
              Femme
              <input
                type="radio"
                name="preferredGender"
                value="femme"
                onChange={(e) => setPreferredGender(e.target.value)}
                required
              />
            </label>
            <label>
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

        {error && <p className="error">{error}</p>}
        <button type="submit">Créer un compte</button>
      </form>
    </div>
  );
};

export default Register;