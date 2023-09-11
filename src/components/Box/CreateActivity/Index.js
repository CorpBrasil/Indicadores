import { addDoc, collection, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { memo, useState } from "react";
import axios from "axios";
// import { PatternFormat } from "react-number-format";
import Popover from '@mui/material/Popover';
import Swal from 'sweetalert2/dist/sweetalert2.js';
// import Select from 'react-select'
import * as moment from "moment";
import "moment/locale/pt-br";

import { Company } from "../../../data/Data";
import { dataBase } from "../../../firebase/database";

import { ReactComponent as WhatsApp } from '../../../images/icons/WhatsApp.svg';
import { ReactComponent as Phone } from '../../../images/icons/Phone.svg';
import { ReactComponent as Email } from '../../../images/icons/Mail.svg';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import AddTaskIcon from '@mui/icons-material/AddTask';
import EditIcon from '@mui/icons-material/Edit';

import IconButton from '@mui/material/IconButton';

import "../style.scss";
import styles from "./styles.module.scss";
import Button from "@mui/material/Button";

const CreateActivity = ({
  data,
  activityAll
}) => {
  const [open] = useState(false);
  const [activity, setActivity] = useState(null);
  const [view, setview] = useState(false);
  const [viewEdit, setViewEdit] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openRegister = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const [anotacao, setAnotacao] = useState('');

  console.log(data)
  
  const editActivity = async (activity) => {
    console.log(activity)
    try {
        Swal.fire({
          title: Company,
          html: `Você deseja alterar a <b>Anotação?</b>`,
          icon: "question",
          showCancelButton: true,
          showCloseButton: true,
          confirmButtonColor: "#F39200",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sim",
          cancelButtonText: "Não",
        }).then(async (result) => {
          await updateDoc(doc(dataBase, "Leads", data.id, "Atividades", activity.id), {
            anotacao: anotacao
          }).then(() => {
            Swal.fire({
              title: Company,
              html: `A Anotação foi alterada com sucesso.`,
              icon: "success",
              showConfirmButton: true,
              showCloseButton: true,
              confirmButtonColor: "#F39200",
            }).then(() => {
              axios.post('https://n8n.corpbrasil.cloud/webhook/d06a614a-c330-432d-af28-6610ca824dc9', {
                ...activity,
                cidade: data.cidade,
                nome: data.nome,
                empresa: data.nome,
                anotacao: anotacao
              })    
              return setViewEdit(false);
            })
          })
        })
    } catch {

    }
  }

  console.log(data)

  const onSubmit = async () => {
    const day = moment();
    console.log(moment(day).format('DD MMM YYYY - HH:mm'))
    try {
      Swal.fire({
        title: Company,
        html: `Você deseja registrar a <b>Atividade?</b>`,
        icon: "question",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await addDoc(collection(dataBase, "Leads", data.id, "Atividades"), {
            consultora:  data.consultora,
            anotacao: anotacao,
            atividade: activity,
            data: moment(day).format('DD / MMMM / YYYY - HH:mm'),
            dataRef: moment(day).format('YYYY-MM-DD'),
            createAt: serverTimestamp(),
            uid: data.uid,
            id: data.id
          }).then(async (result) => {
            axios.post('https://n8n.corpbrasil.cloud/webhook/d06a614a-c330-432d-af28-6610ca824dc9', {
              ...data,
              anotacao: anotacao,
              atividade: activity, 
              id: result.id // ID de referência da Atividade
              })  
              await addDoc(collection(dataBase, "Atividades_Total"), {
                consultora:  data.consultora,
                anotacao: anotacao,
                atividade: activity,
                data: moment(day).format('DD / MMMM / YYYY - HH:mm'),
                dataRef: moment(day).format('YYYY-MM-DD'),
                createAt: serverTimestamp(),
                uid: data.uid, // UID de referência do Usuário que criou a atividade
                idRef: data.id // ID de referência do Lead
              }).then(() => {
                Swal.fire({
                  title: Company,
                  html: `A Atividade foi registrada com sucesso.`,
                  icon: "success",
                  showConfirmButton: true,
                  showCloseButton: true,
                  confirmButtonColor: "#F39200",
                }).then(() => {
                  setAnotacao('');
                  return setview(false);
                })  
              })
            })
          }})
    } catch {

    }
  };

  const handleClose = () => {
    setAnchorEl(null);
};

const openActivity = (data) => {
  handleClose();
  setActivity(data);
  setview(true);
}

const closeActivity = () => {
  setActivity(null);
  setview(false);
  setViewEdit(false);
}

console.log(activity)

  return (
    <div className={styles.activity_container}>
      {activityAll && activityAll.map((activity, index) => (
      <div key={index} className={styles.activity_item}>
          <div className={styles.activity_item_header}>
            <div>
            {activity.atividade === 'Email de Apresentação' && <div className={`${styles.activity_icon} ${styles.mail2}`}><Email /></div>}
            {activity.atividade === 'Email' && <div className={`${styles.activity_icon} ${styles.mail}`}><Email /></div>}
            {activity.atividade === 'Ligação' && <div className={`${styles.activity_icon} ${styles.phone}`}><Phone /></div>}
            {activity.atividade === 'WhatsApp' && <div className={`${styles.activity_icon} ${styles.whatsapp}`}><WhatsApp /></div>}
            <h3>{activity.atividade}</h3>
            </div>
            <span>Realizado: {activity.data.replace('/', 'de').replace('/','de').replace('-', 'às')}</span>
          </div>
          {viewEdit && viewEdit === activity.id ?
           <div className={styles.activity_content}>
           <textarea className={styles.activity_anotacao} value={anotacao} onChange={(e) => setAnotacao(e.target.value)} cols="30" rows="5"></textarea>
           <div className={styles.activity_button}> 
           <Button
               variant="outlined"
               color="success"
               size="small"
               type="submit"
               startIcon={<CheckCircleOutlineIcon />}
               onClick={() => editActivity(activity)}
             >
               Confirmar
             </Button><Button
               variant="outlined"
               color="error"
               size="small"
               onClick={() => closeActivity(activity.id)}
               startIcon={<BlockIcon />}
             >
                 Cancelar
               </Button>
           </div>
         </div> : 
          <div className={styles.activity_item_anotacao}>
          <p>{activity.anotacao}</p>
          <IconButton
                          aria-label="Editar Anotação"
                          data-cooltipz-dir="top"
                          size="small"
                          onClick={() => { setViewEdit(activity.id); setAnotacao(activity.anotacao); } }
                        >
           <EditIcon />
          </IconButton>
        </div>
        }
        </div>
      ))
      }
      {view && view ?
      <div className={styles.activity_content}>
        <h3>{activity}</h3>
        <textarea className={styles.activity_anotacao} value={anotacao} onChange={(e) => setAnotacao(e.target.value)} cols="30" rows="5"></textarea>
        <div className={styles.activity_button}> 
        <Button
            variant="outlined"
            color="success"
            type="submit"
            startIcon={<CheckCircleOutlineIcon />}
            onClick={() => onSubmit()}
          >
            Confirmar
          </Button><Button
            variant="outlined"
            color="error"
            onClick={() => closeActivity()}
            startIcon={<BlockIcon />}
          >
              Cancelar
            </Button>
        </div>
      </div> : 
      <Button color="success" variant="outlined" size="small" onClick={(e) => setAnchorEl(e.currentTarget)} startIcon={<AddTaskIcon />} >
      Registrar Atividade
      </Button>}  
      <Popover
      id={id}
      open={openRegister}
      anchorEl={anchorEl}
      className="filter"
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      >
        <div className={styles.activity_box}>
          <div className={styles.activity_list_item} onClick={() => openActivity('Email de Apresentação')}><div className={`${styles.activity_icon} ${styles.mail2}`}><Email /></div><p>Email (Apresentação)</p></div>
          <div className={styles.activity_list_item} onClick={() => openActivity('Email')}><div className={`${styles.activity_icon} ${styles.mail}`}><Email /></div><p>Email</p></div>
          <div className={styles.activity_list_item} onClick={() => openActivity('Ligação')}><div className={`${styles.activity_icon} ${styles.phone}`}><Phone /></div><p>Ligação</p></div>
          <div className={styles.activity_list_item} onClick={() => openActivity('WhatsApp')}><div className={`${styles.activity_icon} ${styles.whatsapp}`}><WhatsApp /></div><p>WhatsApp</p></div>
        </div>
      </Popover>
    </div>
  );
};

export default memo(CreateActivity);
