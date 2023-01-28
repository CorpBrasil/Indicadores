import { Link } from "react-router-dom"; // Cria rotas de páginas
import { signOut } from "firebase/auth";

import { auth } from "../../firebase/database";

//CSS
 import "./_style.scss";

// Imagem
import Logo from '../../images/LogoIEB.png'

const Header = ({ user }) => {

  const logoff = () => {
    signOut(auth)
      .then(() => {})
      .catch((error) => {
        console.error(error);
      });
      document.location.replace("/");
  };

  const returnPanel = () => {
    document.location.replace("/");
  };

  return (
    <div className="container-header">
      <div className="container-header__logo">
        <Link to="" onClick={returnPanel}>
          <img src={Logo} alt="Infinit"/>
        </Link>
      </div>
      <div className="container-header__nav">
          {user && user.email === "admin@infinitenergy.com.br" ? 
            (<Link className="admin" to="/admin"/>)
            :
            <></>
          }
          <Link className="loggout" to="" onClick={logoff}/>
      </div>
    </div>
  );
};

export default Header;
