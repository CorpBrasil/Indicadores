import { setDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2"; // cria alertas personalizado
import { auth } from "../../../../firebase/database";
import { dataBase } from "../../../../firebase/database";
import { Company } from "../../../../data/Data";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { listCidades } from "../../../../data/Data";

import "../../_modal.scss";

import Dialog from "@mui/material/Dialog";
import { PatternFormat } from "react-number-format";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { theme } from '../../../../data/theme';
import { ThemeProvider } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import styles from "./styles.module.scss";

const CreateAdmin = ({ members, open, close, openBox}) => {
  // const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [cargo, setCargo] = useState("Indicador");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [idCRM, setIdCRM] = useState("");
  const [telefone, setTelefone] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [idCidade, setidCidade] = useState("");
  const [cidade, setCidade] = useState({ code: '01', cidade: 'Tietê' });
  const [checkID, setCheckID] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [checkCidade, setCheckCidade] = useState(false);
  const [indicadores, setIndicadores] = useState([]);
  const [orcamentistaRef, setOrcamentistaRef] = useState([]);
  const [orcamentista, setOrcamentista] = useState([]);

  console.log(idCidade);

useEffect(() => {
  if(idCidade) {
    if(members && members.find((data) => data.id_user === cidade.code + ' - ' + idCidade)) {
      setCheckID(true);
    } else {
      setCheckID(false);
    }
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
},[idCidade])

useEffect(() => {
  const fethData = () => {
    setIndicadores(members && members.filter((data) => data.cargo === 'Indicador'))
    setOrcamentistaRef(members && members.filter((data) => data.cargo === 'Orçamentista'))
    setOrcamentista(members && members.filter((data) => data.cargo === 'Orçamentista'))
  }
  fethData();
},[members])



useEffect(() => {
    if(cidade === null) {
        setCheckCidade(true);
      } else {
        setCheckCidade(false);
        setTimeout(() => {
          setidCidade(indicadores && indicadores.find((data) => data.cidade.code === cidade.code) ? String(indicadores.filter((data) => data.cidade.code === cidade.code).length + 100) : '100')
        }, 100);
      }
  
// eslint-disable-next-line react-hooks/exhaustive-deps
},[cidade,indicadores])

useEffect(() => {
  if(email) {
    if(members && members.find((data) => data.email === email)) {
      setCheckEmail(true);
    } else {
      setCheckEmail(false);
    }
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
},[email])

console.log(orcamentista)

  const onSubmit = async (e) => {
    e.preventDefault();
    if(checkID || checkEmail || checkCidade){
      return null
    } else {
      close();
      try {
        Swal.fire({
          title: Company,
          text: `Você deseja cadastrar um novo Colaborador(a)?`,
          icon: "question",
          showCancelButton: true,
          showCloseButton: true,
          confirmButtonColor: "#F39200",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sim",
          cancelButtonText: "Não",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await createUserWithEmailAndPassword(
              auth,
              email,
              senha
            )
              .then((userCredential) => {
                // Signed in
                updateProfile(auth.currentUser, {
                  displayName: nome,
                })
                  .then(() => {})
                  .catch((error) => {
                    // console.error(error);
                  });
                const user = userCredential.user;
                let data;
                switch(cargo) {
                  case 'Indicador':
                    data = {
                      email: email,
                      nome: nome,
                      senha: senha,
                      cargo: cargo,
                      uid: user.uid,
                      relatorio: 0,
                      cidade: cidade,
                      id_user: cidade.code + ' - ' + idCidade,
                      telefone: telefone,
                      orcamentista: {
                        nome: orcamentista[0].nome,
                        uid: orcamentista[0].uid
                      },
                      cor: cidade.cor
                    }
                  break
                  case 'Orçamentista':
                    data = {
                      email: email,
                      nome: nome,
                      senha: senha,
                      cargo: cargo,
                      uid: user.uid,
                      relatorio: 0,
                      id_user: 0,
                      id_crm: idCRM,
                      telefone: telefone
                    }
                  break
                  case 'Closer':
                    data = {
                      email: email,
                      nome: nome,
                      id_user: 0,
                      senha: senha,
                      veiculo: veiculo,
                      cargo: cargo,
                      uid: user.uid,
                      relatorio: 0,
                      telefone: telefone
                    }
                  break
                  default: 
                    data = {
                      email: email,
                      nome: nome,
                      senha: senha,
                      id_user: 0,
                      cargo: cargo,
                      uid: user.uid,
                      relatorio: 0,
                      telefone: telefone
                    }
                }
                setDoc(doc(dataBase, "Membros", user.uid), data);
                // console.log(user);
                // ...
              })
              .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
                // ..
              });
            navigate("/");
            Swal.fire({
              title: Company,
              html: `O Colaborador(a) <b> ${nome}</b> foi cadastrado com sucesso.`,
              icon: "success",
              showConfirmButton: true,
              showCloseButton: true,
              confirmButtonColor: "#F39200",
            })
          } else {
            openBox('create')
          }
        });
      } catch (error) {
        // console.log(error);
      }
    }
    // const findEmail = members.find((member) => member.email === email);
    // if (findEmail) {
    //   Swal.fire({
    //     title: Company,
    //     html: `O email <b>${email}</b> já está cadastrado no sistema.`,
    //     icon: "warning",
    //     showConfirmButton: true,
    //     showCloseButton: true,
    //     confirmButtonColor: "#F39200",
    //   });
    //   return openBox('create');
    // } else {
    // }
  };

  console.log(cidade)

  return (
    <Dialog
      className={styles.dialog}
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={() => close()}
    >
      <IconButton
          aria-label="close"
          onClick={close}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        ><CloseIcon /></IconButton>
      <DialogTitle align="center">Cadastrar Colaborador(a)</DialogTitle>
      <DialogContent>
        {/* <DialogContentText sx={{ textAlign: "center" }}>
          Preencha os campos abaixo para agendar a <b>Visita</b>.
        </DialogContentText> */}
        <form onSubmit={onSubmit}>
        <ThemeProvider theme={theme}>
          <div className={styles.label_content}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Nome"
              type="text"
              value={nome ? nome : ''}
              onChange={(e) => setNome(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              autoFocus
              margin="dense"
              id="name"
              helperText={checkEmail ? 'Este email já está cadastrado' : ''}
              error={checkEmail}
              label="Email"
              type="email"
              value={email ? email : ''}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
          </div>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Senha"
          type="text"
          value={senha ? senha : ''}
          onChange={(e) => setSenha(e.target.value)}
          fullWidth
          required
          variant="outlined"
        />
          <FormControl sx={{ margin: "0.3rem 0" }} fullWidth>
            <InputLabel id="simple-select-label">Cargo</InputLabel>
            <Select
              labelId="simple-select-label"
              id="simple-select"
              sx={{ margin: '0.3rem 0' }}
              value={cargo ? cargo : ''}
              label="Ca"
              onChange={(e) => setCargo(e.target.value)}
              required
            >
              <MenuItem value="Indicador">Indicador</MenuItem>
              <MenuItem value="Orçamentista">Orçamentista</MenuItem>
              <MenuItem value="Closer">Especialista em Apresentação e Fechamento</MenuItem>
              <MenuItem value="Gestor">Gestor</MenuItem>
            </Select>
          </FormControl>
          {cargo && cargo === 'Indicador' && 
          <FormControl sx={{ margin: "0.3rem 0" }} fullWidth>
            <InputLabel id="simple-select-label">Orçamentista</InputLabel>
            <Select
              labelId="simple-select-label"
              id="simple-select"
              sx={{ margin: '0.3rem 0' }}
              value={orcamentista ? orcamentista[0] : ''}
              label="Orçament"
              onChange={(e) => setOrcamentista(e.target.value)}
              required
              >
                {orcamentistaRef && orcamentistaRef.map((data) => (
                <MenuItem value={data}>{data.nome}</MenuItem>
                ))}
            </Select>
          </FormControl> 
          }
          <div className={styles.label_content}>
              {cargo && cargo === 'Indicador' && 
            <><Autocomplete
                disablePortal
                fullWidth
                sx={{ margin: '0.3rem 0' }}
                value={cidade ? cidade : { code: '00', cidade: 'Nenhuma' }}
                onChange={(event, newValue) => {
                  setCidade(newValue);
                } }
                color="primary"
                clearText='Escolha uma cidade'
                clearOnEscape={true}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.cidade + ' - ' + option.code}
                options={listCidades ? listCidades : ['']}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cidade"
                    required
                    helperText={checkCidade ? 'Selecione uma cidade' : ''}
                    error={checkCidade}
                    style={{ zindex: 111111 }}
                    color="primary" />
                    )} />
                <TextField
                  label="ID"
                  helperText={checkID ? 'Já existe um indicador com esse ID' : ''}
                  error={checkID}
                  fullWidth
                  required
                  value={idCidade ? idCidade : ''}
                  margin="dense"
                  id="outlined-start-adornment"
                  // onChange={(e) => setidCidade(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{cidade && cidade.code} - </InputAdornment>,
                  }}
                  />
                  </>
          }
          {cargo && cargo === 'Orçamentista' && 
            <TextField
            margin="dense"
            id="name"
            label="ID do CRM"
            type="number"
            value={idCRM ? idCRM : ''}
            onChange={(e) => setIdCRM(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />
          }
          {cargo && cargo === 'Closer' && 
            <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Veiculo"
            type="text"
            value={veiculo ? veiculo : ''}
            onChange={(e) => setVeiculo(e.target.value)}
            fullWidth
            required
            variant="outlined"
          />}
          </div>
        <div className={styles.label_content}>
          <div className={styles.input_telefone}>
            <span>Telefone</span>
            <PatternFormat
              onChange={(e) => setTelefone(e.target.value)}
              format="## (##) ##### ####"
              mask="_"
              placeholder="00 (00) 00000 0000"
              value={telefone ? telefone : ''}
              label="Telefone"
              minLength={9}
              variant="outlined"
              color="primary"
              required
            />
          </div>
          {/* <div>
          <span>Cor</span>
          <input type="color"
            className={styles.color}
            value={cor ? cor : ''}
            style={{ backgroundColor: cor }}
            onChange={(e) => setCor(e.target.value)}
            required
          />
             <p className={styles.name_color}>{nome && nome}</p>
          </div> */}
        </div>
          </ThemeProvider>
          <ThemeProvider theme={theme}>
          <DialogActions sx={{ justifyContent: 'center', marginTop: '1rem' }}>
          <Button type="submit">Confirmar</Button>
          <Button onClick={() => close()}>Cancelar</Button>
        </DialogActions>
          </ThemeProvider>
        </form>
      </DialogContent>
    </Dialog>
    // <div className="modal-visit">
    //   <div className="modal-box-visit">
    //     <div className="modal-box-visit__close">
    //       <button onClick={returnAdmin} className="btn-close" />
    //     </div>
    //     <h4>Cadastrar novo Colaborador</h4>
    //     <form className="form-visit" onSubmit={handleSubmit(onSubmit)}>
    //       <label className="form-visit__label">
    //         <input
    //           className="form-visit__text"
    //           type="text"
    //           placeholder="Digite o nome"
    //           autoComplete="off"
    //           onBlur={(e) => setNome(e.target.value)}
    //           required
    //           minLength={3}
    //         />
    //       </label>
    //       <label className="form-visit__label">
    //         <input
    //           className="form-visit__text"
    //           type="email"
    //           placeholder="Digite o email"
    //           autoComplete="off"
    //           {...register("email")}
    //           required
    //         />
    //       </label>
    //       <div className="form-visit__double">
    //         <label className="form-visit__label">
    //           <input
    //             className="form-visit__text"
    //             type="text"
    //             placeholder="Digite a senha"
    //             autoComplete="off"
    //             {...register("senha")}
    //             required
    //             minLength={6}
    //           />
    //         </label>
    //         <select
    //           value={cargo}
    //           name="cargo"
    //           onChange={(e) => setCargo(e.target.value)}
    //         >
    //           <option value="Vendedor(a)">Vendedor(a)</option>
    //           <option value="Técnico">Técnico</option>
    //           <option value="Administrador">Administrador</option>
    //         </select>
    //       </div>
    //       {cargo === "Vendedor(a)" || cargo === "Administrador" ? (
    //         <>
    //           <div className="form-visit__color">
    //             <p>Escolha uma cor de destaque</p>
    //             <input
    //               type="color"
    //               autoComplete="off"
    //               value={cor}
    //               onChange={(e) => setCor(e.target.value)}
    //               required
    //             />
    //           </div>
    //           {nome && (
    //             <div className="form-visit__exemple">
    //               <h3>Resultado:</h3>
    //               <p
    //                 style={
    //                   cor && {
    //                     backgroundColor: cor,
    //                     borderBottom: "1px solid" + cor,
    //                     borderRight: "1px solid" + cor,
    //                     borderLeft: "1px solid" + cor,
    //                     color: "#fff",
    //                     textShadow: "#5a5a5a -1px 0px 5px",
    //                   }
    //                 }
    //               >
    //                 {nome}
    //               </p>
    //             </div>
    //           )}
    //         </>
    //       ) : (
    //         <label className="form-visit__label">
    //           <input
    //             className="form-visit__text"
    //             type="number"
    //             placeholder="Digite o número do veículo"
    //             autoComplete="off"
    //             onInput={(e) => (e.target.value = e.target.value.slice(0, 3))}
    //             {...register("veiculo")}
    //             required
    //           />
    //         </label>
    //       )}
    //       <input className="form-visit__btn" type="submit" value="CRIAR" />
    //     </form>
    //   </div>
    // </div>
  );
};

export default CreateAdmin;
