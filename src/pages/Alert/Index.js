import { deleteDoc, doc } from "firebase/firestore";
import Header from "../../components/Header/Index";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Swal from "sweetalert2";
import axios from 'axios';
import { dataBase } from "../../firebase/database";

// Css
import "cooltipz-css";
import "./_style.scss";

const Alert = ({user,  userRef, alerts}) => {

  const confirmLead = async (alert) => {
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
        Nome: alert.nome,
        Telefone: alert.telefone,
        Email: alert.email,
        Cidade: alert.cidade,
        Valor: alert.valor,
        Promocao: alert.promocao,
        Campanha: alert.campanha,
        Consultora: alert.consultora,
      }).then(async response => {
        await deleteDoc(doc(dataBase, "Membros", userRef.uid, "Avisos", alert.id));
        Swal.fire({
          position: 'top-center',
          icon: 'success',
          title: 'Lead confirmado com Sucesso!',
          showConfirmButton: false,
          timer: 2000
        })
      })
      }
    })
  }

  const denyLead = async (alert) => {
    const { value: text } = await Swal.fire({
      input: 'textarea',
      title: '<b>Deixe uma nota</b>',
      inputPlaceholder: 'Digite a mensagem aqui...',
      inputAttributes: {
        'aria-label': 'Digita a mensagem aqui...'
      },
      customClass: {
        validationMessage: 'my-validation-message'
      },
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage(
            '<i class="fa fa-info-circle"></i> Informe uma nota'
          )
        }
      },
      showCancelButton: true,
      confirmButtonColor: "#F39200",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    })
    
    if (text) {
    axios.post('https://n8n.corpbrasil.cloud/webhook/00907265-b3e8-4fab-84f4-a7dc2e40ee4a', {
      Data: new Date(),
      Nome: alert.nome,
      Telefone: alert.telefone,
      Email: alert.email,
      Cidade: alert.cidade,
      Valor: alert.valor,
      Promocao: alert.promocao,
      Campanha: alert.campanha,
      Consultora: alert.consultora,
      Motivo: text
    })
    .then(async response => {
      await deleteDoc(doc(dataBase, "Membros", userRef.uid, "Avisos", alert.id));
      Swal.fire({
        position: 'top-center',
        icon: 'success',
        title: 'Lead confirmado com Sucesso!',
        showConfirmButton: false,
        timer: 2000
      })
    })
    }
  }

  return (
    <div className="container-panel">
      <Header user={user} userRef={userRef} alerts={alerts}></Header>
      <div className="title-panel">
        <h2>Leads</h2>
      </div>
      <div className="content-panel">
        <div className="content-alerts">
          {alerts && alerts.map((alert, index) => (
          <div key={index} className="alert">
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
              <Button onClick={() => confirmLead(alert)} color="success" sx={{padding: '0.7rem' }} variant="contained" startIcon={<CheckIcon />}>Obtive Contato</Button>
              <Button onClick={() => denyLead(alert)} color="error" sx={{padding: '0.7rem' }} variant="contained" startIcon={<CloseIcon />}>Não Respondeu</Button>
            </div>
          </div>
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
