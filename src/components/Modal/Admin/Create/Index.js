import { setDoc, doc } from "firebase/firestore";
import React, { useState } from "react";
import Swal from "sweetalert2"; // cria alertas personalizado
import { auth } from "../../../../firebase/database";
import { dataBase } from "../../../../firebase/database";
import { Company } from "../../../../data/Data";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import "../../_modal.scss";

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
import { theme } from '../../../../data/theme';
import { ThemeProvider } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import styles from "./styles.module.scss";

const CreateAdmin = ({ members, open, close, openBox  }) => {
  // const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [cargo, setCargo] = useState("Vendedor(a)");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [idCRM, setIdCRM] = useState("");
  const [telefone, setTelefone] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [cor, setCor] = useState("#000000");

  const onSubmit = async (e) => {
    e.preventDefault();
    close()
    const findEmail = members.find((member) => member.email === email);
    if (findEmail) {
      Swal.fire({
        title: Company,
        html: `O email <b>${email}</b> já está cadastrado no sistema.`,
        icon: "warning",
        showConfirmButton: true,
        showCloseButton: true,
        confirmButtonColor: "#F39200",
      });
      return openBox('create');
    } else {
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
                setDoc(doc(dataBase, "Membros", user.uid), {
                  email: email,
                  nome: nome,
                  senha: senha,
                  cor: cor,
                  veiculo: veiculo,
                  cargo: cargo,
                  uid: user.uid,
                  relatorio: 0,
                  id_sm: idCRM,
                  telefone: telefone
                });
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
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload(true); // Recarrega a pagina
              }
            });
          } else {
            openBox('create')
          }
        });
      } catch (error) {
        // console.log(error);
      }
    }
  };

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
          label="Email"
          type="text"
          value={email ? email : ''}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          variant="outlined"
        />
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
              value={cargo ? cargo : ''}
              label="Cargo"
              onChange={(e) => setCargo(e.target.value)}
              required
            >
              <MenuItem value="Vendedor(a)">Vendedor(a)</MenuItem>
              <MenuItem value="Técnico">Técnico</MenuItem>
              <MenuItem value="Administrador">Administrador</MenuItem>
            </Select>
          </FormControl>
            <TextField
            autoFocus
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
          />
        <div className={styles.label_content}>
          <div>
            <span>Telefone</span>
            <PatternFormat
              className="label__input"
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
          <div>
          <span>Cor</span>
          <input type="color"
            className={styles.color}
            value={cor ? cor : ''}
            style={{ backgroundColor: cor }}
            onChange={(e) => setCor(e.target.value)}
            required
          />
             <p className={styles.name_color}>{nome && nome}</p>
          </div>
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
