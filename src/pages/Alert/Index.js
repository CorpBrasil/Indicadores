import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import Header from "../../components/Header/Index";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Button from '@mui/material/Button';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import axios from 'axios';
import Rating from '@mui/material/Rating';
import { dataBase } from "../../firebase/database";
import StarIcon from '@mui/icons-material/Star';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// Css
import "cooltipz-css";
import "./_style.scss";

const Alert = ({user,  userRef, alerts}) => {
  const [value, setValue] = useState(2);
  const [hover, setHover] = useState(-1);
  const [open, setOpen] = useState(false);
  const [lead, setLead] = useState(null);
  //const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const qualificacao = {
    1: 'Não Respondeu',
    2: 'Curioso',
    3: 'Em Atendimento',
    4: 'Tem Interesse',
    5: 'Potencial',
  };

  const getLabelText = (value) => {
    return `${value} Star${value !== 1 ? 's' : ''}, ${qualificacao[value]}`;
  }

  const handleClose = () => {
    setOpen(false);
    setLead(null);
    setValue(1);
  };

  const handleClickOpen = (alert) => {
    setOpen(true);
    setLead(alert);
  };


  const confirmLead = async () => {
    setOpen(false);
    Swal.fire({
      title: 'Aviso',
      html: `Você deseja confirmar o <b>Lead?</b>`,
      //icon: "question",
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: "#F39200",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
    }).then(async (result) => {
      if(result.isConfirmed) {
        axios.post('https://n8n.corpbrasil.cloud/webhook/00907265-b3e8-4fab-84f4-a7dc2e40ee4a', {
        Data: new Date(),
        Nome: lead.nome,
        qualificacao: qualificacao[value],
        Telefone: lead.telefone,
        Email: lead.email,
        Cidade: lead.cidade,
        Valor: lead.valor,
        Promocao: lead.promocao,
        Campanha: lead.campanha,
        Consultora: lead.consultora,
      }).then(async response => {
        await deleteDoc(doc(dataBase, "Membros", userRef.uid, "Avisos", lead.id));
        Swal.fire({
          position: 'top-center',
          icon: 'success',
          title: 'Lead confirmado com Sucesso!',
          showConfirmButton: false,
          timer: 2000
        })
        setValue(1);
      })
      } else {
        setOpen(true);
      }
    })
  }

  // const denyLead = async (alert) => {
  //   const { value: text } = await Swal.fire({
  //     input: 'textarea',
  //     title: '<b>Deixe uma nota</b>',
  //     inputPlaceholder: 'Digite a mensagem aqui...',
  //     inputAttributes: {
  //       'aria-label': 'Digita a mensagem aqui...'
  //     },
  //     customClass: {
  //       validationMessage: 'my-validation-message'
  //     },
  //     preConfirm: (value) => {
  //       if (!value) {
  //         Swal.showValidationMessage(
  //           '<i class="fa fa-info-circle"></i> Informe uma nota'
  //         )
  //       }
  //     },
  //     showCancelButton: true,
  //     confirmButtonColor: "#F39200",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Confirmar",
  //     cancelButtonText: "Cancelar",
  //   })
    
  //   if (text) {
  //   axios.post('https://n8n.corpbrasil.cloud/webhook/00907265-b3e8-4fab-84f4-a7dc2e40ee4a', {
  //     Data: new Date(),
  //     Nome: alert.nome,
  //     Telefone: alert.telefone,
  //     Email: alert.email,
  //     Cidade: alert.cidade,
  //     Valor: alert.valor,
  //     Promocao: alert.promocao,
  //     Campanha: alert.campanha,
  //     Consultora: alert.consultora,
  //     Motivo: text
  //   })
  //   .then(async response => {
  //     await deleteDoc(doc(dataBase, "Membros", userRef.uid, "Avisos", alert.id));
  //     Swal.fire({
  //       position: 'top-center',
  //       icon: 'success',
  //       title: 'Lead confirmado com Sucesso!',
  //       showConfirmButton: false,
  //       timer: 2000
  //     })
  //   })
  //   }
  // }


  return (
    <div className="container-panel">
      <Header user={user} userRef={userRef} alerts={alerts}></Header>
      <div className="title-panel">
        <h2>Leads</h2>
      </div>
      <div className="content-panel">
        <div className="content-alerts">
          {alerts && alerts.map((alert, index) => (
          <><div key={index} className="alert">
              <div className="alert__header">
                <p>{alert.data}</p>
                <h2>Confirmação de Lead</h2>
                <AccountCircleIcon />
              </div>
              <div className="alert__info">
                <p>Nome: <b>{alert.nome}</b></p>
                <p>Telefone: <b>{alert.telefone}</b></p>
                <p>Cidade: <b>{alert.cidade}</b></p>
                <p>Valor da Energia: <b>{alert.valor}</b></p>
                <p>Campanha: <b>{alert.campanha}</b></p>
                <a href={`https://wa.me/+${alert.telefone}`}>Visualizar Conversa</a>
              </div>
              <div className="alert__footer">
                <Button onClick={() => handleClickOpen(alert)} color="success" sx={{ padding: '0.7rem' }} variant="contained" endIcon={<StarIcon />}>Qualificar Lead</Button>
                {/* <Button onClick={() => denyLead(alert)} color="error" sx={{padding: '0.7rem' }} variant="contained" startIcon={<CloseIcon />}>Não Respondeu</Button> */}
              </div>
            </div>
            <Dialog
              //fullScreen={fullScreen}
              open={open}
              onClose={handleClose}
              aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
                  {"Qualifique o Lead"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Escolha a quantidade de estrela de acordo com a qualidade do Lead.
                  </DialogContentText>
                  <div style={{ margin: '1rem' }}>
                    <Rating
                      //sx={{ padding: '1rem' }}
                      size="large"
                      name="hover-feedback"
                      value={value}
                      precision={1}
                      getLabelText={getLabelText}
                      onChange={(event, newValue) => {
                        setValue(newValue);
                      } }
                      onChangeActive={(event, newHover) => {
                        setHover(newHover);
                      } }
                      emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />} />
                    <p style={{ margin: '0.5rem' }}>{qualificacao[hover !== -1 ? hover : value]}</p>
                  </div>
                </DialogContent>
                <DialogActions>
                  <Button autoFocus onClick={() => confirmLead(alert)}>
                    Confirmar
                  </Button>
                  <Button onClick={handleClose} autoFocus>
                    Cancelar
                  </Button>
                </DialogActions>
              </Dialog></>
          ))}
          {alerts && alerts.length === 0 &&
          <h1 className="alert-none">Nenhum Lead</h1>
          }
        </div>
      </div>
    </div>
  );
};

export default Alert;
