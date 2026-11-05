import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";

/**
 * Obtém a lista opcional de e-mails administrativos configurados via variável de ambiente
 * (VITE_ADMIN_EMAILS="pesquisador@ufmt.br,coord@ufmt.br").
 * Não armazena credenciais ou e-mails fixos no código-fonte público.
 *
 * @returns {Array<string>}
 */
function getAllowedAdminEmailsFromEnv() {
  const raw = import.meta.env.VITE_ADMIN_EMAILS;
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Verifica se o usuário autenticado no Firebase Authentication possui autorização
 * administrativa para acessar o Painel de Estatísticas da Pesquisa.
 *
 * Critérios de autorização (em camadas):
 * 1. Custom Claim `admin === true` no token JWT do Firebase Auth; OU
 * 2. Documento ativo na coleção `/admins/{uid}` ou `/admins/{email}` no Firestore; OU
 * 3. E-mail listado em `VITE_ADMIN_EMAILS` (quando definido no ambiente); OU
 * 4. Caso nenhuma lista restritiva (`VITE_ADMIN_EMAILS` ou `/config/admin_policy`) esteja ativa,
 *    qualquer conta previamente provisionada pelo pesquisador no Console do Firebase Authentication
 *    (já que a aplicação não possui cadastro público de contas).
 *
 * @param {import("firebase/auth").User | null} user
 * @returns {Promise<{ authorized: boolean, reason: string, role: string }>}
 */
export async function verificarAutorizacaoAdmin(user) {
  if (!user) {
    return {
      authorized: false,
      reason: "Usuário não autenticado.",
      role: "guest"
    };
  }

  try {
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult?.claims?.admin === true) {
      return {
        authorized: true,
        reason: "Autorizado via credencial administrativa (Custom Claim).",
        role: "admin"
      };
    }
  } catch (err) {
    console.warn("Aviso ao inspecionar claims do token:", err);
  }

  const userEmail = (user.email || "").trim().toLowerCase();
  const envAllowedEmails = getAllowedAdminEmailsFromEnv();

  // Se houver lista de e-mails definida em variável de ambiente, valida contra ela
  if (envAllowedEmails.length > 0) {
    if (userEmail && envAllowedEmails.includes(userEmail)) {
      return {
        authorized: true,
        reason: "Autorizado via política de e-mails administrativos do ambiente.",
        role: "admin"
      };
    }
    return {
      authorized: false,
      reason: `A conta "${userEmail || user.uid}" não consta na lista de administradores autorizados.`,
      role: "unauthorized"
    };
  }

  // Verifica na coleção '/admins/{uid}' ou '/admins/{email}' no Firestore
  try {
    const uidDoc = await getDoc(doc(db, "admins", user.uid));
    if (uidDoc.exists() && uidDoc.data()?.autorizado !== false) {
      return {
        authorized: true,
        reason: "Autorizado via registro na coleção 'admins' (UID).",
        role: uidDoc.data()?.role || "admin"
      };
    }

    if (userEmail) {
      const emailDoc = await getDoc(doc(db, "admins", userEmail));
      if (emailDoc.exists() && emailDoc.data()?.autorizado !== false) {
        return {
          authorized: true,
          reason: "Autorizado via registro na coleção 'admins' (E-mail).",
          role: emailDoc.data()?.role || "admin"
        };
      }
    }

    // Verifica se existe uma política restritiva ativa em '/config/admin_policy'
    const policyDoc = await getDoc(doc(db, "config", "admin_policy"));
    if (policyDoc.exists() && policyDoc.data()?.requireExplicitAdminDoc === true) {
      return {
        authorized: false,
        reason: "Esta conta não possui permissão administrativa registrada na coleção 'admins'.",
        role: "unauthorized"
      };
    }
  } catch (firestoreErr) {
    // Se a coleção admins/config não puder ser lida ou não existir, prossegue com a conta provisionada no Firebase Auth
    console.debug("Verificação complementar de política admin:", firestoreErr?.code || firestoreErr);
  }

  // Conta provisionada diretamente no Firebase Authentication do projeto (sem auto-cadastro público)
  return {
    authorized: true,
    reason: "Autorizado via conta administrativa do Firebase Authentication.",
    role: "researcher"
  };
}

/**
 * Realiza login administrativo com E-mail e Senha via Firebase Authentication
 * e valida a autorização administrativa da conta.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object, authStatus: Object }>}
 */
export async function loginAdminComEmail(email, password) {
  const emailLimpo = (email || "").trim();
  if (!emailLimpo || !password) {
    throw new Error("Informe o e-mail e a senha administrativa.");
  }

  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, emailLimpo, password);
  } catch (err) {
    if (
      err.code === "auth/invalid-credential" ||
      err.code === "auth/user-not-found" ||
      err.code === "auth/wrong-password"
    ) {
      throw new Error("Credenciais inválidas. Verifique seu e-mail e senha.");
    }
    if (err.code === "auth/too-many-requests") {
      throw new Error("Muitas tentativas de acesso. Aguarde alguns instantes e tente novamente.");
    }
    if (err.code === "auth/invalid-email") {
      throw new Error("O formato do e-mail informado é inválido.");
    }
    throw new Error(`Falha na autenticação: ${err.message}`);
  }

  const authStatus = await verificarAutorizacaoAdmin(credential.user);
  if (!authStatus.authorized) {
    await signOut(auth);
    throw new Error(authStatus.reason || "Acesso negado: conta sem privilégios administrativos.");
  }

  return {
    user: credential.user,
    authStatus
  };
}

/**
 * Realiza login administrativo com conta Google via Firebase Authentication
 * e valida a autorização administrativa da conta.
 *
 * @returns {Promise<{ user: Object, authStatus: Object }>}
 */
export async function loginAdminComGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  let credential;
  try {
    credential = await signInWithPopup(auth, provider);
  } catch (err) {
    if (err.code === "auth/popup-closed-by-user") {
      throw new Error("A janela de autenticação foi fechada antes da conclusão.");
    }
    if (err.code === "auth/operation-not-allowed") {
      throw new Error(
        "O login com Google não está habilitado no Console do Firebase Authentication. Utilize E-mail e Senha ou habilite o provedor Google."
      );
    }
    throw new Error(`Falha ao autenticar com Google: ${err.message}`);
  }

  const authStatus = await verificarAutorizacaoAdmin(credential.user);
  if (!authStatus.authorized) {
    await signOut(auth);
    throw new Error(authStatus.reason || "Acesso negado: conta sem privilégios administrativos.");
  }

  return {
    user: credential.user,
    authStatus
  };
}

/**
 * Encerra a sessão administrativa ativa.
 *
 * @returns {Promise<void>}
 */
export async function logoutAdmin() {
  await signOut(auth);
}

/**
 * Observa alterações no estado de autenticação e valida autorização administrativa.
 *
 * @param {function({ user: Object|null, authorized: boolean, loading: boolean, reason: string }): void} callback
 * @returns {function(): void} Unsubscribe
 */
export function observarEstadoAuthAdmin(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({
        user: null,
        authorized: false,
        loading: false,
        reason: "Aguardando autenticação."
      });
      return;
    }

    const status = await verificarAutorizacaoAdmin(user);
    if (!status.authorized) {
      callback({
        user: null,
        authorized: false,
        loading: false,
        reason: status.reason
      });
      return;
    }

    callback({
      user,
      authorized: true,
      loading: false,
      reason: status.reason
    });
  });
}

