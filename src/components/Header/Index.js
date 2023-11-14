import { Link } from "react-router-dom"; // Cria rotas de páginas
import { signOut } from "firebase/auth";
import { auth, dataBase } from "../../firebase/database";
import Badge from '@mui/material/Badge';
import { Users } from "../../data/Data";
import { useState, useEffect } from "react";
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import parse from 'html-react-parser';
import moment from "moment";

//CSS
import 'cooltipz-css';
import "./_style.scss";

// import { ReactComponent as Leads } from '../../images/icons/Leads.svg';
import { ReactComponent as Admin } from '../../images/icons/Admin.svg';
import { ReactComponent as Exit } from '../../images/icons/Logoff.svg';
// import { ReactComponent as Report } from '../../images/icons/Report.svg';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
// import MenuIcon from '@mui/icons-material/Menu';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

// Imagem
import Logo from '../../images/LogoCORPBRASIL.png'

const Header = ({ user,  userRef }) => {
  const [open] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  // const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState();
  // const [viewPopover, setviewPopover] = useState(false);
  const id = open ? 'simple-popover' : undefined;
  const openNotification = Boolean(anchorEl);

   useEffect(
    () => {
      const fetchData = async () => {
        await onSnapshot(query(collection(dataBase, "Membros/" + user.id + "/Notificacao"), orderBy("createAt", 'desc')), (data) => {
          // Atualiza os dados em tempo real
          setNotification(
            data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          );
        });
      };
      fetchData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

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

console.log(notification)

const handleClose = () => {
  setAnchorEl(null);
};

const deleteNotification = async (type,data) => {
  if(type === '1') {
    await deleteDoc(doc(dataBase, "Membros", user.id, 'Notificacao', data.id))
  } else if(notification) {
    notification.map(async (data) => {
      return await deleteDoc(doc(dataBase, "Membros", user.id, 'Notificacao', data.id))
    })
  }
}

  return (
    <div className="container-header">
      <div className="container-header__logo">
        <Link to="" onClick={returnPanel} aria-label="Voltar ao inicio" data-cooltipz-dir="right">
          <img src={Logo} alt="CORPBRASIL"/>
        </Link>
      </div>
      <div className="container-header__nav">
           <Badge badgeContent={notification && notification.length} color="error">
            <Link id="notificação" to="" onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Notificaçôes" data-cooltipz-dir="left">
              <NotificationsIcon className="icon-notification" />
            </Link>
          </Badge>
          {/* Notificação */}
          <Popover
          id={id}
          open={openNotification}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}>
            <div className="notification-content">
              <p className="notification-title">Notificações</p>
              <ul>
                {(notification && notification) && notification.length > 0 ? notification.map((data) => (
                <li>
                {data.type === 'Orçamento' && <ContentPasteIcon />}
                {data.type === 'Visita' && <CalendarMonthIcon />}
                  <div className="notification-text">
                    <div className="notification-type">
                      <h4>{data.type}</h4>
                      <span>
                        {data && moment(data.data, 'YYYY-MM-DD').add(1, 'days').isSame(moment().format('YYYY-MM-DD')) && 
                        `Ontem às ${data && moment(data.createAt.seconds*1000).format('HH:mm')}`}
                        {data && moment(data.data).isSame(moment().format('YYYY-MM-DD')) && 
                        `Hoje às ${data && moment(data.createAt.seconds*1000).format('HH:mm')}`}
                        {data && moment(data.data).add(1, 'days').isBefore(moment().format('YYYY-MM-DD')) && 
                        `${data && moment(data.createAt.seconds*1000).format('DD/MM - HH:mm').replace('-','às')}`}
                        </span>
                    </div>
                    <div>
                      {parse(data.text)}
                    </div>
                  </div>
                  <IconButton aria-label="Fechar" onClick={() => deleteNotification('1', data)}>
                    <CloseIcon />
                  </IconButton>
                  </li>
                )) : 
                <li><h3 className="notification-alert">Nenhuma Notificação</h3></li>}
                {(notification && notification) && notification.length > 0 && <Button sx={{ textTransform: 'none' }} onClick={() => deleteNotification('All', notification)}>Limpar Tudo</Button>}
              </ul>
            </div>
          </Popover>
          {/*---------------------------------------*/}
          {user && userRef && (user.email === Users[0].email || userRef.cargo === 'Administrador') ? 
            (<Link to="/admin" aria-label="Painel Administrativo" data-cooltipz-dir="left">
              <Admin />
              </Link>)
            :
            <></>
          }
          <Link id="sair" to="" onClick={logoff} aria-label="Sair" data-cooltipz-dir="left">
            <Exit />
          </Link>
        </div>
          {/* <nav className='nav'>
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
          </nav> */}
    </div>
  );
};

export default Header;
