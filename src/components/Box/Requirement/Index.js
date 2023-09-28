import { useState } from "react";
// import CurrencyInput from "react-currency-input-field";
import Dialog from "@mui/material/Dialog";
import { PatternFormat } from "react-number-format";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { theme } from "../../../data/theme";
import { ThemeProvider } from "@mui/material";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import DialogContentText from "@mui/material/DialogContentText";
import FormLabel from "@mui/material/FormLabel";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Checkbox from '@mui/material/Checkbox';
import styles from "./styles.module.scss";

const Requirement = ({ type, view, collectData, openBox, changeBox, closeBox }) => {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [data, setData] = useState("");
  const [simulacao, setSimulacao] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirm2, setConfirm2] = useState("");
  const [confirm3, setConfirm3] = useState("");
  const [confirm4, setConfirm4] = useState("");
  const [checked, setChecked] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    closeBox()
    if(confirm === "Não" || confirm2 === 'Não' || confirm4 === 'Não') {
      return Swal.fire({
        title: 'Visita Não Qualificada',
        html: `A visita não pode ser criada pois a visita não é <b>Qualificada</b>`,
        icon: "warning",
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        confirmButtonText: "Ok",
      }).then(() => {
        openBox(type);
      })
    } else {
      Swal.fire({
        title: 'CORPBRASIL',
        html: `Todos os dados preenchidos estão corretos?`,
        icon: "question",
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if(result.isConfirmed) {
          let telefoneFormatado = telefone.replace(/\D/g, '');
          collectData({
            nome: nome,
            telefone: '55' + telefoneFormatado,
            dataNouF: data,
            simulacao: simulacao,
            cpfOuCnpj: cpfCnpj,
            pagamento: confirm,
            proposta: confirm2,
            inversor10kW: confirm3,
            link: confirm4
          })
          setNome('');
          setTelefone('');
          setCpfCnpj('');
          setData('');
          setSimulacao('');
          setConfirm('');
          setConfirm2('');
          setConfirm3('');
          setConfirm4('');
          setChecked(false);
          changeBox(type)
          // closeBox()
        } else {
          openBox(type);
        }
      })
    }
  }

  const close = () => {
    closeBox();
    setNome('');
    setTelefone('');
    setCpfCnpj('');
    setData('');
    setSimulacao('');
    setConfirm('');
    setConfirm2('');
    setConfirm3('');
    setConfirm4('');
  }

  return (
    <Dialog
      open={view}
      fullWidth={true}
      maxWidth="sm"
      size
      // onClose={() => closeBox()}
    >
      <DialogTitle align="center">Requisitos de Visita</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ textAlign: "center" }}>
          Preencha os campos abaixo para agendar a <b>Visita</b>.
        </DialogContentText>
        <form onSubmit={onSubmit}>
        <ThemeProvider theme={theme}>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Nome"
          type="text"
          onChange={(e) => setNome(e.target.value)}
          value={nome}
          fullWidth
          required
          variant="outlined"
        />
        <div className={styles.label_content}>
          <div>
            <span>Telefone</span>
            <PatternFormat
              className="label__input"
              onChange={(e) => setTelefone(e.target.value)}
              format="(##) ##### ####"
              mask="_"
              placeholder="(00) 00000 0000"
              value={telefone}
              label="Telefone"
              minLength={9}
              variant="outlined"
              color="primary"
              required
            />
          </div>
          <div>
            <span>Data de Nascimento / Fundação</span>
            <PatternFormat
              className="label__input"
              onChange={(e) => setData(e.target.value)}
              format="## / ## / ####"
              mask="_"
              placeholder="00 / 00 / 0000"
              value={data}
              label="Data de Nascimento"
              variant="outlined"
              color="primary"
              required
            />
          </div>
        </div>
        <div className={styles.label_content2}>
          <FormControl sx={{ margin: "0.3rem 0" }} fullWidth>
            <InputLabel id="simple-select-label">Simulação</InputLabel>
            <Select
              labelId="simple-select-label"
              id="simple-select"
              value={simulacao ? simulacao : ''}
              label="Simulação"
              onChange={(e) => setSimulacao(e.target.value)}
              required
            >
              <MenuItem value="Aprovado">Aprovada</MenuItem>
              <MenuItem value="Negada">Negada</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="CPF / CPNJ (Somente Número)"
            type="number"
            onChange={(e) => setCpfCnpj(e.target.value)}
            value={cpfCnpj}
            required
            variant="outlined"
            fullWidth
          />
        </div>
        {simulacao && simulacao === "Negada" && (
          <Alert severity="warning" sx={{ marginTop: "1rem" }}>
            <AlertTitle>Atenção</AlertTitle>
            Cliente está <b>Ciente</b> que o método de pagamento só poderá ser por <b>PIX</b> ou parcelado no <b>Cartão de Crédito</b>?
            <RadioGroup
              row
              aria-labelledby="radio-buttons-group-label"
              defaultValue="Sim"
              name="radio-buttons-group"
              value={confirm ? confirm : ''}
              onChange={(e) => setConfirm(e.target.value)}
            >
              <FormControlLabel value="Sim" control={<Radio required />} label="Sim" />
              <FormControlLabel value="Não" control={<Radio required />} label="Não" />
            </RadioGroup>
          </Alert>
        )}
        <div style={{ margin: "1rem" }}>
            <FormControl sx={{ margin: "0.3rem 0" }} fullWidth>
              <FormLabel id="radio-buttons-group-label2">
                Cliente tem proposta apresentada e quer prosseguir com a visita
                técnica?
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="radio-buttons-group-label2"
                defaultValue="Sim"
                name="radio-buttons-group2"
                value={confirm2 ? confirm2 : ''}
                onChange={(e) => setConfirm2(e.target.value)}
              >
                <FormControlLabel value="Sim" control={<Radio required />} label="Sim" />
                <FormControlLabel value="Não" control={<Radio required />} label="Não" />
              </RadioGroup>
            </FormControl>
            {confirm2 && confirm2 === "Não" && 
            <FormControl sx={{ margin: "0.3rem 0" }} fullWidth>
              <FormLabel id="radio-buttons-group-label3">
                A proposta tem Inversor 10kw pra cima?
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="radio-buttons-group-label3"
                defaultValue="Sim"
                name="radio-buttons-group3"
                value={confirm3 ? confirm3 : ''}
                onChange={(e) => setConfirm3(e.target.value)}
              >
                <FormControlLabel value="Sim" control={<Radio required />} label="Sim" />
                <FormControlLabel value="Não" control={<Radio required />} label="Não" />
              </RadioGroup>
            </FormControl>
            }
            <FormControl sx={{ margin: "0.3rem 0" }} fullWidth>
              <FormLabel id="radio-buttons-group-label4">
                Cliente já deu aceite no link da visita?
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="radio-buttons-group-label4"
                defaultValue="Sim"
                name="radio-buttons-group4"
                value={confirm4 ? confirm4 : ''}
                onChange={(e) => setConfirm4(e.target.value)}
              >
                <FormControlLabel value="Sim" control={<Radio required />} label="Sim" />
                <FormControlLabel value="Não" control={<Radio required />} label="Não" />
              </RadioGroup>
            </FormControl>
          <FormControlLabel className={styles.check_form} control={<Checkbox
            checked={checked}
            required
            sx={{ fontSize: '0.8rem' }}
            onChange={(e) => setChecked(e.target.checked)}
            inputProps={{ 'aria-label': 'controlled' }}
          />} label="Declaro que os dados fornecidos foram preenchidos com precisão e assumo total responsabilidade por sua veracidade." />
        </div>
          </ThemeProvider>
          <ThemeProvider theme={theme}>
          <DialogActions sx={{ justifyContent: 'center' }}>
          <Button type="submit">Confirmar</Button>
          <Button onClick={() => close()}>Cancelar</Button>
        </DialogActions>
          </ThemeProvider>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Requirement;
