import { Link } from "react-router-dom"; // Cria rotas de páginas
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/database";
import Badge from '@mui/material/Badge';
import { Users } from "../../data/Data";
import { useState } from "react";

//CSS
import 'cooltipz-css';
import "./_style.scss";

import { ReactComponent as Leads } from '../../images/icons/Leads.svg';
import { ReactComponent as Admin } from '../../images/icons/Admin.svg';
import { ReactComponent as Exit } from '../../images/icons/Logoff.svg';
import { ReactComponent as Report } from '../../images/icons/Report.svg';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MenuIcon from '@mui/icons-material/Menu';

// Imagem
import Logo from '../../images/LogoCORPBRASIL.png'

const Header = ({ user,  userRef, alerts, reports }) => {
  const [isOpen, setIsOpen] = useState(false);

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

//   const handleClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//     setTimeout(() => {
//       setviewPopover(false);
//     }, 500);
// };

console.log(reports && reports.length - userRef.relatorio)
console.log()

  return (
    <div className="container-header">
      <div className="container-header__logo">
        <Link to="" onClick={returnPanel} aria-label="Voltar ao inicio" data-cooltipz-dir="right">
          <img src={Logo} alt="CORPBRASIL"/>
        </Link>
      </div>
      <div className="container-header__nav">
          {user && userRef && (user.email === Users[0].email || userRef.cargo === 'Administrador' || userRef.cargo === 'Vendedor(a)') &&
          <><Badge badgeContent={alerts && alerts.length} color="error">
            <Link to="/leads" aria-label="Confirmar Leads" data-cooltipz-dir="left">
              <Leads />
            </Link>
          </Badge><Badge badgeContent={reports && reports.length - userRef.relatorio} color="error">
              <Link to="/relatorio" aria-label="Relatório" data-cooltipz-dir="left">
                <Report className="icon-black" />
              </Link>
            </Badge></>}
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
          <nav className='nav'>
          <button onClick={() => setIsOpen(!isOpen)} className={'menu-icon'}>
             <MenuIcon/>
          </button>
          <ul className={isOpen ? 'nav-links open' : 'nav-links'}>
          <li><Link to="/" data-cooltipz-dir="left"><HomeOutlinedIcon sx={{ scale: '1.5' }} />Inicio</Link></li>
          {user && userRef && (user.email === Users[0].email || userRef.cargo === 'Administrador' || userRef.cargo === 'Vendedor(a)') &&
          <><li><Link to="/leads" data-cooltipz-dir="left"><Leads /> Leads</Link></li><li><Link to="/relatorio" data-cooltipz-dir="left"><Report className="icon-black" />Relatório</Link></li></>}
          {user && userRef && (user.email === Users[0].email || userRef.cargo === 'Administrador') ?
          <li><Link to="/admin" data-cooltipz-dir="left"><Admin /> Painel Administrativo</Link></li> : <></>}
          <li><Link to="" onClick={logoff} data-cooltipz-dir="left"><Exit /> Sair</Link></li>
        </ul>
          </nav>
    </div>
  );
};

export default Header;
