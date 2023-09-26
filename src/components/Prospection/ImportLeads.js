import { useEffect, useState, memo } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Button from "@mui/material/Button";
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import CSVReader from 'react-csv-reader'
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import moment from 'moment';

import { theme } from "../../data/theme";
import { ThemeProvider } from "@mui/material";

import "./ImportLeads.scss";

const ImportLeads = ({ members, company, dataBase, view, open, close, userRef, changeLoading }) => {
  const [leads, setLeads] = useState(undefined);
  const [consultora, setConsultora] = useState(undefined);
  const [list, setList] = useState(undefined);
  const [consultoraRef, setConsultoraRef] = useState(undefined);

  const closeImport = () => {
    close();
    setLeads([]);
    setConsultora('');
    setList('');
  }

  useEffect(() => {
    if(members) {
      setConsultora(members.find((member) => member.nome === consultoraRef && member.cargo === 'Vendedor(a)'))
    }
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[consultoraRef])

  const sendLeads = async () => {
    try {
      if(!list || !leads || !consultora) {
      close()
       Swal.fire({
          title: 'Atenção',
          html: `Preencha todos os campos.`,
          icon: "warning",
          showCloseButton: true,
          confirmButtonColor: "#F39200",
          confirmButtonText: "Ok",
        }).then((result) => {
          if(result.isConfirmed) {
            return open();
          }
        })
      } else {
        close()
        Swal.fire({
          title: 'Atenção',
          html: `Você deseja importar a <b>Lista?</b>`,
          icon: "question",
          showCancelButton: true,
          showCloseButton: true,
          confirmButtonColor: "#F39200",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sim",
          cancelButtonText: "Não",
        }).then(async (result) => {
          if(result.isConfirmed) {
            const day = moment();
            changeLoading(true);
           await addDoc(collection(dataBase, 'Lista_Leads'), {
              nome: list,
              createAt: serverTimestamp(),
              responsavel: userRef.nome,
              data: moment(day).format('DD MMM YYYY - HH:mm'),
              consultora: consultora.nome,
              leads: leads.length,
              status: 'Ativo',
            }).then((result) => {
              Promise.all(leads.map(async(lead) => {
                await addDoc(collection(dataBase, 'Leads'), {
                  nome: lead.nome,
                  consultora: consultora.nome,
                  data: moment(day).format('DD MMM YYYY - HH:mm'),
                  uid: consultora.uid,
                  cnpj: lead.cnpj || '',
                  email: lead.email || '',
                  empresa: lead.empresa || '',
                  consumo: '',
                  anotacao: '',
                  cidade: lead.cidade,
                  telefone: lead.telefone.replace(/\D/g, ''),
                  createAt: serverTimestamp(),
                  status: 'Ativo',
                  listaID: result.id,
                  lista: list
                })
              })).then((result) => {
                if(result) {
                  changeLoading(false);
                  Swal.fire({
                    title: company,
                    html: `A lista foi importada com sucesso.`,
                    icon: "success",
                    showConfirmButton: true,
                    showCloseButton: true,
                    confirmButtonColor: "#F39200",
                  }).then(() => {
                    return closeImport();
                  })
                }
              })
            })
          }})
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <Dialog
              open={view}
              fullWidth={true}
              maxWidth='sm'
              size
              onClose={() => close()}
            >
                <DialogTitle align='center'>
                  Importar Leads
                </DialogTitle>
                <DialogContent>
                  <DialogContentText sx={{ textAlign: 'center' }}>
                    Escolha a consultora que irá receber os leads. Após isso, selecione a sua lista no formato <b>.csv</b>
                  </DialogContentText>
                    <Alert severity="info" sx={{ marginTop: '1rem' }}>
                    <AlertTitle>Atenção</AlertTitle>
                    A lista deve conter as seguintes colunas: <br /> Obrigatória: <b>cnpj, nome, empresa, cidade.</b><br />
                    Não Obrigatória: <b>telefone e email.</b>
                    </Alert>
                  <div style={{ margin: '1rem' }}>
                  <ThemeProvider theme={theme} >
                    <TextField
                      margin="dense"
                      id="name"
                      label="Nome da Lista"
                      type="text"
                      onChange={(e) => setList(e.target.value)}
                      value={list  || ''}
                      fullWidth
                      required
                      variant="outlined"
                    />
                    <FormControl sx={{ margin: '0.3rem 0' }} fullWidth>
                    <InputLabel id="demo-simple-select-label">Consultora</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={consultoraRef ?? null}
                      label="Consultora"
                      onChange={(e) => setConsultoraRef(e.target.value)}
                      required
                    >
                      <MenuItem value="Ana">Ana</MenuItem>
                      <MenuItem value="Bruna">Bruna</MenuItem>
                      <MenuItem value="Lia">Lia</MenuItem>
                      <MenuItem value="Leticia">Leticia</MenuItem>
                    </Select>
                  </FormControl>
                    <CSVReader parserOptions={{ header: true }} onFileLoaded={(data, fileInfo) => setLeads(data, fileInfo)} />
                  </ThemeProvider>
                  </div>
                </DialogContent>
                <ThemeProvider theme={theme} >
                <DialogActions>
                  <Button onClick={() => sendLeads()}>
                  Confirmar
                </Button>
                  <Button onClick={() => closeImport()}>
                    Cancelar
                  </Button>
                </DialogActions>
                </ThemeProvider>
              </Dialog>
    </div>
  )
}

export default memo(ImportLeads)