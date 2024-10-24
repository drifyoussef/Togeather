import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Card from "../Card/Card";
import { BiSolidSushi } from "react-icons/bi";
import { FaPizzaSlice, FaHamburger, FaIceCream, FaHeart } from "react-icons/fa";
import { GiChickenOven, GiTacos } from "react-icons/gi";
import { LuSandwich } from "react-icons/lu";
import { RiDrinks2Fill } from "react-icons/ri";
import { UserModel } from "../../models/User.model";
//import likeUser from "../../../../back/src/controllers/likeUser";

type Category =
  | "Asiatique"
  | "Pizza"
  | "Poulet"
  | "Sandwich"
  | "Mexicain"
  | "Burger"
  | "Glaces"
  | "Boissons";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [users, setUsers] = useState<UserModel[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserModel[]>([]);
  const [mutualMatches, setMutualMatches] = useState<UserModel[]>([]); // Define mutualMatches state
  const [preferredGender, setPreferredGender] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
    navigate(`/browse/${category}`);
  };

  const handleUserinfosClick = (user: UserModel) => {
    console.log(user);
  };

  const getGenderSubcategory = (preferredGender: string) => {
    switch (preferredGender) {
      case "both":
        return <>H & F</>;
      case "homme":
        return <>Hommes</>;
      case "femme":
        return <>Femmes</>;
      default:
        return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token not found");
      return;
    }

    // Fetch current user details to get preferred gender
    fetch(`${process.env.REACT_APP_API_URL}/auth/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          console.error(data.message);
        } else {
          setPreferredGender(data.preferredGender);
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });

    // Fetch all users
    fetch(`${process.env.REACT_APP_API_URL}/auth/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          console.error(data.message);
        } else {
          setUsers(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  useEffect(() => {
    if (preferredGender && users.length > 0) {
      let filtered: UserModel[] = [];

      if (preferredGender === "both") {
        filtered = users;
      } else {
        filtered = users.filter((user) => user.userGender === preferredGender);
      }

      setFilteredUsers(filtered);
      const mutualMatches = filtered.filter((user) => user.isMutual); // Assuming isMutual is sent from the backend
      setMutualMatches(mutualMatches); // Set the mutual matches
    }
  }, [preferredGender, users]);

  return (
    <div className="div">
      <div>
        <div>
          <p className="p1-home">Let's eat together</p>
          <p className="p2-home">Mangeons ensemble</p>
        </div>
        <div className="category">
          <p className="p3-home">Catégories de restaurant</p>
          <div className="parent">
            <div
              className={`div1 ${
                activeCategory === "Asiatique" ? "active" : ""
              }`}
              onClick={() => handleCategoryClick("Asiatique")}
            >
              <div className="circle">
                <BiSolidSushi className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Asiatique" ? "active" : ""
                }`}
              >
                Asiatique
              </p>
            </div>
            <div
              className={`div2 ${activeCategory === "Pizza" ? "active" : ""}`}
              onClick={() => handleCategoryClick("Pizza")}
            >
              <div className="circle">
                <FaPizzaSlice className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Pizza" ? "active" : ""
                }`}
              >
                Pizza
              </p>
            </div>
            <div
              className={`div3 ${activeCategory === "Poulet" ? "active" : ""}`}
              onClick={() => handleCategoryClick("Poulet")}
            >
              <div className="circle">
                <GiChickenOven className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Poulet" ? "active" : ""
                }`}
              >
                Poulet
              </p>
            </div>
            <div
              className={`div4 ${
                activeCategory === "Sandwich" ? "active" : ""
              }`}
              onClick={() => handleCategoryClick("Sandwich")}
            >
              <div className="circle">
                <LuSandwich className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Sandwich" ? "active" : ""
                }`}
              >
                Sandwich
              </p>
            </div>
            <div
              className={`div5 ${
                activeCategory === "Mexicain" ? "active" : ""
              }`}
              onClick={() => handleCategoryClick("Mexicain")}
            >
              <div className="circle">
                <GiTacos className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Mexicain" ? "active" : ""
                }`}
              >
                Mexicain
              </p>
            </div>
            <div
              className={`div6 ${activeCategory === "Burger" ? "active" : ""}`}
              onClick={() => handleCategoryClick("Burger")}
            >
              <div className="circle">
                <FaHamburger className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Burger" ? "active" : ""
                }`}
              >
                Burger
              </p>
            </div>
            <div
              className={`div7 ${activeCategory === "Glaces" ? "active" : ""}`}
              onClick={() => handleCategoryClick("Glaces")}
            >
              <div className="circle">
                <FaIceCream className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Glaces" ? "active" : ""
                }`}
              >
                Glaces
              </p>
            </div>
            <div
              className={`div8 ${
                activeCategory === "Boissons" ? "active" : ""
              }`}
              onClick={() => handleCategoryClick("Boissons")}
            >
              <div className="circle">
                <RiDrinks2Fill className="icon-category" />
              </div>
              <p
                className={`p-category ${
                  activeCategory === "Boissons" ? "active" : ""
                }`}
              >
                Boissons
              </p>
            </div>
          </div>
        </div>
        <div className="div-card">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card
                key={user._id}
                category={user.favoriteCategory as Category}
                subcategory={
                  <>
                    <FaHeart className="icon-title icon-heart-home" />
                    {getGenderSubcategory(user.preferredGender)}
                  </>
                }
                image={
                  user.image ||
                  "https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
                } // Default image if not available
                text={`${user.firstname}, ${user.age} ans`}
                job={user.job}
                id={user._id}
              />
            ))
          ) : (
            <p>Il n'y a pas d'utilisateur disponible.</p>
          )}
        </div>
      </div>
      <div className="div-match">
        <p className="p-match">Mes matchs</p>
        <div className="parent">
          {/* Match images */}
          <div className="div1">
            <div className="circle">
              {mutualMatches.length > 0 ? ( // Use mutualMatches here
                mutualMatches.map((user) => {
                  return (
                    <div key={user._id} className="user-card" onClick={() => handleUserinfosClick(user)}>
                      <img
                        src={
                          user.image ||
                          "https://architecture.ou.edu/wp-content/uploads/2018/07/ANGELAPERSON-1447-300x300.jpg"
                        }
                        alt={`${user.firstname}'s avatar`}
                        className="user-image"
                      />
                    </div>
                  );
                })
              ) : (
                <p>Il n'y a pas d'utilisateur disponible.</p>
              )}
            </div>
          </div>
          {/* Other match elements */}
        </div>
      </div>
    </div>
  );
}