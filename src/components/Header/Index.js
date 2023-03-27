import { Link } from "react-router-dom"; // Cria rotas de páginas
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/database";

import { Users } from "../../data/Data";

//CSS
import 'cooltipz-css';
import "./_style.scss";

// Imagem
import Logo from '../../images/LogoCORPBRASIL.png'

const Header = ({ user,  userRef }) => {

  const logoff = () => {
    signOut(auth)
      .then(() => {})
      .catch((error) => {
        // console.error(error);
      });
      document.location.replace("/");
  };

  const returnPanel = () => {
    document.location.replace("/");
  };

  return (
    <div className="container-header">
      <div className="container-header__logo">
        <Link to="" onClick={returnPanel} aria-label="Voltar ao inicio" data-cooltipz-dir="right">
          <img src={Logo} alt="CORPBRASIL"/>
        </Link>
      </div>
      <div className="container-header__nav">
          {user && userRef && (user.email === Users[0].email || userRef.cargo === 'Administrador') ? 
            (<Link className="admin" to="/admin" aria-label="Painel Administrativo" data-cooltipz-dir="left"/>)
            :
            <></>
          }
          <Link className="loggout" to="" onClick={logoff} aria-label="Sair" data-cooltipz-dir="left"/>
      </div>
    </div>
  );
};

export default Header;
