import { useState, forwardRef } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import Header from "../../components/Header/Index";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Button from '@mui/material/Button';
import  Swal  from "sweetalert2/dist/sweetalert2";
import axios from 'axios';
import { dataBase } from "../../firebase/database";
import StarIcon from '@mui/icons-material/Star';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import Meetime from '../../images/icons/Logo_Meetime.png';
import { ReactComponent as Leads } from '../../images/icons/Leads.svg';

// Css
import "cooltipz-css";
import "./_style.scss";

const Alert = ({user,  userRef, alerts, check}) => {
  // const [value, setValue] = useState(1);
  // const [hover, setHover] = useState(-1);
  
  const [qualificacao, setQualificacao] = useState('');
  const [motivo, setMotivo] = useState('');
  const [open, setOpen] = useState(false);
  const [lead, setLead] = useState(null);
  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  // const getLabelText = (value) => {
  //   return `${value} Star${value !== 1 ? 's' : ''}, ${qualificacao[value]}`;
  // }

  const handleClose = () => {
    setOpen(false);
    setLead(null);
    setQualificacao('');
    // setValue(1);
  };

  console.log(alerts)


  const handleClickOpen = (alert) => {
    if(check) {
      Swal.fire({
        title: 'Sem Conexão',
        icon: "error",
        html: `Não é possível Confirmar Lead <b>sem internet.</b> Verifique a sua conexão.`,
        confirmButtonText: "Fechar",
        showCloseButton: true,
        confirmButtonColor: "#d33"  
      })
    } else {
      setOpen(true);
      setLead(alert);
    }
  };


  const confirmLead = async () => {
    if(motivo && qualificacao) {
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
          qualificacao: qualificacao,
          Telefone: lead.telefone,
          Email: lead.email,
          Cidade: lead.cidade,
          Valor: lead.valor,
          Promocao: lead.promocao,
          Campanha: lead.campanha,
          Consultora: lead.consultora,
          Reenviado: lead.reenviado,
          motivo: motivo
        }).then(async response => {
          await deleteDoc(doc(dataBase, "Membros", userRef.uid, "Avisos", lead.id));
          Swal.fire({
            position: 'top-center',
            icon: 'success',
            title: 'Lead confirmado com Sucesso!',
            showConfirmButton: false,
            timer: 2000
          })
          setQualificacao('')
        })
        } else {
          setOpen(true);
        }
      })
    } else {
      setOpen(false);
      Swal.fire({
        title: 'Aviso',
        html: `Preencha todos os campos para poder qualificar o lead.`,
        icon: "warning",
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ok",
      }).then(async (result) => {
        setOpen(true);
      })
    }
  }

  return (
    <div className="container-panel">
      <Header user={user} userRef={userRef} alerts={alerts}></Header>
      <div className="title-panel">
        <Leads style={{ width: '42px', height: '42px', marginBottom: '0.5rem' }} />
        <h2>Leads</h2>
      </div>
      <div className="content-panel">
        <div className="content-alerts">
          {alerts && alerts.map((alert, index) => (
          <div key={index} className="alert">
              <div className="alert__header">
                <p>{alert.data}</p>
                {alert.campanha === 'Meetime' ?
                 <><h2>Confirmação de Lead <b style={{ color: "#00a443" }}>(Meetime)</b></h2><img src={Meetime} alt="" /></> :
                 <><h2>Confirmação de Lead</h2><AccountCircleIcon /></>
                 }
              </div>
              <div className="alert__info">
                <p>Nome: <b>{alert.nome}</b></p>
                <p>Telefone: <b>{alert.telefone}</b></p>
                <p>Cidade: <b>{alert.cidade}</b></p>
                <p>Valor da Energia: <b>{alert.valor}</b></p>
                <p>Promoção: <b>{alert.promocao}</b></p>
                <p>Campanha: <b>{alert.campanha}</b></p>
                <a href={`https://wa.me/+${alert.telefone}`}>Visualizar Conversa</a>
              </div>
              <div className="alert__footer">
                <Button onClick={() => handleClickOpen(alert)} color="success" sx={{ padding: '0.7rem' }} variant="contained" endIcon={<StarIcon />}>Qualificar Lead</Button>
                {/* <Button onClick={() => denyLead(alert)} color="error" sx={{padding: '0.7rem' }} variant="contained" startIcon={<CloseIcon />}>Não Respondeu</Button> */}
              </div>
            </div>
          ))}
          {alerts && alerts.length === 0 &&
          <h1 className="alert-none">Nenhum Lead</h1>
          }
            <Dialog
              open={open}
              onClose={handleClose}
            >
                <DialogTitle>
                  Qualifique o Lead
                </DialogTitle>
                <DialogContent>
                  <DialogContentText className="dialog-content">
                    Qualifique o Lead de acordo com a sua experiência.<br />
                    {qualificacao && qualificacao === 'Não Qualificado' && <span><b>Não Qualificado</b> - Lead que busca sistema offgrid, tem nome sujo, é distribuidor ou já possui energia solar.<br /></span>}
                    {qualificacao && qualificacao === 'Não Tem Interesse' && <span><b>Não Tem Interesse</b> - Lead que não responde mensagem.<br /></span>}
                     {qualificacao && qualificacao === 'Curioso' &&<span><b>Curioso</b> - Lead que está com dúvidas, mas não tem interesse em comprar.<br /></span>}
                     {qualificacao && qualificacao === 'Em Atendimento' &&<span><b>Em Atendimento</b> - Lead que possui interesse, mas está em negociação.<br /></span>}
                     {qualificacao && qualificacao === 'Tem Interesse Futuro' &&<span><b>Tem Interesse Futuro</b> - Lead que possui interesse, mas não pode comprar no momento (Obra, não pode financiar no momento, etc).<br /></span>}
                     {qualificacao && qualificacao === 'Potencial' &&<span><b>Potencial</b> - Lead com potencial interesse em compra e não possui restrição.</span>}
                  </DialogContentText>
                  <div className="alert-message" style={{ margin: '1rem' }}>
                  <FormControl sx={{ margin: '0.3rem 0' }} fullWidth>
                  <InputLabel id="demo-simple-select-label">Qualificação</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={qualificacao}
                    label="Qualificação"
                    required
                    onChange={(e) => setQualificacao(e.target.value)}
                  >
                    <MenuItem value='Não Qualificado'>Não Qualificado</MenuItem>
                    <MenuItem value='Não Tem Interesse'>Não Tem Interesse</MenuItem>
                    <MenuItem value='Curioso'>Curioso</MenuItem>
                    <MenuItem value='Em Atendimento'>Em Atendimento</MenuItem>
                    <MenuItem value='Tem Interesse Futuro'>Tem Interesse Futuro</MenuItem>
                    <MenuItem value='Potencial'>Potencial</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Motivo"
                  type="text"
                  onChange={(e) => setMotivo(e.target.value)}
                  value={motivo || ''}
                  fullWidth
                  required
                  multiline
                  rows={2}
                  maxRows={4}
                  variant="outlined"
                />
                    {/* <Rating
                      //sx={{ padding: '1rem' }}
                      size="large"
                      name="hover-feedback"
                      value={value}
                      precision={1}
                      max={6}
                      getLabelText={getLabelText}
                      onChange={(event, newValue) => {
                        setValue(newValue);
                      } }
                      onChangeActive={(event, newHover) => {
                        setHover(newHover);
                      } }
                      emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />} />
                    <p style={{ margin: '0.5rem' }}>{qualificacao[hover !== -1 ? hover : value]}</p> */}
                  </div>
                </DialogContent>
                <DialogActions>
                  <Button autoFocus onClick={() => confirmLead()}>
                    Confirmar
                  </Button>
                  <Button onClick={handleClose} autoFocus>
                    Cancelar
                  </Button>
                </DialogActions>
              </Dialog>
        </div>
      </div>
      <Snackbar open={check} autoHideDuration={6000}>
          <Alert severity="error" sx={{ width: '100%' }}>
            Você está sem conexão. Verifique a sua conexão com a internet.
          </Alert>
      </Snackbar>
    </div>
  );
};

export default Alert;
