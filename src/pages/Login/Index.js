import { useForm } from "react-hook-form"; // cria formulário personalizado
import * as yup from "yup"; // cria validações para formulário
import { yupResolver } from "@hookform/resolvers/yup"; // aplica as validações no formulário
import Swal from "sweetalert2"; // cria alertas personalizado
import { auth } from "../../firebase/database";
import useAuth from "../../hooks/useAuth";
import { signInWithEmailAndPassword } from "firebase/auth";

import Logo from "../../images/LogoIEB.jpg";

import "./_style.scss";

const schema = yup
  .object({
    email: yup
      .string()
      .required("O email é obrigatório")
      .email("Digite um email válido"),
    pass: yup.string().required("A senha é obrigatória"),
  })
  .required();

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const { setUser } = useAuth();

  const formSubmit = async (userData, e) => {
    // e.preventDefault();
    let errorMessageAuth;
    await signInWithEmailAndPassword(auth, userData.email, userData.pass)
      .then((userCredential) => {
        // Signed in
        document.location.replace("/");
        const userFB = userCredential.user;
        const { uid, displayName, email } = userFB;
        return setUser({
          id: uid,
          name: displayName,
          email: email,
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === "auth/user-not-found") {
          errorMessageAuth = "Usuário não cadastrado";
        } else if (errorCode === "auth/wrong-password") {
          errorMessageAuth = "Senha incorreta";
        } else if (errorCode === "auth/too-many-requests") {
          errorMessageAuth =
            "O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Você pode restaurá-lo imediatamente redefinindo sua senha ou pode tentar novamente mais tarde.";
        }
        if (errorCode) {
          Swal.fire({
            title: "Infinit Energy Brasil",
            text: errorMessageAuth,
            icon: "error",
            showConfirmButton: true,
            confirmButtonColor: "#F39200",
          });
        }
      });
  };

  return (
    <div className="container-login">
      <div className="box-login">
        <img className="logo-IEB" src={Logo} alt="" />
        <div className="title-login">
          <h2>VISITA TÉCNICA</h2>
          <h2>AGENDA</h2>
        </div>
        <form className="form-login" onSubmit={handleSubmit(formSubmit)}>
          <label className="form-login__label">
            <input
              className="form-login__text"
              style={
                errors.email && {
                  borderBottom: "1px solid red",
                }
              }
              type="text"
              placeholder="Digite o email"
              autoComplete="off"
              {...register("email")}
            />
            {errors.email && (
              <span className="message-error">{errors.email?.message}</span>
            )}
          </label>
          <label className="form-login__label">
            <input
              className="form-login__text"
              style={
                errors.pass && {
                  borderBottom: "1px solid red",
                }
              }
              type="password"
              placeholder="Digite a senha"
              autoComplete="off"
              {...register("pass")}
            />
            {errors.pass && (
              <span className="message-error">{errors.pass?.message}</span>
            )}
          </label>
          <button className="form-login__btn" type="submit">
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
