import { Link } from "react-router-dom"; // Cria rotas de páginas
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/database";
import Badge from '@mui/material/Badge';
import { Users } from "../../data/Data";

//CSS
import 'cooltipz-css';
import "./_style.scss";

import { ReactComponent as Leads } from '../../images/icons/Leads.svg';
import { ReactComponent as Admin } from '../../images/icons/Admin.svg';
import { ReactComponent as Exit } from '../../images/icons/Logoff.svg';

// Imagem
import Logo from '../../images/LogoCORPBRASIL.png'

const Header = ({ user,  userRef, alerts }) => {

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
          {user && userRef && (user.email === Users[0].email || userRef.cargo === 'Administrador' || userRef.cargo === 'Vendedor(a)') &&
          <Badge badgeContent={alerts && alerts.length} color="error">
          <Link to="/leads" aria-label="Confirmar Leads" data-cooltipz-dir="left">
              <Leads />
            </Link>
          </Badge>}
          {user && userRef && (user.email === Users[0].email || userRef.cargo === 'Administrador') ? 
            (<Link to="/admin" aria-label="Painel Administrativo" data-cooltipz-dir="left">
              <Admin />
              </Link>)
            :
            <></>
          }
          <Link to="" onClick={logoff} aria-label="Sair" data-cooltipz-dir="left">
            <Exit />
          </Link>
      </div>
    </div>
  );
};

export default Header;
